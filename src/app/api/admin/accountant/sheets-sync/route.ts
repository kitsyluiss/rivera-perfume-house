import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateFinancialLedger } from "@/lib/accountant-engine";
import { syncToGoogleSheetsWebhook, getGoogleAppsScriptTemplate } from "@/lib/google-sheets";
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { webhookUrl: clientWebhookUrl, action = "sync" } = body;

    // Return the Apps Script code template if requested
    if (action === "get_script") {
      return NextResponse.json({
        success: true,
        script: getGoogleAppsScriptTemplate(),
      });
    }

    const webhookUrl =
      (clientWebhookUrl && typeof clientWebhookUrl === "string" && clientWebhookUrl.trim()) ||
      process.env.GOOGLE_SHEET_WEBHOOK_URL;

    if (!webhookUrl || webhookUrl.trim() === "") {
      return NextResponse.json(
        {
          error:
            "No Google Sheets Webhook URL provided. Please enter your Google Apps Script Web App URL in settings.",
        },
        { status: 400 }
      );
    }

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

    // Compute live ledger
    const ledger = calculateFinancialLedger(perfumes, sales, orders);

    // Sync to Google Sheets
    const result = await syncToGoogleSheetsWebhook(webhookUrl.trim(), ledger);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Google Sheets Sync Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to sync to Google Sheets" },
      { status: 500 }
    );
  }
}
