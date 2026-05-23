import { describe, expect, test } from "vitest";
import { applyDerivedStatus, buildDerivations } from "./buildDerivations";
import type { CharacterBuild, ContentEntry } from "./types";

const baseBuild: CharacterBuild = {
  id: "character:test",
  name: "Test",
  classId: "class:warrior",
  subclassId: "subclass:brave",
  level: 1,
  selectedDomains: [],
  selectedDomainCards: [],
  selectedAbilities: [],
  selectedEquipment: ["armor:chainmail", "weapon:spear", "weapon:dagger"],
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
    maxHp: 5,
    markedHp: 2,
    maxStress: 6,
    markedStress: 3,
    evasion: 8,
    armorScore: 0,
    armorSlots: 0,
    markedArmor: 1,
    hope: 4,
    majorThreshold: 0,
    severeThreshold: 0,
  },
  notes: "manual notes",
  manualOverrides: {},
};

const entries: ContentEntry[] = [
  {
    id: "core_ancestry_human",
    name: "Human",
    type: "ancestry",
    source: "SRD Core",
    tags: ["ancestry"],
    text: "High Stamina: Gain an additional Stress slot at character creation.",
    system: {},
  },
  {
    id: "class:warrior",
    name: "Warrior",
    type: "class",
    source: "SRD Core",
    tags: ["class"],
    text: "",
    system: {
      startingHitPoints: 6,
      startingEvasion: 10,
    },
  },
  {
    id: "subclass:brave",
    name: "Call of the Brave",
    type: "subclass",
    source: "SRD Core",
    tags: ["subclass"],
    text: "",
    system: {
      spellcastTrait: "presence",
    },
  },
  {
    id: "core_subclass_vengeance:foundation:at-ease",
    name: "At Ease",
    type: "ability",
    source: "SRD Core",
    tags: ["subclass-feature", "foundation", "guardian"],
    text: "Gain an additional Stress slot.",
    system: {},
  },
  {
    id: "armor:chainmail",
    name: "Chainmail Armor",
    type: "item",
    source: "SRD Core",
    tags: ["armor", "tier-1"],
    text: "",
    system: {
      equipmentType: "armor",
      baseScore: 4,
      baseMajorThreshold: 7,
      baseSevereThreshold: 15,
    },
  },
  {
    id: "weapon:spear",
    name: "Spear",
    type: "item",
    source: "SRD Core",
    tags: ["weapon", "primary-physical"],
    text: "",
    system: {
      equipmentType: "weapon",
    },
  },
  {
    id: "weapon:dagger",
    name: "Dagger",
    type: "item",
    source: "SRD Core",
    tags: ["weapon", "secondary-physical"],
    text: "",
    system: {
      equipmentType: "weapon",
    },
  },
];

describe("buildDerivations", () => {
  test("derives class baselines, armor stats, weapons, and spellcast trait from selected content", () => {
    const derivation = buildDerivations(baseBuild, entries);

    expect(derivation.statusByField.maxHp?.derived).toBe(6);
    expect(derivation.statusByField.maxStress?.derived).toBe(6);
    expect(derivation.statusByField.maxStress?.sourceName).toBe("SRD base stress");
    expect(derivation.statusByField.evasion?.derived).toBe(10);
    expect(derivation.statusByField.armorScore?.derived).toBe(4);
    expect(derivation.statusByField.majorThreshold?.derived).toBe(7);
    expect(derivation.statusByField.severeThreshold?.derived).toBe(15);
    expect(derivation.armor?.name).toBe("Chainmail Armor");
    expect(derivation.primaryWeapons.map((entry) => entry.name)).toEqual(["Spear"]);
    expect(derivation.secondaryWeapons.map((entry) => entry.name)).toEqual(["Dagger"]);
    expect(derivation.spellcastTrait).toBe("presence");
  });

  test("derives stress slots from Human High Stamina", () => {
    const derivation = buildDerivations({ ...baseBuild, ancestryId: "core_ancestry_human" }, entries);

    expect(derivation.statusByField.maxStress?.derived).toBe(7);
    expect(derivation.statusByField.maxStress?.sourceName).toBe("High Stamina");
  });

  test("adds multiple stress slot bonuses together", () => {
    const derivation = buildDerivations(
      {
        ...baseBuild,
        ancestryId: "core_ancestry_human",
        selectedAbilities: ["core_subclass_vengeance:foundation:at-ease"],
      },
      entries,
    );

    expect(derivation.statusByField.maxStress?.derived).toBe(8);
    expect(derivation.statusByField.maxStress?.sourceName).toBe("High Stamina, At Ease");
  });

  test("handles builds without selected armor without crashing", () => {
    const derivation = buildDerivations({ ...baseBuild, selectedEquipment: [] }, entries);

    expect(derivation.armor).toBeUndefined();
    expect(derivation.statusByField.armorScore?.derived).toBeUndefined();
    expect(derivation.statusByField.majorThreshold?.derived).toBeUndefined();
    expect(derivation.statusByField.severeThreshold?.derived).toBeUndefined();
  });

  test("applies derived reference fields without changing current tracker values", () => {
    const derivation = buildDerivations(baseBuild, entries);
    const next = applyDerivedStatus(baseBuild, derivation);

    expect(next.status).toMatchObject({
      maxHp: 6,
      markedHp: 2,
      maxStress: 6,
      markedStress: 3,
      evasion: 10,
      armorScore: 4,
      armorSlots: 4,
      markedArmor: 1,
      hope: 4,
      majorThreshold: 7,
      severeThreshold: 15,
    });
  });

  test("applies derived stress slots while preserving current stress marks", () => {
    const derivation = buildDerivations({ ...baseBuild, ancestryId: "core_ancestry_human" }, entries);
    const next = applyDerivedStatus(baseBuild, derivation);

    expect(next.status.maxStress).toBe(7);
    expect(next.status.markedStress).toBe(3);
  });

  test("reverts stress slots to SRD base when bonus selections are removed and reapplied", () => {
    const derivation = buildDerivations({ ...baseBuild, status: { ...baseBuild.status, maxStress: 8 } }, entries);
    const next = applyDerivedStatus({ ...baseBuild, status: { ...baseBuild.status, maxStress: 8 } }, derivation);

    expect(next.status.maxStress).toBe(6);
    expect(next.status.markedStress).toBe(3);
  });
});
