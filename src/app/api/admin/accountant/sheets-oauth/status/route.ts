import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getGoogleOAuthCredentials } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("rivera_sheets_refresh_token")?.value;
    const accessToken = cookieStore.get("rivera_sheets_access_token")?.value;

    const { clientId, clientSecret } = getGoogleOAuthCredentials();
    const isConfigured = Boolean(clientId && clientSecret);

    return NextResponse.json({
      connected: Boolean(refreshToken || accessToken),
      configured: isConfigured,
      clientId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
