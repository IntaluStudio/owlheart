import { buildDerivations, applyDerivedStatus } from "./buildDerivations";
import { getAutoSelectedAbilityIds, resetBuildForClassChange, resetBuildForSubclassChange } from "./classChange";
import { getContentByType } from "./contentIndex";
import { createLocalId } from "./importExport";
import { applySuggestedFeatureTokens } from "./calculationHints";
import { applySuggestedClassReference, findSuggestedClassReference } from "./suggestedBuilds";
import {
  TRAIT_KEYS,
  type CharacterBuild,
  type CharacterConnection,
  type CharacterDescription,
  type CharacterPromptAnswer,
  type ContentEntry,
} from "./types";

export const WIZARD_DOMAIN_CARD_LIMIT = 2;

export const WIZARD_STEPS = [
  { id: "class", number: "01", title: "Choose Your Class", shortLabel: "Class" },
  { id: "ancestry", number: "02", title: "Choose Your Ancestry", shortLabel: "Ancestry" },
  { id: "community", number: "03", title: "Choose Your Community", shortLabel: "Community" },
  { id: "traits", number: "04", title: "Assign Your Traits", shortLabel: "Traits" },
  { id: "weapons", number: "05", title: "Choose Your Weapons", shortLabel: "Weapons" },
  { id: "armor", number: "06", title: "Choose Your Armor", shortLabel: "Armor" },
  { id: "inventory", number: "07", title: "Choose Your Inventory", shortLabel: "Inventory" },
  { id: "description", number: "08", title: "Create Your Background", shortLabel: "Description" },
  { id: "experiences", number: "09", title: "Create Your Experiences", shortLabel: "Experiences" },
  { id: "domains", number: "10", title: "Choose Your Domain Cards", shortLabel: "Cards" },
  { id: "questions", number: "11", title: "Answer Your Questions", shortLabel: "Questions" },
  { id: "name", number: "12", title: "Name Your Character", shortLabel: "Name" },
  { id: "review", number: "13", title: "Review and save", shortLabel: "Review" },
] as const;

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

const emptyDescription: CharacterDescription = {
  clothes: "",
  eyes: "",
  body: "",
  skin: "",
  notes: "",
};

function getStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function getClassDomains(classEntry?: ContentEntry) {
  return getStringArray(classEntry?.system?.domainIds ?? classEntry?.domains).map((domain) => domain.trim().toLowerCase());
}

function selectedEquipmentIds(build: CharacterBuild) {
  return new Set(build.selectedEquipment);
}

function mergePromptAnswers(
  prompts: string[],
  existing: CharacterPromptAnswer[] | undefined,
  prefix: string,
): CharacterPromptAnswer[] {
  const byPrompt = new Map((existing ?? []).map((answer) => [answer.prompt, answer.answer]));

  return prompts.map((prompt, index) => ({
    id: `${prefix}-${index + 1}`,
    prompt,
    answer: byPrompt.get(prompt) ?? "",
  }));
}

function mergeConnections(
  prompts: { id: string; prompt: string }[],
  existing: CharacterConnection[] | undefined,
): CharacterConnection[] {
  const byId = new Map((existing ?? []).map((connection) => [connection.id, connection]));

  return prompts.map((prompt) => ({
    id: prompt.id,
    prompt: prompt.prompt,
    name: byId.get(prompt.id)?.name ?? "",
    answer: byId.get(prompt.id)?.answer ?? "",
  }));
}

export function createWizardDraft(): CharacterBuild {
  return {
    id: createLocalId("character", "wizard"),
    name: "New Guardian",
    level: 1,
    selectedDomains: [],
    selectedDomainCards: [],
    selectedAbilities: [],
    selectedEquipment: [],
    traits: {
      agility: 0,
      strength: 0,
      finesse: 0,
      instinct: 0,
      presence: 0,
      knowledge: 0,
    },
    experiences: [],
    featureTokens: [],
    status: defaultStatus,
    notes: "",
    pronouns: "",
    description: emptyDescription,
    backgroundAnswers: [],
    connections: [
      { id: "connection-1", prompt: "How did I save your life the first time we met?", name: "", answer: "" },
      { id: "connection-2", prompt: "What small gift did you give me that you notice I always carry with me?", name: "", answer: "" },
    ],
    manualOverrides: {},
  };
}

export function getWizardAvailableClasses(entries: ContentEntry[]) {
  return getContentByType(entries, "class");
}

export function getWizardSubclasses(entries: ContentEntry[], classId?: string) {
  return getContentByType(entries, "subclass").filter((entry) => {
    if (!classId) {
      return true;
    }

    return getStringArray(entry.system?.classIds).includes(classId);
  });
}

export function applyWizardClassSelection(build: CharacterBuild, entries: ContentEntry[], classId: string): CharacterBuild {
  const classEntry = entries.find((entry) => entry.id === classId && entry.type === "class");
  const reference = findSuggestedClassReference(classId);
  const resetBuild = resetBuildForClassChange(build, entries, classId);
  const suggestedBuild = applySuggestedClassReference(resetBuild, entries);
  const namedBuild =
    !build.name.trim() || build.name === "New Build" || build.name === "New Guardian"
      ? { ...suggestedBuild, name: `New ${reference?.className ?? classEntry?.name ?? "Character"}` }
      : suggestedBuild;
  const withPrompts = reference
    ? {
        ...namedBuild,
        backgroundAnswers: mergePromptAnswers(reference.backgroundQuestions, build.backgroundAnswers, "background"),
        connections: mergeConnections(reference.connectionPrompts, build.connections),
      }
    : namedBuild;
  const derivation = buildDerivations(withPrompts, entries);

  return applySuggestedFeatureTokens(applyDerivedStatus(withPrompts, derivation), entries);
}

export function applyWizardSubclassSelection(build: CharacterBuild, entries: ContentEntry[], subclassId: string): CharacterBuild {
  return {
    ...resetBuildForSubclassChange(build, entries, subclassId),
    selectedAbilities: getAutoSelectedAbilityIds(entries, build.classId, subclassId),
  };
}

export function setWizardEquipment(build: CharacterBuild, entries: ContentEntry[], equipmentIds: string[]): CharacterBuild {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const stableIds = equipmentIds.filter((id) => byId.has(id));
  const next = {
    ...build,
    selectedEquipment: stableIds,
  };

  return applyDerivedStatus(next, buildDerivations(next, entries));
}

export function toggleWizardEquipment(build: CharacterBuild, entries: ContentEntry[], equipmentId: string): CharacterBuild {
  const selected = selectedEquipmentIds(build);
  if (selected.has(equipmentId)) {
    selected.delete(equipmentId);
  } else {
    selected.add(equipmentId);
  }

  return setWizardEquipment(build, entries, Array.from(selected));
}

export function validateWizardBuild(build: CharacterBuild, entries: ContentEntry[]) {
  const errors: string[] = [];
  const byId = new Map(entries.map((entry) => [entry.id, entry]));

  if (!build.name.trim() || build.name === "New Guardian" || build.name === "New Build") {
    errors.push("Name your character.");
  }

  if (!build.classId || byId.get(build.classId)?.type !== "class") {
    errors.push("Choose a class.");
  }

  if (!build.ancestryId || byId.get(build.ancestryId)?.type !== "ancestry") {
    errors.push("Choose an ancestry.");
  }

  if (!build.communityId || byId.get(build.communityId)?.type !== "community") {
    errors.push("Choose a community.");
  }

  if (TRAIT_KEYS.some((trait) => !Number.isInteger(build.traits[trait]) || build.traits[trait] < -1 || build.traits[trait] > 2)) {
    errors.push("Assign valid trait values from -1 to +2.");
  }

  if (new Set(build.selectedDomainCards).size !== WIZARD_DOMAIN_CARD_LIMIT) {
    errors.push(`Choose ${WIZARD_DOMAIN_CARD_LIMIT} starting domain cards.`);
  }

  return errors;
}

export function getWizardCompletionWarnings(build: CharacterBuild, entries: ContentEntry[]) {
  return validateWizardBuild(build, entries).slice(0, 3);
}

export function getClassDomainIds(entries: ContentEntry[], classId?: string) {
  const classEntry = entries.find((entry) => entry.id === classId && entry.type === "class");
  return getClassDomains(classEntry);
}
