import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CatalogView from "@/components/CatalogView";
import type { Perfume } from "@/lib/types";
import { getAvifUrl, getCatalogPhoto } from "@/lib/get-avif";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://riverafragrances.com";

export const metadata: Metadata = {
  title: "Fragrance Catalog & Live Stock (₱) | Rivera Fragrance House",
  description:
    "Explore our complete collection of 100% authentic Middle Eastern & designer perfumes in stock. Live Philippine Peso (₱) prices, notes, and direct courier dispatch nationwide.",
  alternates: {
    canonical: "/catalog",
  },
  openGraph: {
    title: "Fragrance Catalog & Live Stock (₱) | Rivera Fragrance House",
    description:
      "Explore 100% authentic factory-sealed perfumes in stock with verified batch codes. Live PHP prices and fast nationwide delivery.",
    url: `${siteUrl}/catalog`,
    images: [
      {
        url: "/perfumes/hawas_black.png",
        width: 1200,
        height: 630,
        alt: "Rivera Fragrance House Live Catalog",
      },
    ],
  },
};

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("perfumes")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Perfume[];

  // Deduplicate: merge rows with same brand + scent_name into one card,
  // summing quantities. If an entry has image_url, preserve it.
  const seen = new Map<string, Perfume>();
  for (const p of rows) {
    const key = `${p.brand.toLowerCase()}||${p.scent_name.toLowerCase()}`;
    if (seen.has(key)) {
      const existing = seen.get(key)!;
      existing.quantity += p.quantity;
      if (p.target_sale_price) existing.target_sale_price = p.target_sale_price;
      if (p.cost_price) existing.cost_price = p.cost_price;
      if (p.flash_sale_price !== undefined) existing.flash_sale_price = p.flash_sale_price;
      if (p.flash_sale_end !== undefined) existing.flash_sale_end = p.flash_sale_end;
      if (!existing.image_url && p.image_url) {
        existing.image_url = p.image_url;
      }
    } else {
      // Clone so we don't mutate Supabase's frozen object
      seen.set(key, { ...p });
    }
  }

  // Sort: in-stock first, sold-out pushed to the bottom
  const perfumes = [...seen.values()].sort((a, b) => {
    if (a.quantity === 0 && b.quantity > 0) return 1;
    if (a.quantity > 0 && b.quantity === 0) return -1;
    return 0;
  });

  // Prepare a truly randomized carousel on every single request / refresh:
  // Filter to in-stock items with available artwork
  const eligibleForCarousel = perfumes.filter(
    (p) => p.quantity > 0 && (getAvifUrl(p) !== "/logo.svg" || p.image_url)
  );
  const carouselPool = eligibleForCarousel.length >= 4 ? eligibleForCarousel : perfumes;

  // Complete Fisher-Yates shuffle across the entire catalog pool
  const carouselPerfumes = [...carouselPool];
  for (let i = carouselPerfumes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [carouselPerfumes[i], carouselPerfumes[j]] = [carouselPerfumes[j], carouselPerfumes[i]];
  }

  // Generate Product ItemList JSON-LD Schema for Google Rich Results
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Rivera Fragrance House In-Stock Perfumes",
    "description": "Authentic factory-sealed Middle Eastern and designer perfumes available in the Philippines.",
    "numberOfItems": perfumes.length,
    "itemListElement": perfumes.slice(0, 25).map((p, index) => {
      const photo = getCatalogPhoto(p) || p.image_url || getAvifUrl(p);
      const photoUrl = photo.startsWith("http") ? photo : `${siteUrl}${photo}`;
      const effectivePrice = p.flash_sale_price ?? p.target_sale_price;

      return {
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": `${p.brand} ${p.scent_name}`,
          "image": photoUrl,
          "description": `${p.brand} ${p.scent_name} original sealed fragrance with verified batch code.`,
          "brand": {
            "@type": "Brand",
            "name": p.brand,
          },
          "offers": {
            "@type": "Offer",
            "price": effectivePrice,
            "priceCurrency": "PHP",
            "priceValidUntil": "2026-12-31",
            "availability": p.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": `${siteUrl}/catalog?scent=${encodeURIComponent(p.scent_name)}`,
            "seller": {
              "@type": "Organization",
              "name": "Rivera Fragrance House",
            },
          },
        },
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <CatalogView 
        initialPerfumes={perfumes} 
        initialCarouselPerfumes={carouselPerfumes.slice(0, 8)} 
      />
    </>
  );
}
