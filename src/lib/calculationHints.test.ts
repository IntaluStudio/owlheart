import { describe, expect, test } from "vitest";
import { applySuggestedFeatureTokens, getCalculationHintsForBuild, getSuggestedFeatureTokens } from "./calculationHints";
import type { CharacterBuild, ContentEntry } from "./types";

const rally: ContentEntry = {
  id: "core_class_bard:feature:rally",
  name: "Rally",
  type: "ability",
  source: "SRD Core",
  tags: ["class-feature", "bard"],
  text: "Give yourself and allies a Rally Die.",
};

const reminder: ContentEntry = {
  id: "core_community_loreborne",
  name: "Loreborne",
  type: "community",
  source: "SRD Core",
  tags: ["community"],
  text: "Well-Read: You have advantage on rolls that involve history.",
};

const human: ContentEntry = {
  id: "core_ancestry_human",
  name: "Human",
  type: "ancestry",
  source: "SRD Core",
  tags: ["ancestry"],
  text: "High Stamina: Gain an additional Stress slot at character creation.",
};

const atEase: ContentEntry = {
  id: "core_subclass_vengeance:foundation:at-ease",
  name: "At Ease",
  type: "ability",
  source: "SRD Core",
  tags: ["subclass-feature", "foundation", "guardian"],
  text: "Gain an additional Stress slot.",
};

const vitality: ContentEntry = {
  id: "core_domain_card_vitality",
  name: "Vitality",
  type: "domain-card",
  source: "SRD Core",
  tags: ["blade", "ability", "level-5"],
  text: "When you choose this card, permanently gain two benefits from a list that includes one Stress slot.",
};

const build: CharacterBuild = {
  id: "character:test",
  name: "Test",
  communityId: reminder.id,
  level: 1,
  selectedDomains: [],
  selectedDomainCards: [],
  selectedAbilities: [rally.id],
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

describe("calculation hints", () => {
  test("returns selected token suggestions and reminder-only hints", () => {
    const hints = getCalculationHintsForBuild(build, [rally, reminder]);

    expect(hints.map((hint) => hint.type)).toEqual(expect.arrayContaining(["featureToken", "rollReminder"]));
    expect(getSuggestedFeatureTokens(build, [rally, reminder]).map((token) => token.label)).toEqual(["Rally Die"]);
  });

  test("applies suggested tokens without duplicating existing tokens", () => {
    const withToken = applySuggestedFeatureTokens(build, [rally, reminder]);
    const appliedAgain = applySuggestedFeatureTokens(withToken, [rally, reminder]);

    expect(withToken.featureTokens).toHaveLength(1);
    expect(withToken.featureTokens[0]).toMatchObject({
      label: "Rally Die",
      current: 1,
      sourceContentId: rally.id,
    });
    expect(appliedAgain.featureTokens).toHaveLength(1);
  });

  test("returns reliable stress slot status bonuses", () => {
    const hints = getCalculationHintsForBuild(
      {
        ...build,
        ancestryId: human.id,
        selectedAbilities: [atEase.id],
      },
      [human, atEase],
    );

    expect(hints.filter((hint) => hint.type === "statusBonus")).toEqual([
      {
        type: "statusBonus",
        sourceContentId: human.id,
        label: "High Stamina",
        field: "maxStress",
        amount: 1,
        note: "High Stamina grants +1 Stress slot at character creation.",
      },
      {
        type: "statusBonus",
        sourceContentId: atEase.id,
        label: "At Ease",
        field: "maxStress",
        amount: 1,
        note: "At Ease grants +1 Stress slot.",
      },
    ]);
  });

  test("does not return a stress bonus for optional-choice Vitality", () => {
    const hints = getCalculationHintsForBuild(
      {
        ...build,
        selectedDomainCards: [vitality.id],
      },
      [vitality],
    );

    expect(hints.filter((hint) => hint.type === "statusBonus")).toEqual([]);
  });
});
