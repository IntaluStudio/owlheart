import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeDaggerheartRelease } from "../src/lib/daggerheartData";

const CORE_FILES = [
  "ancestries.json",
  "armors.json",
  "classes.json",
  "communities.json",
  "consumables.json",
  "domain-cards.json",
  "items.json",
  "rules.json",
  "subclasses.json",
  "transformations.json",
  "weapons.json",
];

const DEFAULT_SOURCE_DIR = "vendor/daggerheart-data/core";
const OUTPUT_FILE = "public/data/srd-core.json";

async function readReleaseFiles(sourceDir: string) {
  const files: Record<string, unknown> = {};

  for (const fileName of CORE_FILES) {
    const filePath = path.join(sourceDir, fileName);
    const raw = await readFile(filePath, "utf8");
    files[fileName] = JSON.parse(raw);
  }

  return files;
}

async function main() {
  const sourceDir = process.argv[2] ?? DEFAULT_SOURCE_DIR;
  const files = await readReleaseFiles(sourceDir);
  const entries = normalizeDaggerheartRelease({ source: "SRD Core", files });

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
  console.log(`Generated ${entries.length} SRD entries in ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
