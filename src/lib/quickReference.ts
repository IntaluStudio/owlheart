import type { CharacterExperience, ContentEntry, DaggerheartRollKind, DaggerheartRollMode, TraitKey } from "./types";

export const VISIBLE_DOMAIN_CARD_SLOTS = 5;

const TRAIT_LABELS: Record<TraitKey, string> = {
  agility: "Agility",
  strength: "Strength",
  finesse: "Finesse",
  instinct: "Instinct",
  presence: "Presence",
  knowledge: "Knowledge",
};

export type RollTarget = {
  id: string;
  label: string;
  modifier: number;
  kind: DaggerheartRollKind;
  mode: DaggerheartRollMode;
  difficulty?: number;
};

export type RollTargetOptions = {
  kind?: DaggerheartRollKind;
  mode?: DaggerheartRollMode;
  difficulty?: number;
};

export function createTraitRollTarget(trait: TraitKey, modifier: number, options: RollTargetOptions = {}): RollTarget {
  return {
    id: `trait:${trait}`,
    label: TRAIT_LABELS[trait],
    modifier,
    kind: options.kind ?? "trait",
    mode: options.mode ?? "normal",
    difficulty: options.difficulty,
  };
}

export function createExperienceRollTarget(experience: CharacterExperience, options: RollTargetOptions = {}): RollTarget {
  return {
    id: experience.id,
    label: experience.name,
    modifier: experience.modifier,
    kind: options.kind ?? "trait",
    mode: options.mode ?? "normal",
    difficulty: options.difficulty,
  };
}

export function splitCardVault(cards: ContentEntry[], visibleSlots = VISIBLE_DOMAIN_CARD_SLOTS) {
  return {
    visible: cards.slice(0, visibleSlots),
    vault: cards.slice(visibleSlots),
  };
}

export function filterContentChoices(entries: ContentEntry[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return entries;
  }

  return entries.filter((entry) =>
    [entry.name, entry.text, entry.source, entry.tags.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );
}
