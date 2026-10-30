import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateFinancialLedger } from "@/lib/accountant-engine";
import { prepareGoogleSheetsPayload } from "@/lib/google-sheets";
import { Perfume, Sale, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tab = url.searchParams.get("tab") || "summary";

    // Use anon Supabase client for reading inventory and sales
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zmlauqxxktmhyjxqovek.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [perfumesRes, salesRes, ordersRes] = await Promise.all([
      supabase.from("perfumes").select("*").order("created_at", { ascending: false }),
      supabase.from("sales").select("*, perfume:perfumes(brand, scent_name)").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false }),
    ]);

    const perfumes = (perfumesRes.data ?? []) as Perfume[];
    const sales = (salesRes.data ?? []).map((s: any) => ({
      ...s,
      brand: s.perfume?.brand,
      scent_name: s.perfume?.scent_name,
    })) as Sale[];
    const orders = (ordersRes.data ?? []) as Order[];

    const ledger = calculateFinancialLedger(perfumes, sales, orders);
    const payload = prepareGoogleSheetsPayload(ledger);

    let rows: any[][] = [];
    if (tab === "brands" || tab === "brand_allocation") {
      rows = payload.sheets.Brand_Allocation;
    } else if (tab === "restock" || tab === "restock_forecast") {
      rows = payload.sheets.Restock_Forecast;
    } else if (tab === "top_sellers" || tab === "top_profit_makers") {
      rows = payload.sheets.Top_Profit_Makers;
    } else {
      rows = payload.sheets.Executive_Summary;
    }

    // Convert rows to standard CSV
    const csvLines = rows.map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return '""';
          const str = String(cell).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",")
    );

    const csvContent = csvLines.join("\r\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "Content-Disposition": `inline; filename="rivera-${tab}.csv"`,
      },
    });
  } catch (err: any) {
    return new Response(`Error generating sheets feed: ${err.message}`, { status: 500 });
  }
}
