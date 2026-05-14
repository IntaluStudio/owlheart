import { describe, expect, it } from "vitest";
import type { CharacterBuild, ContentEntry } from "./types";
import {
  getAvailableAbilitiesForBuild,
  getAvailableDomainCardsForBuild,
  getSelectedReferences,
} from "./buildFiltering";

const entries: ContentEntry[] = [
  {
    id: "srd:domain-card:blade:whirlwind",
    name: "Whirlwind",
    type: "domain-card",
    source: "SRD Core",
    tags: ["attack"],
    text: "Attack nearby targets.",
    level: 1,
    domain: "blade",
  },
  {
    id: "srd:domain-card:bone:deathrun",
    name: "Deathrun",
    type: "domain-card",
    source: "SRD Core",
    tags: ["movement"],
    text: "Move with impossible speed.",
    level: 10,
    domain: "bone",
  },
  {
    id: "srd:domain-card:arcana:rune-ward",
    name: "Rune Ward",
    type: "domain-card",
    source: "SRD Core",
    tags: ["defense"],
    text: "Create a ward.",
    level: 1,
    domain: "arcana",
  },
  {
    id: "srd:ability:warrior:battle-strategist",
    name: "Battle Strategist",
    type: "ability",
    source: "SRD Core",
    tags: ["class"],
    text: "Warrior feature.",
    system: { classIds: ["srd:class:warrior"] },
  },
  {
    id: "srd:item:spear",
    name: "Spear",
    type: "item",
    source: "SRD Core",
    tags: ["weapon"],
    text: "Melee weapon.",
  },
];

const warrior: CharacterBuild = {
  id: "character:kael",
  name: "Kael",
  ancestryId: "srd:ancestry:human",
  communityId: "srd:community:wanderborne",
  classId: "srd:class:warrior",
  subclassId: "srd:subclass:warrior:call-of-the-brave",
  level: 2,
  selectedDomains: ["blade", "bone"],
  selectedDomainCards: ["srd:domain-card:blade:whirlwind"],
  selectedAbilities: ["srd:ability:warrior:battle-strategist"],
  selectedEquipment: ["srd:item:spear"],
  traits: {
    agility: 0,
    strength: 0,
    finesse: 0,
    instinct: 0,
    presence: 0,
    knowledge: 0,
  },
  experiences: [],
  notes: "",
  manualOverrides: {},
};

describe("build filtering", () => {
  it("shows only domain cards from selected domains at or below the build level", () => {
    const cards = getAvailableDomainCardsForBuild(entries, warrior);

    expect(cards.map((card) => card.id)).toEqual(["srd:domain-card:blade:whirlwind"]);
  });

  it("can ignore domain and level restrictions for unusual builds", () => {
    const cards = getAvailableDomainCardsForBuild(entries, {
      ...warrior,
      manualOverrides: { ignoreDomainRequirements: true, ignoreLevelRequirements: true },
    });

    expect(cards.map((card) => card.id)).toEqual([
      "srd:domain-card:blade:whirlwind",
      "srd:domain-card:bone:deathrun",
      "srd:domain-card:arcana:rune-ward",
    ]);
  });

  it("shows class abilities that match the build class", () => {
    const abilities = getAvailableAbilitiesForBuild(entries, warrior);

    expect(abilities.map((ability) => ability.id)).toEqual([
      "srd:ability:warrior:battle-strategist",
    ]);
  });

  it("resolves selected content by ID without duplicating text into the build", () => {
    const selected = getSelectedReferences(entries, warrior);

    expect(selected.domainCards[0]?.name).toBe("Whirlwind");
    expect(selected.abilities[0]?.name).toBe("Battle Strategist");
    expect(selected.equipment[0]?.name).toBe("Spear");
  });
});
