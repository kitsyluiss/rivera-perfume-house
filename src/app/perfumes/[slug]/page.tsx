import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPerfumeSlug, findPerfumeBySlug } from "@/lib/slug";
import { getCatalogPhoto, getAvifUrl } from "@/lib/get-avif";
import ProductPageClient from "@/components/ProductPageClient";
import type { Perfume } from "@/lib/types";

export const dynamic = "force-dynamic";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://rivera.perfumehouse.workers.dev").replace(/\/+$/, "");

async function getPerfumesList(): Promise<Perfume[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("perfumes")
      .select("*")
      .order("created_at", { ascending: false });

    return (data ?? []) as Perfume[];
  } catch (error) {
    console.error("Error fetching perfumes for product page:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const allPerfumes = await getPerfumesList();
  const perfume = findPerfumeBySlug(allPerfumes, slug);

  if (!perfume) {
    return {
      title: "Perfume Not Found | Rivera Fragrance House",
      description: "The requested fragrance is unavailable or has been archived.",
    };
  }

  const price = perfume.flash_sale_price ?? perfume.target_sale_price;
  const canonicalUrl = `${siteUrl}/perfumes/${getPerfumeSlug(perfume)}`;
  const photo = getCatalogPhoto(perfume) || perfume.image_url || getAvifUrl(perfume);
  const photoUrl = photo.startsWith("http") ? photo : `${siteUrl}${photo}`;

  return {
    title: `${perfume.brand} ${perfume.scent_name} (100ml EDP) | Rivera Fragrance House`,
    description: `Buy 100% authentic ${perfume.brand} ${perfume.scent_name} in the Philippines. In stock at ₱${price.toLocaleString()}. Guaranteed original sealed with verified batch codes. Fast courier shipping nationwide.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${perfume.brand} ${perfume.scent_name} | Rivera Fragrance House`,
      description: `Original factory-sealed ${perfume.brand} ${perfume.scent_name} at ₱${price.toLocaleString()}. Verified batch codes, UAE imports, fast Metro Manila & provincial delivery.`,
      url: canonicalUrl,
      images: [
        {
          url: photoUrl,
          width: 800,
          height: 1000,
          alt: `${perfume.brand} ${perfume.scent_name} Eau de Parfum Bottle`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${perfume.brand} ${perfume.scent_name} | Rivera Fragrance House`,
      description: `100% authentic ${perfume.brand} ${perfume.scent_name}. Live price: ₱${price.toLocaleString()}.`,
      images: [photoUrl],
    },
  };
}

export default async function PerfumeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const allPerfumes = await getPerfumesList();
  const perfume = findPerfumeBySlug(allPerfumes, slug);

  if (!perfume) {
    notFound();
  }

  // Calculate total stock for this brand + scent
  const totalStock = allPerfumes
    .filter(
      (p) =>
        p.brand.toLowerCase() === perfume.brand.toLowerCase() &&
        p.scent_name.toLowerCase() === perfume.scent_name.toLowerCase()
    )
    .reduce((sum, p) => sum + p.quantity, 0);

  const photo = getCatalogPhoto(perfume) || perfume.image_url || getAvifUrl(perfume);
  const photoUrl = photo.startsWith("http") ? photo : `${siteUrl}${photo}`;
  const effectivePrice = perfume.flash_sale_price ?? perfume.target_sale_price;

  // JSON-LD Product Schema
  const productJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${siteUrl}/perfumes/${getPerfumeSlug(perfume)}#product`,
        "name": `${perfume.brand} ${perfume.scent_name}`,
        "image": photoUrl,
        "description": `100% authentic factory-sealed ${perfume.brand} ${perfume.scent_name} Eau de Parfum with verified manufacturer batch codes.`,
        "sku": perfume.id,
        "brand": {
          "@type": "Brand",
          "name": perfume.brand,
        },
        "offers": {
          "@type": "Offer",
          "url": `${siteUrl}/perfumes/${getPerfumeSlug(perfume)}`,
          "priceCurrency": "PHP",
          "price": effectivePrice,
          "priceValidUntil": "2026-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "Rivera Fragrance House",
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteUrl,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Catalog",
            "item": `${siteUrl}/catalog`,
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": perfume.brand,
            "item": `${siteUrl}/catalog?brand=${encodeURIComponent(perfume.brand)}`,
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": perfume.scent_name,
            "item": `${siteUrl}/perfumes/${getPerfumeSlug(perfume)}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductPageClient
        perfume={perfume}
        imageUrl={photo}
        totalStock={totalStock}
      />
    </>
  );
}
