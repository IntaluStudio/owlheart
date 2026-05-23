export const EXTENSION_ID = "com.intalu.daggerheart-toolkit";

export const METADATA_KEYS = {
  homebrewPacks: `${EXTENSION_ID}/homebrew-packs`,
  characters: `${EXTENSION_ID}/characters`,
  lastDualityResult: `${EXTENSION_ID}/last-duality-result`,
  voidContentEnabled: `${EXTENSION_ID}/void-content-enabled`,
} as const;

export const CONTENT_TYPES = [
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
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export type ContentEntry = {
  id: string;
  name: string;
  type: ContentType;
  source: string;
  tags: string[];
  text: string;
  description?: string;
  level?: number;
  domain?: string;
  domains?: string[];
  sourcePackId?: string;
  system?: Record<string, unknown>;
};

export type HomebrewPack = {
  schemaVersion: 1;
  id: string;
  name: string;
  source: string;
  description?: string;
  enabled?: boolean;
  entries: ContentEntry[];
};

export const TRAIT_KEYS = ["agility", "strength", "finesse", "instinct", "presence", "knowledge"] as const;

export type TraitKey = (typeof TRAIT_KEYS)[number];

export type CharacterTraits = Record<TraitKey, number>;

export type CharacterExperience = {
  id: string;
  name: string;
  modifier: number;
};

export type CharacterFeatureToken = {
  id: string;
  label: string;
  current: number;
  max?: number;
  sourceContentId?: string;
};

export type CharacterDescription = {
  clothes?: string;
  eyes?: string;
  body?: string;
  skin?: string;
  notes?: string;
};

export type CharacterPromptAnswer = {
  id: string;
  prompt: string;
  answer: string;
};

export type CharacterConnection = {
  id: string;
  prompt: string;
  name: string;
  answer: string;
};

export type CharacterStatusReference = {
  maxHp: number;
  markedHp: number;
  maxStress: number;
  markedStress: number;
  evasion: number;
  armorScore: number;
  armorSlots: number;
  markedArmor: number;
  hope: number;
  majorThreshold: number;
  severeThreshold: number;
};

export type DerivedStatusField =
  | "maxHp"
  | "maxStress"
  | "evasion"
  | "armorScore"
  | "majorThreshold"
  | "severeThreshold";

export type StatusBonusHint = {
  type: "statusBonus";
  sourceContentId: string;
  label: string;
  field: DerivedStatusField;
  amount: number;
  note: string;
};

export type CharacterBuild = {
  id: string;
  name: string;
  ancestryId?: string;
  communityId?: string;
  classId?: string;
  subclassId?: string;
  level: number;
  selectedDomains: string[];
  selectedDomainCards: string[];
  selectedAbilities: string[];
  selectedEquipment: string[];
  traits: CharacterTraits;
  experiences: CharacterExperience[];
  featureTokens: CharacterFeatureToken[];
  status: CharacterStatusReference;
  notes: string;
  pronouns?: string;
  description?: CharacterDescription;
  backgroundAnswers?: CharacterPromptAnswer[];
  connections?: CharacterConnection[];
  manualOverrides: {
    ignoreDomainRequirements?: boolean;
    ignoreLevelRequirements?: boolean;
    extraAvailableContentIds?: string[];
  };
};

export type ContentFilters = {
  query: string;
  categories: ContentType[];
  level?: number;
  domains: string[];
  tags: string[];
  sources: string[];
};

export type DualityInput = {
  hopeDie: number;
  fearDie: number;
  modifier: number;
};

export type DualityOutcome = "With Hope" | "With Fear" | "Critical Success";

export type DualityResult = DualityInput & {
  total: number;
  outcome: DualityOutcome;
  label: string;
  copyText: string;
};

export type DaggerheartRollKind = "action" | "trait" | "reaction";
export type DaggerheartRollMode = "normal" | "advantage" | "disadvantage";

export type DaggerheartRollInput = {
  kind: DaggerheartRollKind;
  label: string;
  hopeDie: number;
  fearDie: number;
  modifier: number;
  mode: DaggerheartRollMode;
  advantageDie?: number;
  difficulty?: number;
};

export type DaggerheartRollResult = DaggerheartRollInput & {
  adjustment: number;
  total: number;
  success?: boolean;
  outcome: DualityOutcome;
  labelText: string;
  copyText: string;
};
