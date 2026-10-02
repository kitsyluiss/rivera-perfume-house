import { Perfume } from "@/lib/types";

export function getAvifUrl(p: Perfume): string {
  const name = (p.scent_name || "").toLowerCase();
  let fileName = "";
  if (name.includes("club de nuit")) fileName = "club_de_nuit_intense_man.avif";
  else if (name.includes("delilah")) fileName = "delilahblanc.avif";
  else if (name.includes("hawas ice")) fileName = "hawas ice.avif";
  else if (name.includes("hawas black")) fileName = "hawas_black.avif";
  else if (name.includes("hawas for him") || (name.includes("hawas") && !name.includes("ice") && !name.includes("black") && !name.includes("kobra"))) fileName = "hawas for him.avif";
  else if (name.includes("kobra")) fileName = "hawas kobra.avif";
  else if (name.includes("hunter")) fileName = "hunter men armaf.avif";
  else if (name.includes("liquid brun")) fileName = "liquid_brun.avif";
  else if (name.includes("pacific aloha")) fileName = "pacific_aloha.avif";
  else if (name.includes("aquatica")) fileName = "rayhaan aquatica.avif";
  else if (name.includes("divine")) fileName = "rayhaan divine.avif";
  else if (name.includes("nocturno")) fileName = "rayhaan_nocturno.avif";
  else if (name.includes("elixir")) fileName = "rayhaan_elixir.avif";
  else if (name.includes("lion")) fileName = "rayhaan lion.avif";
  else if (name.includes("obsidian")) fileName = "rayhaan obsidian.avif";
  else if (name.includes("wolf")) fileName = "rayhaan wolf.avif";
  else if (name.includes("shiyaaka")) fileName = "shiyaaka_snow.avif";
  else if (name.includes("supremacy")) fileName = "supremacy collectors edition.avif";
  else if (name.includes("varakh")) fileName = "varakh_silver.avif";
  else if (name.includes("vulcan")) fileName = "vulcan baie.avif";
  else if (name.includes("vanguard")) fileName = "maison asrar vanguard.avif";
  else if (name.includes("ameerat")) fileName = "ameerat.avif";
  else if (name.includes("freeze")) fileName = "riffsfreeze.avif";
  else if (name.includes("rose of dreams") || name.includes("zimaaya") || name.includes("zimaya")) fileName = "zimaaya.avif";

  if (fileName) {
    return `/perfumes/${fileName.replace(/ /g, '_')}`;
  }
  return p.image_url || "/logo.svg";
}

export function getCatalogPhoto(p: Perfume): string | null {
  // If the database has an uploaded environment image that is NOT an avif cutout, use it
  if (p.image_url && !p.image_url.toLowerCase().split("?")[0].endsWith(".avif")) {
    return p.image_url;
  }

  const name = (p.scent_name || "").toLowerCase();

  // Primary local catalog photos: optimized, lightweight JPGs (50-200KB)
  if (name.includes("club de nuit")) return "/perfumes/club%20de%20nuit%20intense%20man.jpg";
  if (name.includes("delilah")) return "/perfumes/delilahblanc.jpg";
  if (name.includes("hawas ice")) return "/perfumes/hawas%20ice.jpg";
  if (name.includes("hawas black")) return "/perfumes/hawas%20black.jpg";
  if (name.includes("hawas kobra")) return "/perfumes/hawas%20kobra.jpg";
  if (name.includes("hawas")) return "/perfumes/hawas%20for%20him.jpg";
  if (name.includes("hunter")) return "/perfumes/hunter%20men%20armaf.jpg";
  if (name.includes("liquid brun")) return "/perfumes/liquid%20brun.jpg";
  if (name.includes("pacific aloha")) return "/perfumes/pacific%20aloha.jpg";
  if (name.includes("aquatica")) return "/perfumes/rayhaan%20aquatica.jpg";
  if (name.includes("divine")) return "/perfumes/rayhaan%20divine.jpg";
  if (name.includes("nocturno")) return "/perfumes/rayhaan%20nocturno.jpg";
  if (name.includes("elixir")) return "/perfumes/rayhaan%20elixir.jpg";
  if (name.includes("lion")) return "/perfumes/rayhaan%20lion.jpg";
  if (name.includes("obsidian")) return "/perfumes/rayhaan%20obsidian.jpg";
  if (name.includes("wolf")) return "/perfumes/rayhaan%20wolf.jpg";
  if (name.includes("shiyaaka")) return "/perfumes/shiyaaka%20snow.jpg";
  if (name.includes("supremacy")) return "/perfumes/supremacy%20collectors%20edition.jpg";
  if (name.includes("varakh")) return "/perfumes/varakh%20silver.jpg";
  if (name.includes("vulcan")) return "/perfumes/vulcan%20baie.jpg";

  // If perfume has an image_url (even if .avif) and no local photo exists, return it
  if (p.image_url) return p.image_url;

  return null;
}

export function getFallbackCatalogPhoto(p: Perfume): string | null {
  const name = (p.scent_name || "").toLowerCase();

  // Secondary local catalog photos: PNG alternatives
  if (name.includes("club de nuit")) return "/perfumes/club_de_nuit_intense_man.png";
  if (name.includes("delilah")) return "/perfumes/delilahblanc.png";
  if (name.includes("hawas ice")) return "/perfumes/hawas_ice.png";
  if (name.includes("hawas black")) return "/perfumes/hawas_black.png";
  if (name.includes("hawas kobra")) return "/perfumes/hawas_kobra.png";
  if (name.includes("hawas")) return "/perfumes/hawas_for_him.png";
  if (name.includes("hunter")) return "/perfumes/hunter_men_armaf.png";
  if (name.includes("liquid brun")) return "/perfumes/liquid_brun.png";
  if (name.includes("pacific aloha")) return "/perfumes/pacific_aloha.png";
  if (name.includes("aquatica")) return "/perfumes/rayhaan_aquatica.png";
  if (name.includes("divine")) return "/perfumes/rayhaan_divine.png";
  if (name.includes("nocturno")) return "/perfumes/rayhaan_nocturno.png";
  if (name.includes("elixir")) return "/perfumes/rayhaan_elixir.png";
  if (name.includes("lion")) return "/perfumes/rayhaan_lion.png";
  if (name.includes("obsidian")) return "/perfumes/rayhaan_obsidian.png";
  if (name.includes("wolf")) return "/perfumes/rayhaan_wolf.png";
  if (name.includes("shiyaaka")) return "/perfumes/shiyaaka_snow.png";
  if (name.includes("supremacy")) return "/perfumes/supremacy_collectors_edition.png";
  if (name.includes("varakh")) return "/perfumes/varakh_silver.png";
  if (name.includes("vulcan")) return "/perfumes/vulcan_baie.png";

  return null;
}

export function getPngUrl(p: Perfume): string | null {
  return getFallbackCatalogPhoto(p);
}

export function getCardImageUrl(p: Perfume): string | null {
  return getCatalogPhoto(p);
}
