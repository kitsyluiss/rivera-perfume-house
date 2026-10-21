import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/actions";
import { Toaster } from "sonner";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://rivera.perfumehouse.workers.dev").replace(/\/+$/, "");

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
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
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
  other: {
    "instagram:site": "@riverafragrancehouse._07",
    "instagram:creator": "@riverafragrancehouse._07",
    "facebook:page": "riverafraghouse",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "Rivera Fragrance House",
      "alternateName": [
        "Rivera Fragrance House Philippines",
        "Rivera Fragrance House Malabon",
        "Rivera Fragrance House (@riverafragrancehouse._07)",
      ],
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`,
        "width": 2000,
        "height": 2000,
      },
      "image": `${siteUrl}/icon-192.png`,
      "description":
        "Independent family-run perfume house and direct importer in Malabon, Metro Manila, Philippines. Distributing 100% authentic Middle Eastern and designer perfumes — factory-sealed full presentation bottles and verified genuine decants with manufacturer batch codes.",
      "disambiguatingDescription":
        "Rivera Fragrance House is an independent family-run perfume retailer and direct importer based in Malabon, Metro Manila, Philippines (Official Instagram: @riverafragrancehouse._07; Facebook: @riverafraghouse). Rivera Fragrance House is strictly independent and is NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with perfumer Adrian Rivera, Rivera Parfums (@riveraparfums), actress Marian Rivera, or Beautéderm Reverie. Rivera Fragrance House distributes 100% original, factory-sealed full presentation bottles as well as verified genuine decants with verifiable manufacturer batch codes.",
      "sameAs": [
        "https://www.instagram.com/riverafragrancehouse._07/",
        "https://www.facebook.com/riverafraghouse",
        "https://rivera.perfumehouse.workers.dev"
      ],
      "knowsAbout": [
        "Authentic Middle Eastern Perfumes",
        "Factory Sealed Fragrances",
        "Rasasi",
        "Armaf",
        "Fragrance World",
        "French Avenue",
        "Rayhaan",
        "Afnan",
        "Lattafa",
        "Khadlaj",
        "Zimaya"
      ],
      "slogan": "100% Authentic Middle Eastern & Designer Fragrances — Full Bottles & Verified Decants",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support & orders",
        "telephone": "+63-961-592-9770",
        "email": "orders@riverafragrance.com",
        "areaServed": "PH",
        "availableLanguage": ["en", "fil"],
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Malabon",
        "addressRegion": "Metro Manila",
        "addressCountry": "PH",
      },
    },
    {
      "@type": "Store",
      "@id": `${siteUrl}/#store`,
      "name": "Rivera Fragrance House",
      "alternateName": "Rivera Fragrance House Philippines",
      "url": siteUrl,
      "description":
        "100% genuine Middle Eastern and designer perfumes with verified batch codes. Factory-sealed full bottles and verified authentic decants. Retail single orders, decants, and reseller bundles in Metro Manila and nationwide. Official Instagram: @riverafragrancehouse._07.",
      "disambiguatingDescription":
        "Independent fragrance shop operating exclusively from Malabon, Metro Manila. Specializes in 100% original factory-sealed retail and wholesale bottles as well as verified genuine decants. Unaffiliated with Adrian Rivera, Rivera Parfums, or Marian Rivera.",
      "sameAs": [
        "https://www.instagram.com/riverafragrancehouse._07/",
        "https://www.facebook.com/riverafraghouse"
      ],
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
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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
