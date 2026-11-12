// Reads the layered prompt MD files and embeds them into a TS module so the
// Cloudflare Worker bundle carries them (Workers have no runtime filesystem).
// Edit the .md files, then run: node scripts/gen-ai-prompts.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = "src/lib/ai/prompts";
const files = readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
if (files.length === 0) throw new Error(`No prompt .md files found in ${dir}`);

const layers = files.map((f) => readFileSync(join(dir, f), "utf8").trim());

const out = `// AUTO-GENERATED from src/lib/ai/prompts/*.md — do not edit by hand.
// Edit the MD files, then run: node scripts/gen-ai-prompts.mjs
export const AI_PROMPT_LAYERS: readonly string[] = ${JSON.stringify(layers, null, 2)};
`;

writeFileSync("src/lib/ai/prompt-layers.generated.ts", out);
console.log(`gen-ai-prompts: embedded ${files.length} prompt layers`);
