import { getSelectedReferences } from "./buildFiltering";
import type {
  CharacterBuild,
  CharacterFeatureToken,
  ContentEntry,
  DaggerheartRollKind,
  DaggerheartRollMode,
  StatusBonusHint,
} from "./types";

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

function statusBonus(
  sourceContentId: string,
  label: string,
  field: StatusBonusHint["field"],
  amount: number,
  note: string,
  requirements?: StatusBonusHint["requirements"],
): StatusBonusHint {
  const hint: StatusBonusHint = {
    type: "statusBonus",
    sourceContentId,
    label,
    field,
    amount,
    note,
  };
  return requirements ? { ...hint, requirements } : hint;
}

const flexibleArmorIds = [
  "core_armor_gambeson_armor",
  "core_armor_improved_gambeson_armor",
  "core_armor_advanced_gambeson_armor",
  "core_armor_legendary_gambeson_armor",
];

const heavyArmorIds = [
  "core_armor_chainmail_armor",
  "core_armor_improved_chainmail_armor",
  "core_armor_advanced_chainmail_armor",
  "core_armor_legendary_chainmail_armor",
  "core_armor_savior_chainmail",
];

const veryHeavyArmorIds = [
  "core_armor_full_plate_armor",
  "core_armor_improved_full_plate_armor",
  "core_armor_advanced_full_plate_armor",
  "core_armor_legendary_full_plate_armor",
];

const warhammerIds = [
  "core_weapon_warhammer",
  "core_weapon_improved_warhammer",
  "core_weapon_advanced_warhammer",
  "core_weapon_legendary_warhammer",
];

const equipmentStatusHints = Object.fromEntries([
  ...flexibleArmorIds.map((id) => [
    id,
    [statusBonus(id, "Flexible", "evasion", 1, "Flexible armor grants +1 Evasion.")],
  ]),
  ...heavyArmorIds.map((id) => [
    id,
    [statusBonus(id, "Heavy", "evasion", -1, "Heavy armor applies -1 Evasion.")],
  ]),
  ...veryHeavyArmorIds.map((id) => [
    id,
    [statusBonus(id, "Very Heavy", "evasion", -2, "Very Heavy armor applies -2 Evasion.")],
  ]),
  ...warhammerIds.map((id) => [
    id,
    [statusBonus(id, "Burden", "evasion", -1, "Warhammer burden applies -1 Evasion.")],
  ]),
]) as Record<string, CalculationHint[]>;

const HINTS_BY_SOURCE_ID: Record<string, CalculationHint[]> = {
  core_ancestry_human: [
    statusBonus(
      "core_ancestry_human",
      "High Stamina",
      "maxStress",
      1,
      "High Stamina grants +1 Stress slot at character creation.",
    ),
  ],
  core_ancestry_giant: [
    statusBonus(
      "core_ancestry_giant",
      "Endurance",
      "maxHp",
      1,
      "Endurance grants +1 HP slot at character creation.",
    ),
  ],
  core_ancestry_simiah: [
    statusBonus(
      "core_ancestry_simiah",
      "Nimble",
      "evasion",
      1,
      "Nimble grants +1 Evasion at character creation.",
    ),
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
    statusBonus(
      "core_subclass_vengeance:foundation:at-ease",
      "At Ease",
      "maxStress",
      1,
      "At Ease grants +1 Stress slot.",
    ),
  ],
  "core_subclass_nightwalker:mastery:fleeting-shadow": [
    statusBonus(
      "core_subclass_nightwalker:mastery:fleeting-shadow",
      "Fleeting Shadow",
      "evasion",
      1,
      "Fleeting Shadow grants +1 Evasion.",
    ),
  ],
  "core_subclass_school_of_war:foundation:battlemage": [
    statusBonus(
      "core_subclass_school_of_war:foundation:battlemage",
      "Battlemage",
      "maxHp",
      1,
      "Battlemage grants +1 HP slot.",
    ),
  ],
  "core_subclass_stalwart:foundation:unwavering": [
    statusBonus(
      "core_subclass_stalwart:foundation:unwavering",
      "Unwavering",
      "majorThreshold",
      1,
      "Unwavering grants +1 Major threshold.",
    ),
    statusBonus(
      "core_subclass_stalwart:foundation:unwavering",
      "Unwavering",
      "severeThreshold",
      1,
      "Unwavering grants +1 Severe threshold.",
    ),
  ],
  "core_subclass_stalwart:specialization:unrelenting": [
    statusBonus(
      "core_subclass_stalwart:specialization:unrelenting",
      "Unrelenting",
      "majorThreshold",
      2,
      "Unrelenting grants +2 Major threshold.",
    ),
    statusBonus(
      "core_subclass_stalwart:specialization:unrelenting",
      "Unrelenting",
      "severeThreshold",
      2,
      "Unrelenting grants +2 Severe threshold.",
    ),
  ],
  "core_subclass_stalwart:mastery:undaunted": [
    statusBonus(
      "core_subclass_stalwart:mastery:undaunted",
      "Undaunted",
      "majorThreshold",
      3,
      "Undaunted grants +3 Major threshold.",
    ),
    statusBonus(
      "core_subclass_stalwart:mastery:undaunted",
      "Undaunted",
      "severeThreshold",
      3,
      "Undaunted grants +3 Severe threshold.",
    ),
  ],
  "core_subclass_winged_sentinel:mastery:ascendant": [
    statusBonus(
      "core_subclass_winged_sentinel:mastery:ascendant",
      "Ascendant",
      "severeThreshold",
      4,
      "Ascendant grants +4 Severe threshold.",
    ),
  ],
  core_domain_card_armorer: [
    statusBonus(
      "core_domain_card_armorer",
      "Armorer",
      "armorScore",
      1,
      "Armorer grants +1 Armor Score while armor is selected.",
      { selectedArmor: true },
    ),
  ],
  core_domain_card_fortified_armor: [
    statusBonus(
      "core_domain_card_fortified_armor",
      "Fortified Armor",
      "majorThreshold",
      2,
      "Fortified Armor grants +2 Major threshold while armor is selected.",
      { selectedArmor: true },
    ),
    statusBonus(
      "core_domain_card_fortified_armor",
      "Fortified Armor",
      "severeThreshold",
      2,
      "Fortified Armor grants +2 Severe threshold while armor is selected.",
      { selectedArmor: true },
    ),
  ],
  core_domain_card_blade_touched: [
    statusBonus(
      "core_domain_card_blade_touched",
      "Blade-Touched",
      "severeThreshold",
      4,
      "Blade-Touched grants +4 Severe threshold with 4 or more Blade cards.",
      { selectedDomainCount: { domain: "blade", count: 4 } },
    ),
  ],
  core_domain_card_splendor_touched: [
    statusBonus(
      "core_domain_card_splendor_touched",
      "Splendor-Touched",
      "severeThreshold",
      3,
      "Splendor-Touched grants +3 Severe threshold with 4 or more Splendor cards.",
      { selectedDomainCount: { domain: "splendor", count: 4 } },
    ),
  ],
  core_domain_card_valor_touched: [
    statusBonus(
      "core_domain_card_valor_touched",
      "Valor-Touched",
      "armorScore",
      1,
      "Valor-Touched grants +1 Armor Score with 4 or more Valor cards.",
      { selectedDomainCount: { domain: "valor", count: 4 } },
    ),
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
  ...equipmentStatusHints,
};

function equipmentType(entry: ContentEntry) {
  return typeof entry.system?.equipmentType === "string" ? entry.system.equipmentType : undefined;
}

function isArmor(entry: ContentEntry) {
  return equipmentType(entry) === "armor" || entry.tags.includes("armor");
}

function entryMatchesDomain(entry: ContentEntry, domain: string) {
  const normalized = domain.trim().toLowerCase();
  const entryDomains = [
    entry.domain,
    ...(Array.isArray(entry.domains) ? entry.domains : []),
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  return entryDomains.includes(normalized) || entry.tags.some((tag) => tag.toLowerCase() === normalized);
}

function selectedHintContext(build: CharacterBuild, entries: ContentEntry[]) {
  const selected = getSelectedReferences(entries, build);
  const ids = new Set(
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

  return {
    ids,
    selectedArmor: selected.equipment.some(isArmor),
    domainCards: selected.domainCards,
  };
}

function hintRequirementsMet(hint: CalculationHint, context: ReturnType<typeof selectedHintContext>) {
  if (hint.type !== "statusBonus" || !hint.requirements) {
    return true;
  }

  if (hint.requirements.selectedArmor && !context.selectedArmor) {
    return false;
  }

  const domainRequirement = hint.requirements.selectedDomainCount;
  if (domainRequirement) {
    const count = context.domainCards.filter((entry) => entryMatchesDomain(entry, domainRequirement.domain)).length;
    if (count < domainRequirement.count) {
      return false;
    }
  }

  return true;
}

export function getCalculationHintsForBuild(build: CharacterBuild, entries: ContentEntry[]): CalculationHint[] {
  const context = selectedHintContext(build, entries);
  return Array.from(context.ids)
    .flatMap((id) => HINTS_BY_SOURCE_ID[id] ?? [])
    .filter((hint) => hintRequirementsMet(hint, context));
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
