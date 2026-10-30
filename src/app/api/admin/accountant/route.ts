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
    const { prompt, apiKey: clientApiKey, action = "chat", queryType } = body;

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
    const effectiveApiKey = clientApiKey || process.env.GEMINI_API_KEY;

    // If no prompt provided, default to executive overview
    const userPrompt =
      prompt ||
      "Please give me a complete executive financial audit and review for Rivera Fragrance House.";

    let reply = "";
    let modelUsed = "deterministic-engine";

    if (effectiveApiKey && effectiveApiKey.trim() !== "") {
      try {
        const systemPrompt = buildAccountantSystemPrompt(ledger);
        const aiResponse = await queryGeminiAccountant(userPrompt, systemPrompt, effectiveApiKey.trim());
        reply = aiResponse.text;
        modelUsed = aiResponse.modelUsed;
      } catch (aiErr: any) {
        console.warn("Gemini API call failed, falling back to deterministic CPA engine:", aiErr?.message);
        // Fallback to deterministic audit
        const fallbackType =
          queryType ||
          (userPrompt.toLowerCase().includes("p&l") || userPrompt.toLowerCase().includes("profit")
            ? "pnl"
            : userPrompt.toLowerCase().includes("reorder") || userPrompt.toLowerCase().includes("stock")
            ? "restock"
            : userPrompt.toLowerCase().includes("receivable") || userPrompt.toLowerCase().includes("order")
            ? "receivables"
            : "general");
        reply = generateDeterministicAudit(fallbackType, ledger);
        modelUsed = `deterministic-fallback (${aiErr?.message || "API busy"})`;
      }
    } else {
      // Deterministic generation
      const fallbackType =
        queryType ||
        (userPrompt.toLowerCase().includes("p&l") || userPrompt.toLowerCase().includes("profit")
          ? "pnl"
          : userPrompt.toLowerCase().includes("reorder") || userPrompt.toLowerCase().includes("stock")
          ? "restock"
          : userPrompt.toLowerCase().includes("receivable") || userPrompt.toLowerCase().includes("order")
          ? "receivables"
          : "general");
      reply = generateDeterministicAudit(fallbackType, ledger);
      modelUsed = "deterministic-engine";
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
