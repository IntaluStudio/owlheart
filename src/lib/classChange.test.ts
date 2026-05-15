import { describe, expect, test } from "vitest";
import { getAutoSelectedAbilityIds, resetBuildForClassChange, resetBuildForSubclassChange } from "./classChange";
import type { CharacterBuild, ContentEntry } from "./types";

const entries: ContentEntry[] = [
  {
    id: "class:warrior",
    name: "Warrior",
    type: "class",
    source: "SRD",
    tags: [],
    text: "",
    system: { domainIds: ["blade", "bone"] },
  },
  {
    id: "class:rogue",
    name: "Rogue",
    type: "class",
    source: "SRD",
    tags: [],
    text: "",
    system: { domainIds: ["midnight", "grace"] },
  },
  {
    id: "ability:warrior-class",
    name: "Combat Training",
    type: "ability",
    source: "SRD",
    tags: [],
    text: "",
    system: { ownerKind: "class", classIds: ["class:warrior"] },
  },
  {
    id: "ability:rogue-class",
    name: "Sneak Attack",
    type: "ability",
    source: "SRD",
    tags: [],
    text: "",
    system: { ownerKind: "class", classIds: ["class:rogue"] },
  },
  {
    id: "ability:rogue-subclass",
    name: "Shadow Stepper",
    type: "ability",
    source: "SRD",
    tags: [],
    text: "",
    system: { ownerKind: "subclass", classIds: ["class:rogue"], subclassIds: ["subclass:rogue"] },
  },
  {
    id: "ability:manual-extra",
    name: "Manual Extra",
    type: "ability",
    source: "Homebrew",
    tags: [],
    text: "",
  },
];

const build: CharacterBuild = {
  id: "character:test",
  name: "Test",
  classId: "class:warrior",
  subclassId: "subclass:warrior",
  level: 1,
  selectedDomains: ["blade", "bone"],
  selectedDomainCards: ["card:warrior"],
  selectedAbilities: ["ability:warrior-class", "ability:warrior-subclass"],
  selectedEquipment: [],
  traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
  experiences: [],
  featureTokens: [],
  status: {
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
  },
  notes: "",
  manualOverrides: {},
};

describe("resetBuildForClassChange", () => {
  test("clears class-dependent picks and auto-selects new class-owned abilities", () => {
    const next = resetBuildForClassChange(build, entries, "class:rogue");

    expect(next.classId).toBe("class:rogue");
    expect(next.subclassId).toBeUndefined();
    expect(next.selectedDomains).toEqual(["midnight", "grace"]);
    expect(next.selectedDomainCards).toEqual([]);
    expect(next.selectedAbilities).toEqual(["ability:rogue-class"]);
    expect(next.traits).toEqual(build.traits);
    expect(next.status).toEqual(build.status);
  });

  test("clears class-dependent picks when class is removed", () => {
    const next = resetBuildForClassChange(build, entries, "");

    expect(next.classId).toBeUndefined();
    expect(next.subclassId).toBeUndefined();
    expect(next.selectedDomains).toEqual([]);
    expect(next.selectedDomainCards).toEqual([]);
    expect(next.selectedAbilities).toEqual([]);
  });
});

describe("resetBuildForSubclassChange", () => {
  test("keeps class abilities, swaps subclass abilities, and preserves manual extras", () => {
    const rogueBuild: CharacterBuild = {
      ...build,
      classId: "class:rogue",
      subclassId: "subclass:old-rogue",
      selectedAbilities: ["ability:rogue-class", "ability:old-subclass", "ability:manual-extra"],
    };

    const next = resetBuildForSubclassChange(rogueBuild, entries, "subclass:rogue");

    expect(next.subclassId).toBe("subclass:rogue");
    expect(next.selectedDomainCards).toEqual(rogueBuild.selectedDomainCards);
    expect(next.selectedAbilities).toEqual([
      "ability:manual-extra",
      "ability:rogue-class",
      "ability:rogue-subclass",
    ]);
  });

  test("returns all auto-selected class and subclass ability ids", () => {
    expect(getAutoSelectedAbilityIds(entries, "class:rogue", "subclass:rogue")).toEqual([
      "ability:rogue-class",
      "ability:rogue-subclass",
    ]);
  });
});
