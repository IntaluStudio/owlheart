import { z } from "zod";
import { CONTENT_TYPES, type ContentEntry, type HomebrewPack } from "./types";

export const contentEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(CONTENT_TYPES),
  source: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  text: z.string().default(""),
  description: z.string().optional(),
  level: z.number().int().min(0).max(10).optional(),
  domain: z.string().min(1).optional(),
  domains: z.array(z.string().min(1)).optional(),
  sourcePackId: z.string().optional(),
  system: z.record(z.unknown()).optional(),
});

const collectionSchema = z.array(contentEntrySchema).optional();

const homebrewPackInputSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().min(1),
    name: z.string().min(1),
    source: z.string().min(1),
    description: z.string().optional(),
    enabled: z.boolean().optional(),
    entries: z.array(contentEntrySchema).default([]),
    cards: collectionSchema,
    abilities: collectionSchema,
    ancestries: collectionSchema,
    communities: collectionSchema,
    classes: collectionSchema,
    subclasses: collectionSchema,
    items: collectionSchema,
    adversaries: collectionSchema,
  })
  .transform((pack): HomebrewPack => {
    const collections = [
      pack.cards,
      pack.abilities,
      pack.ancestries,
      pack.communities,
      pack.classes,
      pack.subclasses,
      pack.items,
      pack.adversaries,
    ];
    const entries = [pack.entries, ...collections].flatMap((items) => items ?? []);

    return {
      schemaVersion: 1,
      id: pack.id,
      name: pack.name,
      source: pack.source,
      description: pack.description,
      enabled: pack.enabled ?? true,
      entries: entries.map((entry) => ({
        ...entry,
        sourcePackId: entry.sourcePackId ?? pack.id,
      })),
    };
  });

export const characterBuildSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ancestryId: z.string().optional(),
  communityId: z.string().optional(),
  classId: z.string().optional(),
  subclassId: z.string().optional(),
  level: z.number().int().min(1).max(10),
  selectedDomains: z.array(z.string()).default([]),
  selectedDomainCards: z.array(z.string()).default([]),
  selectedAbilities: z.array(z.string()).default([]),
  selectedEquipment: z.array(z.string()).default([]),
  notes: z.string().default(""),
  manualOverrides: z
    .object({
      ignoreDomainRequirements: z.boolean().optional(),
      ignoreLevelRequirements: z.boolean().optional(),
      extraAvailableContentIds: z.array(z.string()).optional(),
    })
    .default({}),
});

export const normalizeHomebrewPack = (input: unknown): HomebrewPack => homebrewPackInputSchema.parse(input);

const parseHomebrewPack = (input: unknown): HomebrewPack => normalizeHomebrewPack(input);

export const validateHomebrewPack = Object.assign(parseHomebrewPack, {
  safeParse: (input: unknown) => homebrewPackInputSchema.safeParse(input),
});

export function validateCharacterBuild(input: unknown) {
  return characterBuildSchema.parse(input);
}

export function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "root";
    return `${path}: ${issue.message}`;
  });
}
