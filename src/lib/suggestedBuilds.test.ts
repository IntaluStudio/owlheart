import { describe, expect, test } from "vitest";
import srdContent from "../../public/data/srd-core.json";
import { sampleCharacter } from "../data/sampleCharacter";
import { applySuggestedClassReference, findSuggestedClassReference } from "./suggestedBuilds";
import type { CharacterBuild, ContentEntry } from "./types";

const srdEntries = srdContent as ContentEntry[];

describe("suggested build helpers", () => {
  test("finds suggested reference data by selected class", () => {
    const reference = findSuggestedClassReference("core_class_warrior");

    expect(reference?.className).toBe("Warrior");
  });

  test("applies suggested class traits, equipment, status, and inventory notes", () => {
    const blankishBuild: CharacterBuild = {
      ...sampleCharacter,
      selectedEquipment: ["homebrew:keepsake"],
      traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      status: {
        maxHp: 0,
        markedHp: 2,
        maxStress: 6,
        markedStress: 1,
        evasion: 0,
        armorScore: 0,
        armorSlots: 4,
        markedArmor: 1,
        hope: 0,
        majorThreshold: 0,
        severeThreshold: 0,
      },
      notes: "Existing note.",
    };

    const next = applySuggestedClassReference(blankishBuild, srdEntries);

    expect(next.traits).toEqual({
      agility: 2,
      strength: 1,
      finesse: 0,
      instinct: 1,
      presence: -1,
      knowledge: 0,
    });
    expect(next.selectedEquipment).toEqual(["homebrew:keepsake", "core_weapon_longsword", "core_armor_chainmail_armor"]);
    expect(next.status).toMatchObject({
      maxHp: 6,
      markedHp: 2,
      maxStress: 6,
      markedStress: 1,
      evasion: 11,
      armorScore: 4,
      armorSlots: 4,
      markedArmor: 1,
      majorThreshold: 7,
      severeThreshold: 15,
    });
    expect(next.notes).toContain("Existing note.");
    expect(next.notes).toContain("Suggested Warrior starting inventory");
    expect(next.notes).toContain("Minor Health Potion or Minor Stamina Potion");
    expect(next.notes).toContain("the drawing of a lover or a sharpening stone");
  });
});
