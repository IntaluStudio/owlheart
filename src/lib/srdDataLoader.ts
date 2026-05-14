import { z } from "zod";
import type { ContentEntry } from "./types";

const SRD_DATA_URL = "/data/srd-core.json";

const contentEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    "domain",
    "domain-card",
    "ancestry",
    "community",
    "class",
    "subclass",
    "condition",
    "item",
    "adversary",
    "rule",
    "ability",
  ]),
  source: z.string(),
  tags: z.array(z.string()),
  text: z.string(),
  description: z.string().optional(),
  level: z.number().optional(),
  domain: z.string().optional(),
  domains: z.array(z.string()).optional(),
  sourcePackId: z.string().optional(),
  system: z.record(z.unknown()).optional(),
});

const srdContentSchema = z.array(contentEntrySchema);

type Fetcher = (input: string) => Promise<Response>;

export async function loadSrdContent(fetcher: Fetcher = fetch): Promise<ContentEntry[]> {
  const response = await fetcher(SRD_DATA_URL);
  if (!response.ok) {
    throw new Error(`Unable to load SRD data: ${response.status}`);
  }

  const parsed = srdContentSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(`Invalid SRD data: ${parsed.error.issues[0]?.message ?? "unknown schema error"}`);
  }

  return parsed.data;
}
