import { describe, expect, test } from "vitest";
import { suggestedClassReferences } from "./suggestedClassReferences";
import { TRAIT_KEYS } from "../lib/types";
import srdContent from "../../public/data/srd-core.json";

describe("suggestedClassReferences", () => {
  test("covers every SRD class with traits, equipment, and inventory choices", () => {
    expect(suggestedClassReferences).toHaveLength(9);

    for (const reference of suggestedClassReferences) {
      expect(reference.classId).toMatch(/^core_class_/);
      expect(Object.keys(reference.traits).sort()).toEqual([...TRAIT_KEYS].sort());
      expect(reference.equipment.primaryWeaponId).toMatch(/^core_weapon_/);
      expect(reference.equipment.armorId).toMatch(/^core_armor_/);
      expect(reference.inventory.always).toContain("a torch");
      expect(reference.inventory.choices.some((choice) => choice.id === "minor-consumable")).toBe(true);
      expect(reference.source.pdfPage).toBeGreaterThan(0);
    }
  });

  test("captures the warrior guide suggestions from the PDF", () => {
    const warrior = suggestedClassReferences.find((reference) => reference.classId === "core_class_warrior");

    expect(warrior).toMatchObject({
      traits: {
        agility: 2,
        strength: 1,
        finesse: 0,
        instinct: 1,
        presence: -1,
        knowledge: 0,
      },
      equipment: {
        primaryWeaponId: "core_weapon_longsword",
        armorId: "core_armor_chainmail_armor",
      },
    });
    expect(warrior?.equipment.secondaryWeaponId).toBeUndefined();
    expect(warrior?.inventory.choices.find((choice) => choice.id === "class-item")?.options).toEqual([
      { label: "the drawing of a lover" },
      { label: "a sharpening stone" },
    ]);
  });

  test("references existing SRD content ids", () => {
    const ids = new Set(srdContent.map((entry) => entry.id));

    for (const reference of suggestedClassReferences) {
      expect(ids.has(reference.classId), reference.classId).toBe(true);
      expect(ids.has(reference.equipment.primaryWeaponId), reference.equipment.primaryWeaponId).toBe(true);
      expect(ids.has(reference.equipment.armorId), reference.equipment.armorId).toBe(true);
      if (reference.equipment.secondaryWeaponId) {
        expect(ids.has(reference.equipment.secondaryWeaponId), reference.equipment.secondaryWeaponId).toBe(true);
      }

      for (const choice of reference.inventory.choices) {
        for (const option of choice.options) {
          if (option.contentId) {
            expect(ids.has(option.contentId), option.contentId).toBe(true);
          }
        }
      }
    }
  });
});
