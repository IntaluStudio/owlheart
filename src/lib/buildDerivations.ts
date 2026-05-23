import { getSelectedReferences } from "./buildFiltering";
import { getCalculationHintsForBuild } from "./calculationHints";
import { DEFAULT_MAX_STRESS } from "./schema";
import type { CharacterBuild, CharacterStatusReference, ContentEntry, DerivedStatusField, StatusBonusHint } from "./types";

export type DerivedStatusPreview = {
  field: DerivedStatusField;
  label: string;
  current: number;
  derived?: number;
  sourceName?: string;
  sourceId?: string;
};

export type BuildDerivationPreview = {
  status: DerivedStatusPreview[];
  statusByField: Partial<Record<DerivedStatusField, DerivedStatusPreview>>;
  armor?: ContentEntry;
  primaryWeapons: ContentEntry[];
  secondaryWeapons: ContentEntry[];
  spellcastTrait?: string;
};

const STATUS_LABELS: Record<DerivedStatusField, string> = {
  maxHp: "HP slots",
  maxStress: "Stress slots",
  evasion: "Evasion",
  armorScore: "Armor score",
  majorThreshold: "Major threshold",
  severeThreshold: "Severe threshold",
};

function numericSystemValue(entry: ContentEntry | undefined, key: string) {
  const value = entry?.system?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringSystemValue(entry: ContentEntry | undefined, key: string) {
  const value = entry?.system?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function equipmentType(entry: ContentEntry) {
  return typeof entry.system?.equipmentType === "string" ? entry.system.equipmentType : undefined;
}

function hasTagPrefix(entry: ContentEntry, prefix: string) {
  return entry.tags.some((tag) => tag === prefix || tag.startsWith(`${prefix}-`));
}

function makeStatusPreview(
  build: CharacterBuild,
  field: DerivedStatusField,
  derived: number | undefined,
  source: ContentEntry | undefined,
  sourceName = source?.name,
): DerivedStatusPreview {
  return {
    field,
    label: STATUS_LABELS[field],
    current: build.status[field],
    derived,
    sourceName,
    sourceId: source?.id,
  };
}

export function buildDerivations(build: CharacterBuild, entries: ContentEntry[]): BuildDerivationPreview {
  const selected = getSelectedReferences(entries, build);
  const armor = selected.equipment.find((entry) => equipmentType(entry) === "armor" || entry.tags.includes("armor"));
  const weapons = selected.equipment.filter((entry) => equipmentType(entry) === "weapon" || entry.tags.includes("weapon"));
  const stressBonusHints = getCalculationHintsForBuild(build, entries).filter(
    (hint): hint is StatusBonusHint => hint.type === "statusBonus" && hint.field === "maxStress",
  );
  const derivedMaxStress = DEFAULT_MAX_STRESS + stressBonusHints.reduce((total, hint) => total + hint.amount, 0);
  const stressSource = stressBonusHints[0]
    ? entries.find((entry) => entry.id === stressBonusHints[0].sourceContentId)
    : undefined;
  const stressSourceName = stressBonusHints.length
    ? stressBonusHints.map((hint) => hint.label).join(", ")
    : "SRD base stress";

  const status = [
    makeStatusPreview(build, "maxHp", numericSystemValue(selected.class, "startingHitPoints"), selected.class),
    makeStatusPreview(build, "maxStress", derivedMaxStress, stressSource, stressSourceName),
    makeStatusPreview(build, "evasion", numericSystemValue(selected.class, "startingEvasion"), selected.class),
    makeStatusPreview(build, "armorScore", numericSystemValue(armor, "baseScore"), armor),
    makeStatusPreview(build, "majorThreshold", numericSystemValue(armor, "baseMajorThreshold"), armor),
    makeStatusPreview(build, "severeThreshold", numericSystemValue(armor, "baseSevereThreshold"), armor),
  ];

  return {
    status,
    statusByField: Object.fromEntries(status.map((preview) => [preview.field, preview])),
    armor,
    primaryWeapons: weapons.filter((entry) => hasTagPrefix(entry, "primary")),
    secondaryWeapons: weapons.filter((entry) => hasTagPrefix(entry, "secondary")),
    spellcastTrait: stringSystemValue(selected.subclass, "spellcastTrait"),
  };
}

export function applyDerivedStatus(build: CharacterBuild, derivation: BuildDerivationPreview): CharacterBuild {
  const patch = derivation.status.reduce<Partial<CharacterStatusReference>>((accumulator, preview) => {
    if (typeof preview.derived === "number") {
      accumulator[preview.field] = preview.derived;
      if (preview.field === "armorScore") {
        accumulator.armorSlots = preview.derived;
      }
    }
    return accumulator;
  }, {});

  return {
    ...build,
    status: {
      ...build.status,
      ...patch,
    },
  };
}
