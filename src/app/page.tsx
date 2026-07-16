import { createClient } from "@/lib/supabase/server";
import CatalogView from "@/components/CatalogView";
import type { Perfume } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("perfumes")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Perfume[];

  // Deduplicate: merge rows with same brand + scent_name into one card,
  // summing quantities. The first encountered row wins for price/image/etc.
  const seen = new Map<string, Perfume>();
  for (const p of rows) {
    const key = `${p.brand.toLowerCase()}||${p.scent_name.toLowerCase()}`;
    if (seen.has(key)) {
      // Add quantities together on the existing entry
      seen.get(key)!.quantity += p.quantity;
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

  return <CatalogView initialPerfumes={perfumes} />;
}
