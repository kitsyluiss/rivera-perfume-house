"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    rfhTrackEvent?: (name: string, properties?: Record<string, any>) => void;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

/**
 * Universal event tracker safe for browser execution.
 * Respects cookie consent if declined.
 */
export function trackEvent(name: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") return;

  try {
    const consent = localStorage.getItem("rivera_cookie_consent_v1");
    if (consent === "essential") {
      // User opted into essential cookies only
      return;
    }
  } catch {}

  // Google Analytics 4 event
  if (typeof window.gtag === "function" && GA_MEASUREMENT_ID) {
    window.gtag("event", name, properties);
  }

  // Fallback diagnostic dispatch in development
  if (process.env.NODE_ENV === "development") {
    console.debug(`[Analytics] Tracked: ${name}`, properties);
  }
}

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Attach global helper
  useEffect(() => {
    window.rfhTrackEvent = trackEvent;
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (!pathname) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    trackEvent("page_view", { page_path: url });
  }, [pathname, searchParams]);

  return (
    <>
      {/* Google Analytics 4 */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true
                });
              `,
            }}
          />
        </>
      )}

      {/* Cloudflare Web Analytics */}
      {CF_BEACON_TOKEN && (
        <Script
          strategy="afterInteractive"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={`{"token": "${CF_BEACON_TOKEN}"}`}
        />
      )}
    </>
  );
}
