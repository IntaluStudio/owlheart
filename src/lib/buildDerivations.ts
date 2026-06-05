import { getSelectedReferences } from "./buildFiltering";
import { getCalculationHintsForBuild } from "./calculationHints";
import { DEFAULT_MAX_STRESS } from "./schema";
import type { CharacterBuild, CharacterStatusReference, ContentEntry, DerivedStatusField, StatusBonusHint } from "./types";

export type DerivedStatusPreview = {
  field: DerivedStatusField;
  label: string;
  current: number;
  derived?: number;
  formula?: string;
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
  formula?: string,
): DerivedStatusPreview {
  return {
    field,
    label: STATUS_LABELS[field],
    current: build.status[field],
    derived,
    formula,
    sourceName,
    sourceId: source?.id,
  };
}

function signedFormula(base: number | undefined, bonus: number, derived: number | undefined) {
  if (base === undefined || derived === undefined || bonus === 0) {
    return undefined;
  }

  return `${base} ${bonus > 0 ? "+" : "-"} ${Math.abs(bonus)} = ${derived}`;
}

export function buildDerivations(build: CharacterBuild, entries: ContentEntry[]): BuildDerivationPreview {
  const selected = getSelectedReferences(entries, build);
  const armor = selected.equipment.find((entry) => equipmentType(entry) === "armor" || entry.tags.includes("armor"));
  const weapons = selected.equipment.filter((entry) => equipmentType(entry) === "weapon" || entry.tags.includes("weapon"));
  const statusBonusHints = getCalculationHintsForBuild(build, entries).filter(
    (hint): hint is StatusBonusHint => hint.type === "statusBonus",
  );
  const statusBonusHintsByField = statusBonusHints.reduce<Partial<Record<DerivedStatusField, StatusBonusHint[]>>>(
    (accumulator, hint) => {
      accumulator[hint.field] = [...(accumulator[hint.field] ?? []), hint];
      return accumulator;
    },
    {},
  );
  const statusBonusTotal = (field: DerivedStatusField) =>
    (statusBonusHintsByField[field] ?? []).reduce((total, hint) => total + hint.amount, 0);
  const statusBonusLabel = (hint: StatusBonusHint) => {
    const source = entries.find((entry) => entry.id === hint.sourceContentId);
    return source && source.name !== hint.label ? `${source.name}: ${hint.label}` : hint.label;
  };
  const statusBonusLabels = (field: DerivedStatusField) => [
    ...new Set((statusBonusHintsByField[field] ?? []).map(statusBonusLabel)),
  ];
  const firstStatusBonusSource = (field: DerivedStatusField) => {
    const firstHint = statusBonusHintsByField[field]?.[0];
    return firstHint ? entries.find((entry) => entry.id === firstHint.sourceContentId) : undefined;
  };
  const withBonusSourceName = (baseName: string | undefined, field: DerivedStatusField) => {
    const bonusLabels = statusBonusLabels(field);
    return [baseName, ...bonusLabels].filter(Boolean).join(" + ") || undefined;
  };

  const classHp = numericSystemValue(selected.class, "startingHitPoints");
  const classEvasion = numericSystemValue(selected.class, "startingEvasion");
  const armorScore = numericSystemValue(armor, "baseScore");
  const majorThreshold = numericSystemValue(armor, "baseMajorThreshold");
  const severeThreshold = numericSystemValue(armor, "baseSevereThreshold");
  const stressBonusLabels = statusBonusLabels("maxStress");
  const derivedMaxStress = DEFAULT_MAX_STRESS + statusBonusTotal("maxStress");
  const stressSourceName = stressBonusLabels.length ? stressBonusLabels.join(", ") : "SRD base stress";
  const evasionBonus = statusBonusTotal("evasion");
  const derivedEvasion = classEvasion !== undefined ? classEvasion + evasionBonus : undefined;

  const status = [
    makeStatusPreview(
      build,
      "maxHp",
      classHp !== undefined ? classHp + statusBonusTotal("maxHp") : undefined,
      selected.class ?? firstStatusBonusSource("maxHp"),
      withBonusSourceName(selected.class?.name, "maxHp"),
    ),
    makeStatusPreview(build, "maxStress", derivedMaxStress, firstStatusBonusSource("maxStress"), stressSourceName),
    makeStatusPreview(
      build,
      "evasion",
      derivedEvasion,
      selected.class ?? firstStatusBonusSource("evasion"),
      withBonusSourceName(selected.class?.name, "evasion"),
      signedFormula(classEvasion, evasionBonus, derivedEvasion),
    ),
    makeStatusPreview(
      build,
      "armorScore",
      armorScore !== undefined ? armorScore + statusBonusTotal("armorScore") : undefined,
      armor ?? firstStatusBonusSource("armorScore"),
      withBonusSourceName(armor?.name, "armorScore"),
    ),
    makeStatusPreview(
      build,
      "majorThreshold",
      majorThreshold !== undefined ? majorThreshold + build.level + statusBonusTotal("majorThreshold") : undefined,
      armor ?? firstStatusBonusSource("majorThreshold"),
      withBonusSourceName(armor ? `${armor.name} + Level` : undefined, "majorThreshold"),
    ),
    makeStatusPreview(
      build,
      "severeThreshold",
      severeThreshold !== undefined ? severeThreshold + build.level + statusBonusTotal("severeThreshold") : undefined,
      armor ?? firstStatusBonusSource("severeThreshold"),
      withBonusSourceName(armor ? `${armor.name} + Level` : undefined, "severeThreshold"),
    ),
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
  const derivedMaxHp = derivation.statusByField.maxHp?.derived;
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
      markedHp:
        typeof derivedMaxHp === "number" && (build.status.markedHp === 0 || build.status.markedHp === build.status.maxHp)
          ? derivedMaxHp
          : build.status.markedHp,
    },
  };
}
