import { Perfume } from "./types";

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

export function getPngUrl(p: Perfume): string | null {
  const name = (p.scent_name || "").toLowerCase().trim();
  let fileName = "";
  if (name.includes("club de nuit")) fileName = "club_de_nuit_intense_man.png";
  else if (name.includes("delilah")) fileName = "delilahblanc.png";
  else if (name.includes("hawas ice")) fileName = "hawas_ice.png";
  else if (name.includes("hawas black")) fileName = "hawas_black.png";
  else if (name.includes("hawas kobra")) fileName = "hawas_kobra.png";
  else if (name.includes("hawas for him") || (name.includes("hawas") && !name.includes("ice") && !name.includes("black") && !name.includes("kobra"))) fileName = "hawas_for_him.png";
  else if (name.includes("hunter")) fileName = "hunter_men_armaf.png";
  else if (name.includes("liquid brun")) fileName = "liquid_brun.png";
  else if (name.includes("pacific aloha")) fileName = "pacific_aloha.png";
  else if (name.includes("aquatica")) fileName = "rayhaan_aquatica.png";
  else if (name.includes("divine")) fileName = "rayhaan_divine.png";
  else if (name.includes("nocturno")) fileName = "rayhaan_nocturno.png";
  else if (name.includes("elixir")) fileName = "rayhaan_elixir.png";
  else if (name.includes("lion")) fileName = "rayhaan_lion.png";
  else if (name.includes("obsidian")) fileName = "rayhaan_obsidian.png";
  else if (name.includes("wolf")) fileName = "rayhaan_wolf.png";
  else if (name.includes("shiyaaka")) fileName = "shiyaaka_snow.png";
  else if (name.includes("supremacy")) fileName = "supremacy_collectors_edition.png";
  else if (name.includes("varakh")) fileName = "varakh_silver.png";
  else if (name.includes("vulcan")) fileName = "vulcan_baie.png";

  if (fileName) {
    return `/perfumes/${fileName}`;
  }
  return null;
}

export function getCardImageUrl(p: Perfume): string | null {
  return p.image_url || getPngUrl(p);
}
