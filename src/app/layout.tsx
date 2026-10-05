import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/actions";
import { Toaster } from "sonner";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://riverafragrances.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rivera Fragrance House | 100% Authentic Perfumes Philippines",
    template: "%s | Rivera Fragrance House",
  },
  description:
    "Your trusted family source for 100% original Middle Eastern & designer perfumes in the Philippines. Guaranteed factory-sealed boxes, verified batch codes, direct wholesale rates & fast nationwide delivery.",
  keywords: [
    "perfumes philippines",
    "authentic perfumes manila",
    "middle eastern perfumes philippines",
    "rasasi hawas philippines",
    "armaf club de nuit manila",
    "wholesale perfumes philippines",
    "fragrance supplier malabon",
    "original perfumes metro manila",
    "rivera fragrance house",
    "perfume resellers philippines",
  ],
  authors: [{ name: "Rivera Fragrance House" }],
  creator: "Rivera Fragrance House",
  publisher: "Rivera Fragrance House",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rivera Fragrance House | Authentic Perfumes Philippines",
    description:
      "100% original factory-sealed Middle Eastern & designer perfumes at honest prices. Direct supplier rates for personal wear and resellers nationwide.",
    url: siteUrl,
    siteName: "Rivera Fragrance House",
    locale: "en_PH",
    type: "website",
    images: [
      {
        url: "/perfumes/hawas_black.png",
        width: 1200,
        height: 630,
        alt: "Rivera Fragrance House — Authentic Middle Eastern Fragrances",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rivera Fragrance House | Authentic Perfumes Philippines",
    description:
      "100% original factory-sealed Middle Eastern & designer perfumes at honest prices with verified batch codes.",
    images: ["/perfumes/hawas_black.png"],
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "fh0ukwnjRFruexaFFvbWGpAwUk5XZXa32_MCH8Uur-c",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "Rivera Fragrance House",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.svg`,
      },
      "description":
        "Curated authentic Middle Eastern and designer perfumes at honest direct prices in the Philippines.",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "areaServed": "PH",
        "availableLanguage": ["en", "fil"],
      },
    },
    {
      "@type": "Store",
      "@id": `${siteUrl}/#store`,
      "name": "Rivera Fragrance House",
      "url": siteUrl,
      "description":
        "100% genuine sealed perfumes with verified batch codes. Retail single bottles and wholesale supplier in Metro Manila.",
      "image": `${siteUrl}/perfumes/hawas_black.png`,
      "priceRange": "₱1,200 - ₱4,500",
      "currenciesAccepted": "PHP",
      "paymentAccepted": "Cash, Cash on Delivery, GCash, Bank Transfer",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Malabon",
        "addressRegion": "Metro Manila",
        "addressCountry": "PH",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 14.6571,
        "longitude": 120.9561,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "Rivera Fragrance House",
      "publisher": {
        "@id": `${siteUrl}/#organization`,
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/catalog?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  let profile = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    profile = user ? await getUserProfile() : null;
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.message?.includes("Dynamic server usage")) {
      throw error;
    }
    console.error("Auth error in layout:", error);
  }

  const role = profile?.role || "customer";

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (sessionStorage.getItem('rivera-preloader-seen') === 'true') {
                  document.documentElement.classList.add('preloader-seen');
                }
              } catch (e) {}\n            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Navbar isLoggedIn={!!user} role={role} />
        <SmoothScroll>{children}</SmoothScroll>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(0 0% 9%)",
              border: "1px solid hsl(0 0% 14%)",
              color: "hsl(40 25% 91%)",
              fontFamily: "var(--font-body), serif",
            },
          }}
        />
      </body>
    </html>
  );
}
