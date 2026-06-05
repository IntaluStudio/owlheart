import type { CharacterBuild, ContentEntry } from "./types";
import { isSubclassTierAvailable } from "./abilityTiers";

function getStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function getClassDomains(classEntry?: ContentEntry) {
  return getStringArray(classEntry?.system?.domainIds ?? classEntry?.domains).map((domain) =>
    domain.trim().toLowerCase(),
  );
}

export function getClassFeatureAbilityIds(entries: ContentEntry[], classId?: string) {
  if (!classId) {
    return [];
  }

  return entries
    .filter((entry) => entry.type === "ability")
    .filter((entry) => entry.system?.ownerKind === "class")
    .filter((entry) => getStringArray(entry.system?.classIds).includes(classId))
    .map((entry) => entry.id);
}

export function getSubclassFeatureAbilityIds(entries: ContentEntry[], subclassId?: string, level = 1) {
  if (!subclassId) {
    return [];
  }

  return entries
    .filter((entry) => entry.type === "ability")
    .filter((entry) => entry.system?.ownerKind === "subclass")
    .filter((entry) => getStringArray(entry.system?.subclassIds).includes(subclassId))
    .filter((entry) => isSubclassTierAvailable(entry, level))
    .map((entry) => entry.id);
}

export function getAutoSelectedAbilityIds(entries: ContentEntry[], classId?: string, subclassId?: string, level = 1) {
  return [...getClassFeatureAbilityIds(entries, classId), ...getSubclassFeatureAbilityIds(entries, subclassId, level)];
}

function preserveManualAbilityIds(build: CharacterBuild, entries: ContentEntry[]) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));

  return build.selectedAbilities.filter((id) => {
    const entry = byId.get(id);
    return Boolean(entry && entry.system?.ownerKind === undefined);
  });
}

export function syncAutoSelectedAbilityIdsForBuild(build: CharacterBuild, entries: ContentEntry[]) {
  return [
    ...preserveManualAbilityIds(build, entries),
    ...getAutoSelectedAbilityIds(entries, build.classId, build.subclassId, build.level),
  ];
}

export function resetBuildForClassChange(
  build: CharacterBuild,
  entries: ContentEntry[],
  nextClassId: string,
): CharacterBuild {
  const classId = nextClassId || undefined;

  if ((build.classId ?? "") === (classId ?? "")) {
    return build;
  }

  const classEntry = classId ? entries.find((entry) => entry.id === classId && entry.type === "class") : undefined;

  return {
    ...build,
    classId,
    subclassId: undefined,
    selectedDomains: getClassDomains(classEntry),
    selectedDomainCards: [],
    selectedAbilities: getClassFeatureAbilityIds(entries, classId),
  };
}

export function resetBuildForSubclassChange(
  build: CharacterBuild,
  entries: ContentEntry[],
  nextSubclassId: string,
): CharacterBuild {
  const subclassId = nextSubclassId || undefined;

  if ((build.subclassId ?? "") === (subclassId ?? "")) {
    return build;
  }

  return {
    ...build,
    subclassId,
    selectedAbilities: syncAutoSelectedAbilityIdsForBuild({ ...build, subclassId }, entries),
  };
}
