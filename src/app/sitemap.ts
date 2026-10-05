import type { MetadataRoute } from "next";

export const revalidate = 3600; // revalidate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://riverafragrances.com";

  // High-priority core customer-facing routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/atelier`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return staticRoutes;
    }

    // Public REST query without cookie-based auth session to prevent dynamic server bailouts
    const res = await fetch(
      `${supabaseUrl}/rest/v1/perfumes?select=id,brand,scent_name,created_at,quantity&quantity=gt.0`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return staticRoutes;
    }

    const perfumes = await res.json();
    if (!Array.isArray(perfumes) || perfumes.length === 0) {
      return staticRoutes;
    }

    // Deduplicate by brand + scent_name
    const seen = new Set<string>();
    const productRoutes: MetadataRoute.Sitemap = [];

    for (const p of perfumes) {
      const key = `${p.brand.toLowerCase()}-${p.scent_name.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        const searchParam = encodeURIComponent(p.scent_name);
        productRoutes.push({
          url: `${baseUrl}/catalog?scent=${searchParam}`,
          lastModified: p.created_at ? new Date(p.created_at) : new Date(),
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
    }

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
