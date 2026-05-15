import { suggestedClassReferences, type SuggestedClassReference } from "../data/suggestedClassReferences";
import type { CharacterBuild, ContentEntry } from "./types";

const INVENTORY_START = "[Suggested Class Inventory]";
const INVENTORY_END = "[/Suggested Class Inventory]";

function numericSystemValue(entry: ContentEntry | undefined, key: string) {
  const value = entry?.system?.[key];
  return typeof value === "number" ? value : undefined;
}

function selectedEquipmentIds(reference: SuggestedClassReference) {
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

function formatSuggestedInventory(reference: SuggestedClassReference) {
  const lines = [
    INVENTORY_START,
    `Suggested ${reference.className} starting inventory (PDF p.${reference.source.pdfPage}):`,
    `- Take: ${reference.inventory.always.join(", ")}`,
    ...reference.inventory.choices.map((choice) => `- ${choice.label}: ${formatChoiceOptions(choice.options)}`),
    ...reference.inventory.notes?.map((note) => `- Note: ${note}`) ?? [],
    INVENTORY_END,
  ];

  return lines.join("\n");
}

export function findSuggestedClassReference(classId: string | undefined) {
  return suggestedClassReferences.find((reference) => reference.classId === classId);
}

export function applySuggestedClassReference(build: CharacterBuild, entries: ContentEntry[]) {
  const reference = findSuggestedClassReference(build.classId);

  if (!reference) {
    return build;
  }

  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const selectedIds = selectedEquipmentIds(reference);
  const armor = byId.get(reference.equipment.armorId);
  const classEntry = byId.get(reference.classId);
  const selectedEquipment = [
    ...build.selectedEquipment.filter((id) => {
      const entry = byId.get(id);
      return entry?.system?.equipmentType !== "weapon" && entry?.system?.equipmentType !== "armor";
    }),
    ...selectedIds,
  ].filter((id, index, list) => list.indexOf(id) === index);
  const existingNotes = stripSuggestedInventoryBlock(build.notes);
  const suggestedInventory = formatSuggestedInventory(reference);

  return {
    ...build,
    traits: reference.traits,
    selectedEquipment,
    status: {
      ...build.status,
      maxHp: numericSystemValue(classEntry, "startingHitPoints") ?? build.status.maxHp,
      evasion: numericSystemValue(classEntry, "startingEvasion") ?? build.status.evasion,
      armorScore: numericSystemValue(armor, "baseScore") ?? build.status.armorScore,
      majorThreshold: numericSystemValue(armor, "baseMajorThreshold") ?? build.status.majorThreshold,
      severeThreshold: numericSystemValue(armor, "baseSevereThreshold") ?? build.status.severeThreshold,
    },
    notes: [existingNotes, suggestedInventory].filter(Boolean).join("\n\n"),
  };
}
