import { z } from "zod";
import { CONTENT_TYPES, TRAIT_KEYS, type ContentEntry, type HomebrewPack } from "./types";

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

const characterTraitsSchema = z.object(
  Object.fromEntries(TRAIT_KEYS.map((trait) => [trait, z.number().int().default(0)])) as Record<
    (typeof TRAIT_KEYS)[number],
    z.ZodDefault<z.ZodNumber>
  >,
);

const characterExperienceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  modifier: z.number().int(),
});

const characterFeatureTokenSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  current: z.number().int().min(0).default(0),
  max: z.number().int().min(0).optional(),
  sourceContentId: z.string().optional(),
});

const defaultStatus = {
  maxHp: 0,
  markedHp: 0,
  maxStress: 0,
  markedStress: 0,
  evasion: 0,
  armorScore: 0,
  armorSlots: 0,
  markedArmor: 0,
  hope: 0,
  majorThreshold: 0,
  severeThreshold: 0,
};

const characterStatusSchema = z.object({
  maxHp: z.number().int().min(0).default(0),
  markedHp: z.number().int().min(0).default(0),
  maxStress: z.number().int().min(0).default(0),
  markedStress: z.number().int().min(0).default(0),
  evasion: z.number().int().min(0).default(0),
  armorScore: z.number().int().min(0).default(0),
  armorSlots: z.number().int().min(0).default(0),
  markedArmor: z.number().int().min(0).default(0),
  hope: z.number().int().min(0).default(0),
  majorThreshold: z.number().int().min(0).default(0),
  severeThreshold: z.number().int().min(0).default(0),
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
  traits: characterTraitsSchema.default({
    agility: 0,
    strength: 0,
    finesse: 0,
    instinct: 0,
    presence: 0,
    knowledge: 0,
  }),
  experiences: z.array(characterExperienceSchema).default([]),
  featureTokens: z.array(characterFeatureTokenSchema).default([]),
  status: characterStatusSchema.default(defaultStatus),
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
