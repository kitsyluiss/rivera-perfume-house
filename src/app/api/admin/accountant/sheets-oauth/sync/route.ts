import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { calculateFinancialLedger } from "@/lib/accountant-engine";
import {
  syncToGoogleSheetsViaOAuth,
  refreshGoogleAccessToken,
} from "@/lib/google-sheets";
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

    const cookieStore = await cookies();
    let accessToken = cookieStore.get("rivera_sheets_access_token")?.value;
    const refreshToken = cookieStore.get("rivera_sheets_refresh_token")?.value;

    const body = await req.json().catch(() => ({}));
    const clientAccessToken = body?.accessToken;
    const clientSpreadsheetId = body?.spreadsheetId;

    if (clientAccessToken) {
      accessToken = clientAccessToken;
    }

    // Refresh access token if missing but refresh token exists
    if (!accessToken && refreshToken) {
      try {
        const refreshed = await refreshGoogleAccessToken(refreshToken);
        accessToken = refreshed.access_token;
      } catch (err: any) {
        return NextResponse.json(
          {
            error:
              "Google session expired. Please click 'Connect Google Account' to re-authenticate.",
          },
          { status: 401 }
        );
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            "Not connected to Google Sheets. Please click 'Connect Google Account' first.",
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

    // Calculate live ledger
    const ledger = calculateFinancialLedger(perfumes, sales, orders);

    // Sync via Google Sheets API v4
    const result = await syncToGoogleSheetsViaOAuth(
      accessToken,
      ledger,
      clientSpreadsheetId
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Google Sheets OAuth Sync Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to sync to Google Sheets via OAuth" },
      { status: 500 }
    );
  }
}
