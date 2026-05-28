import { describe, expect, test } from "vitest";
import { suggestedClassReferences } from "./suggestedClassReferences";
import { TRAIT_KEYS } from "../lib/types";
import { voidPlaytestContent } from "./voidPlaytestContent";
import srdContent from "../../public/data/srd-core.json";

describe("suggestedClassReferences", () => {
  test("covers every SRD class with traits, equipment, and inventory choices", () => {
    const coreReferences = suggestedClassReferences.filter((reference) => reference.classId.startsWith("core_class_"));

    expect(coreReferences).toHaveLength(9);

    for (const reference of coreReferences) {
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

  test("references existing active content ids for shipped core and Void classes", () => {
    const ids = new Set([...srdContent, ...voidPlaytestContent].map((entry) => entry.id));
    const shippedReferences = suggestedClassReferences.filter((reference) => ids.has(reference.classId));

    for (const reference of shippedReferences) {
      expect(ids.has(reference.classId), reference.classId).toBe(true);
      expect(ids.has(reference.equipment.primaryWeaponId), reference.equipment.primaryWeaponId).toBe(true);
      expect(ids.has(reference.equipment.armorId), reference.equipment.armorId).toBe(true);
      if (reference.equipment.secondaryWeaponId) {
        expect(ids.has(reference.equipment.secondaryWeaponId), reference.equipment.secondaryWeaponId).toBe(true);
      }

      for (const override of reference.subclassOverrides ?? []) {
        expect(ids.has(override.subclassId), override.subclassId).toBe(true);
        if (override.equipment?.primaryWeaponId) {
          expect(ids.has(override.equipment.primaryWeaponId), override.equipment.primaryWeaponId).toBe(true);
        }
        if (override.equipment?.secondaryWeaponId) {
          expect(ids.has(override.equipment.secondaryWeaponId), override.equipment.secondaryWeaponId).toBe(true);
        }
        if (override.equipment?.armorId) {
          expect(ids.has(override.equipment.armorId), override.equipment.armorId).toBe(true);
        }
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

  test("uses the Void suggestion guide page for source references", () => {
    const voidReferences = suggestedClassReferences.filter((reference) => reference.classId.startsWith("the_void_class_"));

    expect(voidReferences.length).toBeGreaterThan(0);
    for (const reference of voidReferences) {
      expect(reference.source.pdfPage).toBe(2);
    }
  });

  test("keeps Blood Hunter defaults and exposes the Lycan variant override", () => {
    const bloodHunter = suggestedClassReferences.find((reference) => reference.classId === "the_void_class_bloodhunter");

    expect(bloodHunter?.traits).toEqual({
      agility: 2,
      strength: -1,
      finesse: 1,
      instinct: 1,
      presence: 0,
      knowledge: 0,
    });
    expect(bloodHunter?.equipment.primaryWeaponId).toBe("core_weapon_longsword");
    expect(bloodHunter?.equipment.armorId).toBe("core_armor_leather_armor");
    expect(bloodHunter?.subclassOverrides).toEqual([
      {
        subclassId: "the_void_subclass_order_of_the_lycan",
        label: "Order of the Lycan",
        traits: {
          agility: 1,
          strength: 2,
          finesse: -1,
          instinct: 1,
          presence: 0,
          knowledge: 0,
        },
        equipment: {
          primaryWeaponId: "core_weapon_battleaxe",
          armorId: "core_armor_leather_armor",
        },
      },
    ]);
  });
});
