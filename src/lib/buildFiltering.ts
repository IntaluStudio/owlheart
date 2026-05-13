import type { CharacterBuild, ContentEntry } from "./types";

function normalized(value?: string) {
  return value?.trim().toLowerCase();
}

function hasSystemListMatch(entry: ContentEntry, key: "classIds" | "subclassIds", selectedId?: string) {
  if (!selectedId) {
    return false;
  }

  const value = entry.system?.[key];
  return Array.isArray(value) && value.some((id) => String(id) === selectedId);
}

function isManualExtra(entry: ContentEntry, build: CharacterBuild) {
  return build.manualOverrides.extraAvailableContentIds?.includes(entry.id) ?? false;
}

export function isWithinBuildLevel(entry: ContentEntry, build: CharacterBuild) {
  if (build.manualOverrides.ignoreLevelRequirements || isManualExtra(entry, build)) {
    return true;
  }

  return entry.level === undefined || entry.level <= build.level;
}

export function isDomainCardAvailableToBuild(entry: ContentEntry, build: CharacterBuild) {
  if (entry.type !== "domain-card") {
    return false;
  }

  if (!isWithinBuildLevel(entry, build)) {
    return false;
  }

  if (build.manualOverrides.ignoreDomainRequirements || isManualExtra(entry, build)) {
    return true;
  }

  const selectedDomains = new Set(build.selectedDomains.map(normalized).filter(Boolean));
  return Boolean(entry.domain && selectedDomains.has(normalized(entry.domain)));
}

export function getAvailableDomainCardsForBuild(entries: ContentEntry[], build: CharacterBuild) {
  return entries.filter((entry) => isDomainCardAvailableToBuild(entry, build));
}

export function isAbilityAvailableToBuild(entry: ContentEntry, build: CharacterBuild) {
  if (entry.type !== "ability") {
    return false;
  }

  if (!isWithinBuildLevel(entry, build)) {
    return false;
  }

  if (isManualExtra(entry, build)) {
    return true;
  }

  return (
    hasSystemListMatch(entry, "classIds", build.classId) ||
    hasSystemListMatch(entry, "subclassIds", build.subclassId)
  );
}

export function getAvailableAbilitiesForBuild(entries: ContentEntry[], build: CharacterBuild) {
  return entries.filter((entry) => isAbilityAvailableToBuild(entry, build));
}

export function getSelectedReferences(entries: ContentEntry[], build: CharacterBuild) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));

  return {
    ancestry: build.ancestryId ? byId.get(build.ancestryId) : undefined,
    community: build.communityId ? byId.get(build.communityId) : undefined,
    class: build.classId ? byId.get(build.classId) : undefined,
    subclass: build.subclassId ? byId.get(build.subclassId) : undefined,
    domainCards: build.selectedDomainCards.flatMap((id) => byId.get(id) ?? []),
    abilities: build.selectedAbilities.flatMap((id) => byId.get(id) ?? []),
    equipment: build.selectedEquipment.flatMap((id) => byId.get(id) ?? []),
  };
}
