import { createClient } from "@/lib/supabase/server";
import CatalogView from "@/components/CatalogView";
import type { Perfume } from "@/lib/types";
import { getAvifUrl } from "@/lib/get-avif";

export const dynamic = "force-dynamic";

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

  return (
    <CatalogView 
      initialPerfumes={perfumes} 
      initialCarouselPerfumes={carouselPerfumes.slice(0, 8)} 
    />
  );
}
