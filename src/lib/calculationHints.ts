import { getSelectedReferences } from "./buildFiltering";
import type { CharacterBuild, CharacterFeatureToken, ContentEntry, DaggerheartRollKind, DaggerheartRollMode, StatusBonusHint } from "./types";

export type FeatureTokenHint = {
  type: "featureToken";
  sourceContentId: string;
  label: string;
  current: number;
  max?: number;
  note: string;
};

export type RollReminderHint = {
  type: "rollReminder";
  sourceContentId: string;
  label: string;
  note: string;
  kind?: DaggerheartRollKind;
  mode?: DaggerheartRollMode;
};

export type CalculationHint = StatusBonusHint | FeatureTokenHint | RollReminderHint;

const HINTS_BY_SOURCE_ID: Record<string, CalculationHint[]> = {
  core_ancestry_human: [
    {
      type: "statusBonus",
      sourceContentId: "core_ancestry_human",
      label: "High Stamina",
      field: "maxStress",
      amount: 1,
      note: "High Stamina grants +1 Stress slot at character creation.",
    },
  ],
  "core_class_bard:feature:rally": [
    {
      type: "featureToken",
      sourceContentId: "core_class_bard:feature:rally",
      label: "Rally Die",
      current: 1,
      note: "Track whether this character still has a Rally Die this session.",
    },
  ],
  "core_class_seraph:feature:prayer-dice": [
    {
      type: "featureToken",
      sourceContentId: "core_class_seraph:feature:prayer-dice",
      label: "Prayer Dice",
      current: 0,
      note: "Set this to the number of Prayer Dice rolled at the start of session.",
    },
  ],
  "the_void_class_warlock:feature:favor": [
    {
      type: "featureToken",
      sourceContentId: "the_void_class_warlock:feature:favor",
      label: "Favor",
      current: 3,
      note: "Void playtest Warlocks start with 3 Favor.",
    },
  ],
  "core_subclass_vengeance:foundation:at-ease": [
    {
      type: "statusBonus",
      sourceContentId: "core_subclass_vengeance:foundation:at-ease",
      label: "At Ease",
      field: "maxStress",
      amount: 1,
      note: "At Ease grants +1 Stress slot.",
    },
  ],
  core_community_loreborne: [
    {
      type: "rollReminder",
      sourceContentId: "core_community_loreborne",
      label: "Well-Read",
      note: "Advantage can apply to rolls involving the history, culture, or politics of a prominent person or place.",
      mode: "advantage",
    },
  ],
  core_community_wildborne: [
    {
      type: "rollReminder",
      sourceContentId: "core_community_wildborne",
      label: "Lightfoot",
      note: "Advantage can apply to rolls made to move without being heard.",
      mode: "advantage",
    },
  ],
};

function selectedContentIds(build: CharacterBuild, entries: ContentEntry[]) {
  const selected = getSelectedReferences(entries, build);
  return new Set(
    [
      selected.ancestry?.id,
      selected.community?.id,
      selected.class?.id,
      selected.subclass?.id,
      ...selected.domainCards.map((entry) => entry.id),
      ...selected.abilities.map((entry) => entry.id),
      ...selected.equipment.map((entry) => entry.id),
    ].filter(Boolean) as string[],
  );
}

export function getCalculationHintsForBuild(build: CharacterBuild, entries: ContentEntry[]): CalculationHint[] {
  const ids = selectedContentIds(build, entries);
  return Array.from(ids).flatMap((id) => HINTS_BY_SOURCE_ID[id] ?? []);
}

export function getSuggestedFeatureTokens(build: CharacterBuild, entries: ContentEntry[]): CharacterFeatureToken[] {
  const existingSources = new Set(build.featureTokens.flatMap((token) => (token.sourceContentId ? [token.sourceContentId] : [])));
  const existingLabels = new Set(build.featureTokens.map((token) => token.label.trim().toLowerCase()));

  return getCalculationHintsForBuild(build, entries)
    .filter((hint): hint is FeatureTokenHint => hint.type === "featureToken")
    .filter((hint) => !existingSources.has(hint.sourceContentId) && !existingLabels.has(hint.label.toLowerCase()))
    .map((hint) => ({
      id: `token:${hint.sourceContentId}`,
      label: hint.label,
      current: hint.current,
      max: hint.max,
      sourceContentId: hint.sourceContentId,
    }));
}

export function applySuggestedFeatureTokens(build: CharacterBuild, entries: ContentEntry[]): CharacterBuild {
  const tokens = getSuggestedFeatureTokens(build, entries);
  if (tokens.length === 0) {
    return build;
  }

  return {
    ...build,
    featureTokens: [...build.featureTokens, ...tokens],
  };
}
