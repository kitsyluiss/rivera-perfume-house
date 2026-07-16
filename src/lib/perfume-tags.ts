import type { Perfume } from "@/lib/types";

export const PERFUME_TAGS = [
  {
    value: "Office Safe",
    bestFor: "Workspaces and professional settings",
    vibe: "Clean, light, and understated",
  },
  {
    value: "Date Night",
    bestFor: "Evenings and close encounters",
    vibe: "Warm, sweet, and alluring",
  },
  {
    value: "Casual",
    bestFor: "Weekends and running errands",
    vibe: "Fresh, simple, and effortless",
  },
  {
    value: "Statement",
    bestFor: "Parties and formal events",
    vibe: "Loud, bold, and attention grabbing",
  },
] as const;

export type PerfumeTag = (typeof PERFUME_TAGS)[number]["value"];

const tagKeywords: Record<PerfumeTag, RegExp[]> = {
  "Office Safe": [/coco/i, /mademoiselle/i, /floral/i, /fresh/i, /clean/i, /garden/i],
  "Date Night": [/noir/i, /intense/i, /vanilla/i, /amber/i, /elixir/i, /romance/i],
  Casual: [/sea salt/i, /citrus/i, /aqua/i, /fresh/i, /light/i, /simple/i],
  Statement: [/oud/i, /rouge/i, /leather/i, /spice/i, /wood/i, /bold/i],
};

export function normalizePerfumeTag(value: string | null | undefined): PerfumeTag | null {
  if (!value) return null;
  const matched = PERFUME_TAGS.find((tag) => tag.value.toLowerCase() === value.toLowerCase());
  return matched?.value ?? null;
}

export function inferPerfumeTag(perfume: Pick<Perfume, "brand" | "scent_name" | "season">) {
  const explicit = normalizePerfumeTag(perfume.season ?? undefined);
  if (explicit) return explicit;

  const haystack = `${perfume.brand} ${perfume.scent_name}`;
  for (const tag of PERFUME_TAGS) {
    if (tagKeywords[tag.value].some((pattern) => pattern.test(haystack))) {
      return tag.value;
    }
  }

  return "Office Safe";
}

export function getPerfumeTagDetails(value: PerfumeTag) {
  return PERFUME_TAGS.find((tag) => tag.value === value) ?? PERFUME_TAGS[0];
}
