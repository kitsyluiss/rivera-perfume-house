import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("rivera_sheets_refresh_token");
  cookieStore.delete("rivera_sheets_access_token");
  return NextResponse.json({ success: true, message: "Disconnected from Google account." });
}
