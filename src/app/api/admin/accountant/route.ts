import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  calculateFinancialLedger,
  buildAccountantSystemPrompt,
  queryGeminiAccountant,
  generateDeterministicAudit,
} from "@/lib/accountant-engine";
import { Perfume, Sale, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { prompt, apiKey: clientApiKey, action = "chat", queryType, history } = body;

    // Fetch live inventory, sales, and orders
    const [perfumesRes, salesRes, ordersRes] = await Promise.all([
      supabase.from("perfumes").select("*").order("created_at", { ascending: false }),
      supabase.from("sales").select("*, perfume:perfumes(brand, scent_name)").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false }),
    ]);

    if (perfumesRes.error) throw new Error(perfumesRes.error.message);
    if (salesRes.error) throw new Error(salesRes.error.message);
    if (ordersRes.error) throw new Error(ordersRes.error.message);

    const perfumes = (perfumesRes.data ?? []) as Perfume[];
    const sales = (salesRes.data ?? []).map((s: any) => ({
      ...s,
      brand: s.perfume?.brand,
      scent_name: s.perfume?.scent_name,
    })) as Sale[];
    const orders = (ordersRes.data ?? []) as Order[];

    // Calculate deterministic ledger
    const ledger = calculateFinancialLedger(perfumes, sales, orders);

    // If client requested ledger summary only (e.g. for dashboard bento cards)
    if (action === "summary") {
      return NextResponse.json({
        success: true,
        ledger,
      });
    }

    // Determine API Key priority: Client provided > Process ENV
    const effectiveApiKey =
      clientApiKey && typeof clientApiKey === "string" && clientApiKey.trim() !== ""
        ? clientApiKey.trim()
        : process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ""
        ? process.env.GEMINI_API_KEY.trim()
        : undefined;

    // If no prompt provided, default to executive overview
    const userPrompt =
      prompt ||
      "Please give me a complete executive financial audit and review for Rivera Fragrance House.";

    const lowerPrompt = userPrompt.toLowerCase();

    // Determine if query is an executive directive
    const isExecutiveDirective =
      queryType &&
      [
        "pnl",
        "inventory",
        "receivables",
        "restock",
        "brands",
        "champions",
        "forensic",
        "receipt",
      ].includes(queryType);

    // Intent detection for standard reports requested via chat
    const detectedReportType =
      isExecutiveDirective
        ? (queryType as any)
        : lowerPrompt.includes("inventory valuation") ||
          lowerPrompt.includes("inventory breakdown") ||
          lowerPrompt.includes("inventory list") ||
          lowerPrompt.includes("show all inventory") ||
          lowerPrompt.includes("what perfumes do we have") ||
          lowerPrompt.includes("all perfumes") ||
          lowerPrompt.includes("catalog list") ||
          lowerPrompt.includes("stock breakdown")
        ? "inventory"
        : lowerPrompt.includes("brand capital") ||
          lowerPrompt.includes("brand allocation") ||
          lowerPrompt.includes("break down our inventory capital allocation")
        ? "brands"
        : lowerPrompt.includes("top margin") ||
          lowerPrompt.includes("margin champions") ||
          lowerPrompt.includes("top sellers") ||
          lowerPrompt.includes("top profit")
        ? "champions"
        : lowerPrompt.includes("multi-step") ||
          lowerPrompt.includes("income statement") ||
          lowerPrompt.includes("p&l")
        ? "pnl"
        : lowerPrompt.includes("forensic") ||
          lowerPrompt.includes("anomalies") ||
          lowerPrompt.includes("audit anomalies")
        ? "forensic"
        : lowerPrompt.includes("bir store receipt") ||
          lowerPrompt.includes("store receipt format") ||
          lowerPrompt.includes("sample receipt")
        ? "receipt"
        : lowerPrompt.includes("restock forecast") ||
          lowerPrompt.includes("reorder budget") ||
          lowerPrompt.includes("low-stock fragrances") ||
          lowerPrompt.includes("wholesale replenishment")
        ? "restock"
        : lowerPrompt.includes("reconcile receivables") ||
          lowerPrompt.includes("pending customer orders") ||
          lowerPrompt.includes("accounts receivable")
        ? "receivables"
        : null;

    let reply = "";
    let modelUsed = "deterministic-cpa-engine";

    // If an executive report was requested directly via directive pill or explicit prompt intent
    if (detectedReportType) {
      reply = generateDeterministicAudit(detectedReportType, ledger);
      return NextResponse.json({
        success: true,
        reply,
        modelUsed: "deterministic-cpa-engine",
        ledger,
      });
    }

    // For free-form conversational queries, query Gemini with full grounded catalog
    if (effectiveApiKey && effectiveApiKey.trim() !== "") {
      try {
        const systemPrompt = buildAccountantSystemPrompt(ledger);
        const aiResponse = await queryGeminiAccountant(
          userPrompt,
          systemPrompt,
          effectiveApiKey.trim(),
          history
        );
        reply = aiResponse.text;
        modelUsed = aiResponse.modelUsed;
      } catch (aiErr: any) {
        console.warn("Gemini API call failed, falling back to deterministic CPA engine:", aiErr?.message);
        reply = generateDeterministicAudit("general", ledger);
        modelUsed = `deterministic-fallback (${aiErr?.message || "API busy"})`;
      }
    } else {
      reply = generateDeterministicAudit("general", ledger);
      modelUsed = "deterministic-cpa-engine";
    }

    return NextResponse.json({
      success: true,
      reply,
      modelUsed,
      ledger,
    });
  } catch (error: any) {
    console.error("Accountant API Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { handleSheetsFeed } = await import("@/lib/sheets-feed-handler");
  return handleSheetsFeed(req);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

