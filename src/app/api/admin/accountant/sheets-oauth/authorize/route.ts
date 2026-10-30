import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildGoogleOAuthConsentUrl } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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

    const url = new URL(req.url);
    const clientOrigin = url.searchParams.get("origin");
    const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const rawOrigin = clientOrigin || (forwardedHost ? `https://${forwardedHost}` : url.origin);
    const authUrl = buildGoogleOAuthConsentUrl(rawOrigin);

    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    console.error("OAuth Authorize Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
