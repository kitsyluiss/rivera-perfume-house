import { NextResponse } from "next/server";
import { exchangeGoogleCodeForTokens } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const stateRaw = url.searchParams.get("state");

  let origin = url.origin;
  if (stateRaw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(stateRaw));
      if (parsed.origin) origin = parsed.origin;
    } catch {
      // Ignore JSON parse errors
    }
  }

  if (error || !code) {
    console.error("Google OAuth Callback Error:", error || "Missing code");
    return NextResponse.redirect(
      new URL(`/admin?tab=accountant&oauth_error=${encodeURIComponent(error || "access_denied")}`, origin)
    );
  }

  try {
    const tokens = await exchangeGoogleCodeForTokens(code, origin);

    const redirectResponse = NextResponse.redirect(
      new URL("/admin?tab=accountant&oauth=success", origin)
    );

    const isProd = process.env.NODE_ENV === "production";

    // Set refresh token cookie (1 year)
    if (tokens.refresh_token) {
      redirectResponse.cookies.set("rivera_sheets_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    // Set access token cookie
    if (tokens.access_token) {
      redirectResponse.cookies.set("rivera_sheets_access_token", tokens.access_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: tokens.expires_in || 3600,
      });
    }

    return redirectResponse;
  } catch (err: any) {
    console.error("Token Exchange Error:", err);
    return NextResponse.redirect(
      new URL(`/admin?tab=accountant&oauth_error=${encodeURIComponent(err.message || "exchange_failed")}`, origin)
    );
  }
}
