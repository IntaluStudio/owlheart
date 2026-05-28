import {
  suggestedClassReferences,
  type SuggestedClassReference,
} from "../data/suggestedClassReferences";
import { applyDerivedStatus, buildDerivations } from "./buildDerivations";
import {
  TRAIT_KEYS,
  type CharacterBuild,
  type ContentEntry,
  type DerivedStatusField,
  type TraitKey,
} from "./types";

const INVENTORY_START = "[Suggested Class Inventory]";
const INVENTORY_END = "[/Suggested Class Inventory]";

type EquipmentSlot = "primaryWeapon" | "secondaryWeapon" | "armor";

type SuggestionValue<T> = {
  label: string;
  current: T;
  suggested: T;
  changed: boolean;
};

export type ResolvedSuggestedClassReference = SuggestedClassReference & {
  baseClassId: string;
  variantSubclassId?: string;
  variantLabel?: string;
};

export type SuggestedEquipmentPreview = {
  slot: EquipmentSlot;
  label: string;
  currentId?: string;
  currentName: string;
  suggestedId?: string;
  suggestedName: string;
  changed: boolean;
};

export type SuggestedStatusPreview = SuggestionValue<number | undefined> & {
  field: DerivedStatusField;
};

export type SuggestedClassPreview = {
  reference?: ResolvedSuggestedClassReference;
  hasChanges: boolean;
  warnings: string[];
  traits: Array<SuggestionValue<number> & { key: TraitKey }>;
  equipment: SuggestedEquipmentPreview[];
  status: SuggestedStatusPreview[];
  inventory: SuggestionValue<string>;
  suggestedBuild: CharacterBuild;
};

const STATUS_LABELS: Record<DerivedStatusField, string> = {
  maxHp: "HP slots",
  maxStress: "Stress slots",
  evasion: "Evasion",
  armorScore: "Armor score",
  majorThreshold: "Major threshold",
  severeThreshold: "Severe threshold",
};

const TRAIT_LABELS: Record<TraitKey, string> = {
  agility: "Agility",
  strength: "Strength",
  finesse: "Finesse",
  instinct: "Instinct",
  presence: "Presence",
  knowledge: "Knowledge",
};

function selectedEquipmentIds(reference: ResolvedSuggestedClassReference) {
  return [reference.equipment.primaryWeaponId, reference.equipment.secondaryWeaponId, reference.equipment.armorId].filter(
    (id): id is string => Boolean(id),
  );
}

function stripSuggestedInventoryBlock(notes: string) {
  const startIndex = notes.indexOf(INVENTORY_START);
  const endIndex = notes.indexOf(INVENTORY_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return notes.trim();
  }

  return `${notes.slice(0, startIndex)}${notes.slice(endIndex + INVENTORY_END.length)}`.trim();
}

function formatChoiceOptions(options: { label: string }[]) {
  return options.map((option) => option.label).join(" or ");
}

function formatSuggestedInventory(reference: ResolvedSuggestedClassReference) {
  const variantSuffix = reference.variantLabel ? ` - ${reference.variantLabel}` : "";
  const lines = [
    INVENTORY_START,
    `Suggested ${reference.className}${variantSuffix} starting inventory (PDF p.${reference.source.pdfPage}):`,
    `- Take: ${reference.inventory.always.join(", ")}`,
    ...reference.inventory.choices.map((choice) => `- ${choice.label}: ${formatChoiceOptions(choice.options)}`),
    ...reference.inventory.notes?.map((note) => `- Note: ${note}`) ?? [],
    INVENTORY_END,
  ];

  return lines.join("\n");
}

function equipmentType(entry: ContentEntry | undefined) {
  return typeof entry?.system?.equipmentType === "string" ? entry.system.equipmentType : undefined;
}

function hasTagPrefix(entry: ContentEntry | undefined, prefix: string) {
  return Boolean(entry?.tags.some((tag) => tag === prefix || tag.startsWith(`${prefix}-`)));
}

function isWeaponOrArmor(entry: ContentEntry | undefined) {
  return (
    equipmentType(entry) === "weapon" ||
    equipmentType(entry) === "armor" ||
    entry?.tags.includes("weapon") ||
    entry?.tags.includes("armor")
  );
}

function isPrimaryWeapon(entry: ContentEntry | undefined) {
  return equipmentType(entry) === "weapon" && hasTagPrefix(entry, "primary");
}

function isSecondaryWeapon(entry: ContentEntry | undefined) {
  return equipmentType(entry) === "weapon" && hasTagPrefix(entry, "secondary");
}

function isArmor(entry: ContentEntry | undefined) {
  return equipmentType(entry) === "armor" || Boolean(entry?.tags.includes("armor"));
}

function contentName(byId: Map<string, ContentEntry>, id: string | undefined) {
  if (!id) {
    return "None";
  }

  return byId.get(id)?.name ?? id;
}

function selectedEntryForSlot(build: CharacterBuild, byId: Map<string, ContentEntry>, slot: EquipmentSlot) {
  const entries = build.selectedEquipment.map((id) => byId.get(id));
  if (slot === "primaryWeapon") {
    return entries.find(isPrimaryWeapon);
  }
  if (slot === "secondaryWeapon") {
    return entries.find(isSecondaryWeapon);
  }
  return entries.find(isArmor);
}

function suggestedEquipmentPreview(
  build: CharacterBuild,
  reference: ResolvedSuggestedClassReference,
  byId: Map<string, ContentEntry>,
): SuggestedEquipmentPreview[] {
  const slots: Array<{ slot: EquipmentSlot; label: string; suggestedId?: string }> = [
    { slot: "primaryWeapon", label: "Primary weapon", suggestedId: reference.equipment.primaryWeaponId },
    { slot: "secondaryWeapon", label: "Secondary weapon", suggestedId: reference.equipment.secondaryWeaponId },
    { slot: "armor", label: "Armor", suggestedId: reference.equipment.armorId },
  ];

  return slots
    .map(({ slot, label, suggestedId }) => {
      const current = selectedEntryForSlot(build, byId, slot);
      return {
        slot,
        label,
        currentId: current?.id,
        currentName: current?.name ?? "None",
        suggestedId,
        suggestedName: contentName(byId, suggestedId),
        changed: (current?.id ?? undefined) !== (suggestedId ?? undefined),
      };
    })
    .filter((preview) => preview.currentId || preview.suggestedId);
}

function nextSelectedEquipment(build: CharacterBuild, reference: ResolvedSuggestedClassReference, byId: Map<string, ContentEntry>) {
  return [
    ...build.selectedEquipment.filter((id) => !isWeaponOrArmor(byId.get(id))),
    ...selectedEquipmentIds(reference),
  ].filter((id, index, list) => list.indexOf(id) === index);
}

function buildWithSuggestions(
  build: CharacterBuild,
  entries: ContentEntry[],
  reference: ResolvedSuggestedClassReference,
) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const selectedEquipment = nextSelectedEquipment(build, reference, byId);
  const existingNotes = stripSuggestedInventoryBlock(build.notes);
  const suggestedInventory = formatSuggestedInventory(reference);
  const suggestedBuild = {
    ...build,
    traits: reference.traits,
    selectedEquipment,
    notes: [existingNotes, suggestedInventory].filter(Boolean).join("\n\n"),
  };

  return applyDerivedStatus(suggestedBuild, buildDerivations(suggestedBuild, entries));
}

export function findSuggestedClassReference(classId: string | undefined) {
  return suggestedClassReferences.find((reference) => reference.classId === classId);
}

export function resolveSuggestedClassReference(
  build: CharacterBuild,
  _entries: ContentEntry[] = [],
): ResolvedSuggestedClassReference | undefined {
  const reference = findSuggestedClassReference(build.classId);
  if (!reference) {
    return undefined;
  }

  const override = reference.subclassOverrides?.find((candidate) => candidate.subclassId === build.subclassId);
  return {
    ...reference,
    baseClassId: reference.classId,
    variantSubclassId: override?.subclassId,
    variantLabel: override?.label,
    traits: override?.traits ?? reference.traits,
    equipment: {
      ...reference.equipment,
      ...override?.equipment,
    },
  };
}

export function previewSuggestedClassReference(build: CharacterBuild, entries: ContentEntry[]): SuggestedClassPreview {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const reference = resolveSuggestedClassReference(build, entries);
  if (!reference) {
    return {
      reference,
      hasChanges: false,
      warnings: build.classId ? [`No suggested build data for ${build.classId}.`] : ["Choose a class to preview suggestions."],
      traits: [],
      equipment: [],
      status: [],
      inventory: {
        label: "Inventory notes",
        current: build.notes,
        suggested: build.notes,
        changed: false,
      },
      suggestedBuild: build,
    };
  }

  const referencedIds = [
    reference.classId,
    reference.equipment.primaryWeaponId,
    reference.equipment.secondaryWeaponId,
    reference.equipment.armorId,
    ...reference.inventory.choices.flatMap((choice) => choice.options.flatMap((option) => option.contentId ?? [])),
  ].filter((id): id is string => Boolean(id));
  const missingIds = referencedIds.filter((id) => !byId.has(id));
  const suggestedBuild = buildWithSuggestions(build, entries, reference);
  const traits = TRAIT_KEYS.map((key) => ({
    key,
    label: TRAIT_LABELS[key],
    current: build.traits[key],
    suggested: reference.traits[key],
    changed: build.traits[key] !== reference.traits[key],
  }));
  const equipment = suggestedEquipmentPreview(build, reference, byId);
  const status = (Object.keys(STATUS_LABELS) as DerivedStatusField[]).map((field) => ({
    field,
    label: STATUS_LABELS[field],
    current: build.status[field],
    suggested: suggestedBuild.status[field],
    changed: build.status[field] !== suggestedBuild.status[field],
  }));
  const inventory = {
    label: "Inventory notes",
    current: build.notes,
    suggested: suggestedBuild.notes,
    changed: build.notes !== suggestedBuild.notes,
  };
  const hasChanges =
    traits.some((preview) => preview.changed) ||
    equipment.some((preview) => preview.changed) ||
    status.some((preview) => preview.changed) ||
    inventory.changed;

  return {
    reference,
    hasChanges,
    warnings: missingIds.map((id) => `Missing suggested content ID: ${id}`),
    traits,
    equipment,
    status,
    inventory,
    suggestedBuild,
  };
}

export function applySuggestedClassReference(build: CharacterBuild, entries: ContentEntry[]) {
  return previewSuggestedClassReference(build, entries).suggestedBuild;
}
