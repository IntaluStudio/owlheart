import type { ContentEntry } from "./types";

const SUBCLASS_TIER_LEVELS = {
  foundation: 1,
  specialization: 5,
  mastery: 8,
} as const;

export function getSubclassTierRequiredLevel(entry: ContentEntry) {
  if (entry.type !== "ability" || !entry.tags.includes("subclass-feature")) {
    return undefined;
  }

  if (entry.tags.includes("mastery")) {
    return SUBCLASS_TIER_LEVELS.mastery;
  }

  if (entry.tags.includes("specialization")) {
    return SUBCLASS_TIER_LEVELS.specialization;
  }

  if (entry.tags.includes("foundation")) {
    return SUBCLASS_TIER_LEVELS.foundation;
  }

  return undefined;
}

export function isSubclassTierAvailable(entry: ContentEntry, level: number) {
  const requiredLevel = getSubclassTierRequiredLevel(entry);
  return requiredLevel === undefined || level >= requiredLevel;
}
