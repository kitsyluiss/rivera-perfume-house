import type { Perfume } from "./types";

/**
 * Generates a clean, SEO-friendly kebab-case slug for a perfume.
 * E.g. "Rasasi" + "Hawas Black" -> "rasasi-hawas-black"
 */
export function getPerfumeSlug(p: { brand: string; scent_name: string }): string {
  const brand = (p.brand || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const scent = (p.scent_name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (brand && scent) {
    return `${brand}-${scent}`;
  }
  return scent || brand || "fragrance";
}

/**
 * Finds a perfume from a list matching a slug, scent name, or id.
 */
export function findPerfumeBySlug(perfumes: Perfume[], slug: string): Perfume | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

  return perfumes.find((p) => {
    const fullSlug = getPerfumeSlug(p);
    const scentSlug = (p.scent_name || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const idSlug = (p.id || "").toLowerCase().trim();

    return fullSlug === clean || scentSlug === clean || idSlug === clean;
  });
}
