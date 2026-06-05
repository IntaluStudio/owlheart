import { describe, expect, it } from "vitest";
import { normalizeHomebrewPack, validateCharacterBuild, validateHomebrewPack } from "./schema";

describe("homebrew pack validation", () => {
  it("accepts a normalized homebrew pack with domain cards and abilities", () => {
    const pack = validateHomebrewPack({
      schemaVersion: 1,
      id: "homebrew:ash-and-iron",
      name: "Ash and Iron",
      source: "Ash and Iron Playtest",
      entries: [
        {
          id: "homebrew:ashen-step",
          name: "Ashen Step",
          type: "domain-card",
          source: "Ash and Iron Playtest",
          tags: ["movement", "fire"],
          text: "Spend a Hope to move through smoke or ash within Close range.",
          level: 2,
          domain: "midnight",
          system: { cardType: "spell", recallCost: 1 },
        },
        {
          id: "homebrew:ember-oath",
          name: "Ember Oath",
          type: "ability",
          source: "Ash and Iron Playtest",
          tags: ["class-feature"],
          text: "When you protect an ally, describe the oath that drives you.",
          system: { classIds: ["srd:class:guardian"] },
        },
      ],
    });

    expect(pack.entries).toHaveLength(2);
    expect(pack.entries[0].id).toBe("homebrew:ashen-step");
  });

  it("accepts daggerheart-data style collection keys and normalizes them into entries", () => {
    const pack = normalizeHomebrewPack({
      schemaVersion: 1,
      id: "homebrew:storm-road",
      name: "Storm Road",
      source: "Storm Road",
      cards: [
        {
          id: "homebrew:storm-road:skyhook",
          name: "Skyhook",
          type: "domain-card",
          source: "Storm Road",
          tags: ["mobility"],
          text: "Latch lightning to a fixed point and pull yourself to it.",
          level: 3,
          domain: "arcana",
        },
      ],
      adversaries: [
        {
          id: "homebrew:storm-road:glass-vulture",
          name: "Glass Vulture",
          type: "adversary",
          source: "Storm Road",
          tags: ["tier-1"],
          text: "A scavenger that dives through mirror-bright clouds.",
        },
      ],
    });

    expect(pack.entries.map((entry) => entry.id)).toEqual([
      "homebrew:storm-road:skyhook",
      "homebrew:storm-road:glass-vulture",
    ]);
  });

  it("returns clear validation issues for malformed imports", () => {
    const result = validateHomebrewPack.safeParse({
      schemaVersion: 1,
      id: "bad-pack",
      name: "",
      source: "Bad Pack",
      entries: [{ id: "bad-card", name: "No Type" }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toContain("entries.0.type");
    }
  });
});

describe("character build validation", () => {
  it("accepts old builds and defaults lightweight roll data", () => {
    const build = validateCharacterBuild({
      id: "character:old",
      name: "Old Build",
      level: 1,
      selectedDomains: [],
      selectedDomainCards: [],
      selectedAbilities: [],
      selectedEquipment: [],
      notes: "",
      manualOverrides: {},
    });

    expect(build.traits).toEqual({
      agility: 0,
      strength: 0,
      finesse: 0,
      instinct: 0,
      presence: 0,
      knowledge: 0,
    });
    expect(build.experiences).toEqual([]);
    expect(build.status).toEqual({
      maxHp: 0,
      markedHp: 0,
      maxStress: 6,
      markedStress: 0,
      evasion: 0,
      armorScore: 0,
      armorSlots: 0,
      markedArmor: 0,
      hope: 0,
      majorThreshold: 0,
      severeThreshold: 0,
    });
    expect(build.featureTokens).toEqual([]);
  });

  it("accepts optional wizard character details without requiring them on old builds", () => {
    const build = validateCharacterBuild({
      id: "character:wizard",
      name: "Wizard Build",
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
      notes: "",
      manualOverrides: {},
      pronouns: "they/them",
      description: {
        clothes: "Weathered traveling leathers",
        eyes: "Gold-flecked",
        body: "Broad-shouldered",
        skin: "Sun-browned",
      },
      backgroundAnswers: [{ id: "guardian-1", prompt: "Who did you fail to protect?", answer: "An old mentor." }],
      connections: [{ id: "connection-1", prompt: "How did I save your life?", name: "Mara", answer: "Pulled me from a ruin." }],
      inventorySelections: {
        "class-item": "a tiny, harmless elemental pet",
      },
    });

    expect(build.pronouns).toBe("they/them");
    expect(build.description?.clothes).toBe("Weathered traveling leathers");
    expect(build.backgroundAnswers?.[0].answer).toBe("An old mentor.");
    expect(build.connections?.[0].name).toBe("Mara");
    expect(build.inventorySelections?.["class-item"]).toBe("a tiny, harmless elemental pet");
  });

  it("accepts optional beastform and companion trackers without requiring them on old builds", () => {
    const build = validateCharacterBuild({
      id: "character:forms",
      name: "Forms Build",
      level: 1,
      selectedDomains: [],
      selectedDomainCards: [],
      selectedAbilities: [],
      selectedEquipment: [],
      notes: "",
      manualOverrides: {},
      beastform: {
        name: "Bear",
        attackDice: "2d8+2",
        status: {
          maxHp: 3,
          markedHp: 1,
          maxStress: 2,
          markedStress: 0,
          evasion: 12,
          armorScore: 1,
          armorSlots: 1,
          markedArmor: 0,
          hope: 0,
          majorThreshold: 8,
          severeThreshold: 14,
        },
      },
      companion: {
        name: "Rook",
        status: {
          maxHp: 2,
          markedHp: 0,
          maxStress: 3,
          markedStress: 1,
          evasion: 13,
          armorScore: 0,
          armorSlots: 0,
          markedArmor: 0,
          hope: 0,
          majorThreshold: 6,
          severeThreshold: 12,
        },
      },
    });

    expect(build.beastform?.name).toBe("Bear");
    expect(build.beastform?.attackDice).toBe("2d8+2");
    expect(build.companion?.status.markedStress).toBe(1);
  });
});
