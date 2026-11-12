import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFragranceDNA } from "@/lib/fragrance-dna";
import { getPerfumeSlug } from "@/lib/slug";
import { AI_PROMPT_LAYERS } from "@/lib/ai/prompt-layers.generated";

const NIM_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const FALLBACK_MODEL = "nvidia/nemotron-3.5-bolt-e4b";
const FALLBACK_REPLY =
  "The sommelier is taking a short break — please try again in a moment.";

interface InventoryRow {
  id: string;
  brand: string;
  scent_name: string;
  season: string | null;
  target_sale_price: number;
  flash_sale_price: number | null;
  flash_sale_end: string | null;
}

// ponytail: no persistent rate limit — Workers isolates make shared counters
// non-trivial; input caps + max_tokens bound abuse for now.
const WMO: Record<number, string> = {
  0: "clear skies", 1: "mostly clear", 2: "partly cloudy", 3: "overcast",
  45: "foggy", 48: "foggy", 51: "light drizzle", 53: "drizzle", 55: "heavy drizzle",
  61: "light rain", 63: "rain", 65: "heavy rain", 80: "rain showers",
  81: "rain showers", 82: "violent showers", 95: "thunderstorms",
  96: "thunderstorms with hail", 99: "severe thunderstorms",
};

async function getManilaWeather(): Promise<string> {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=14.5995&longitude=120.9842" +
        "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m" +
        "&timezone=Asia%2FManila",
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error(String(res.status));
    const w = (await res.json()) as {
      current: Record<string, number>;
    };
    const c = w.current;
    return `LIVE WEATHER (Metro Manila, right now): ${Math.round(c.temperature_2m)}°C ` +
      `(feels like ${Math.round(c.apparent_temperature)}°C), humidity ${Math.round(c.relative_humidity_2m)}%, ` +
      `${WMO[c.weather_code] ?? "changeable skies"}, wind ${Math.round(c.wind_speed_10m)} km/h.`;
  } catch {
    return "LIVE WEATHER: unavailable — do not mention weather in your reply.";
  }
}

export async function POST(req: Request) {
  let body: { message?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const message = body.message;
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Empty message." }, { status: 400 });
  }
  const userMessage = message.trim().slice(0, 500);

  // Conversation memory: last few turns so follow-ups can avoid repeats.
  const history = Array.isArray(body.history) ? body.history : [];
  const priorTurns = history
    .filter(
      (t): t is { role: "user" | "assistant"; content: string } =>
        !!t &&
        typeof t === "object" &&
        ((t as { role?: unknown }).role === "user" ||
          (t as { role?: unknown }).role === "assistant") &&
        typeof (t as { content?: unknown }).content === "string"
    )
    .slice(-10)
    .map((t) => ({
      role: t.role,
      // 1600 chars covers a 10-item reply; shorter caps amputate the tail
      // and re-expose already-recommended items.
      content: t.content.slice(0, 1600),
    }));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfumes")
    .select(
      "id, brand, scent_name, season, target_sale_price, flash_sale_price, flash_sale_end"
    )
    .gt("quantity", 0);
  if (error || !data) {
    console.error("[suggest] inventory fetch failed:", error?.message);
    return NextResponse.json({ error: "Inventory unavailable." }, { status: 500 });
  }

  const now = Date.now();
  const inventory = (data as InventoryRow[]).map((p) => {
    const dna = getFragranceDNA(p.scent_name);
    const flashActive =
      p.flash_sale_price != null &&
      p.flash_sale_end != null &&
      new Date(p.flash_sale_end).getTime() > now;
    return {
      scent_name: p.scent_name,
      brand: p.brand,
      season: p.season ?? null,
      price: flashActive ? p.flash_sale_price : p.target_sale_price,
      ...(flashActive ? { deal: "flash sale price" } : {}),
      description: dna.description,
      accords: dna.accords.slice(0, 5).map((a) => `${a.name} ${a.value}%`),
      notes: dna.notes,
    };
  });

  const weather = await getManilaWeather();
  // Names already surfaced in prior assistant turns, parsed from history text:
  // prompt rule alone was too soft, so repeats are also filtered in code.
  const knownNames = new Set(inventory.map((i) => i.scent_name.toLowerCase()));
  const alreadyRecommended = new Set<string>();
  for (const t of priorTurns) {
    if (t.role !== "assistant") continue;
    const lower = t.content.toLowerCase();
    for (const name of knownNames) if (lower.includes(name)) alreadyRecommended.add(name);
  }
  const systemPrompt =
    AI_PROMPT_LAYERS.join("\n\n---\n\n") +
    `\n\n## ${weather}\n\n## AVAILABLE INVENTORY (the ONLY products you may recommend)\n` +
    JSON.stringify(inventory) +
    (alreadyRecommended.size
      ? `\n\n## DO NOT REPEAT — already recommended in this conversation\n${[...alreadyRecommended].join(", ")}\nOnly mention these if the customer asks for that exact item again.`
      : "");

  try {
    const res = await fetch(NIM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY ?? ""}`,
      },
      signal: AbortSignal.timeout(45000),
      body: JSON.stringify({
        model: process.env.NVIDIA_SUGGEST_MODEL || FALLBACK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...priorTurns,
          { role: "user", content: userMessage },
        ],
        temperature: 0.6,
        top_p: 0.9,
        max_tokens: 900,
        chat_template_kwargs: { thinking: false },
      }),
    });
    if (!res.ok) throw new Error(`NIM ${res.status}`);
    const json = (await res.json()) as {
      choices?: {
        message?: { content?: string | null; reasoning_content?: string | null };
      }[];
    };
    const raw = json.choices?.[0]?.message ?? {};
    const reply = String(raw.content ?? "")
      .replace(/ [\s\S]*?<\/think>/gi, "")
      .replace(/\*\*/g, "")
      .trim();
    if (!reply) return NextResponse.json({ reply: FALLBACK_REPLY, picks: [] });

    // Code-level guarantee: only scent names that exist in the live inventory
    // can surface as picks, whatever the model outputs.
    const picksLine = [...reply.matchAll(/^\s*PICKS:(.+)$/gm)].pop()?.[1] ?? "";
    const picks = picksLine
      .split("|")
      .map((n) => n.trim().toLowerCase())
      .filter(Boolean)
      .map((name) => (data as InventoryRow[]).find(
        (p) => p.scent_name.toLowerCase() === name
      ))
      .filter((p): p is InventoryRow => Boolean(p))
      // ponytail: code-level no-repeat backstop; a customer re-asking for the
      // same item loses its chip but the reply text still names it.
      .filter((p) => !alreadyRecommended.has(p.scent_name.toLowerCase()))
      .slice(0, 10)
      .map((p) => {
        const flashActive =
          p.flash_sale_price != null &&
          p.flash_sale_end != null &&
          new Date(p.flash_sale_end).getTime() > now;
        return {
          id: p.id,
          slug: getPerfumeSlug(p),
          scent_name: p.scent_name,
          brand: p.brand,
          price: flashActive ? p.flash_sale_price : p.target_sale_price,
        };
      });

    const cleanReply = reply.replace(/^\s*PICKS:.*$/gm, "").trim();
    return NextResponse.json({ reply: cleanReply, picks });
  } catch (e) {
    console.error("[suggest] NIM call failed:", e);
    return NextResponse.json({ error: FALLBACK_REPLY }, { status: 502 });
  }
}
