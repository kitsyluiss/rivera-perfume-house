import type { Metadata } from "next";
import LandingPageClient from "@/components/LandingPageClient";

export const metadata: Metadata = {
  title: "Rivera Fragrance House | 100% Authentic Perfumes Philippines",
  description:
    "Direct supplier of 100% authentic factory-sealed Middle Eastern & designer perfumes in the Philippines. Transparent wholesale and retail pricing with verified batch codes.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rivera Fragrance House | Authentic Fragrances Philippines",
    description:
      "100% original factory-sealed perfumes at direct supplier prices. Personal retail and wholesale for resellers nationwide.",
    url: "/",
    images: [
      {
        url: "/perfumes/hawas_black.png",
        width: 1200,
        height: 630,
        alt: "Rivera Fragrance House — Luxury Middle Eastern Fragrances",
      },
    ],
  },
};

export default function LandingPage() {
  return <LandingPageClient />;
}
