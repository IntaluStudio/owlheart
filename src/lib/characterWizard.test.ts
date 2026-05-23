import { describe, expect, test } from "vitest";
import srdContent from "../../public/data/srd-core.json";
import { voidPlaytestContent } from "../data/voidPlaytestContent";
import {
  WIZARD_DOMAIN_CARD_LIMIT,
  applyWizardClassSelection,
  createWizardDraft,
  getWizardAvailableClasses,
  validateWizardBuild,
} from "./characterWizard";
import type { ContentEntry } from "./types";

const srdEntries = srdContent as ContentEntry[];

describe("character wizard helpers", () => {
  test("creates an unsaved draft with lightweight wizard fields", () => {
    const draft = createWizardDraft();

    expect(draft.id).toMatch(/^character:/);
    expect(draft.name).toBe("New Guardian");
    expect(draft.level).toBe(1);
    expect(draft.pronouns).toBe("");
    expect(draft.description?.clothes).toBe("");
    expect(draft.backgroundAnswers).toEqual([]);
    expect(draft.connections).toHaveLength(2);
  });

  test("applies class sheet suggestions and derived combat stats", () => {
    const next = applyWizardClassSelection(createWizardDraft(), srdEntries, "core_class_guardian");

    expect(next.classId).toBe("core_class_guardian");
    expect(next.selectedDomains).toEqual(["valor", "blade"]);
    expect(next.traits).toEqual({
      agility: 1,
      strength: 2,
      finesse: -1,
      instinct: 0,
      presence: 1,
      knowledge: 0,
    });
    expect(next.selectedEquipment).toEqual(["core_weapon_battleaxe", "core_armor_chainmail_armor"]);
    expect(next.status).toMatchObject({
      maxHp: 7,
      evasion: 9,
      armorScore: 4,
      majorThreshold: 7,
      severeThreshold: 15,
    });
  });

  test("lists Void classes only when Void content is included in the active content entries", () => {
    const srdOnlyNames = getWizardAvailableClasses(srdEntries).map((entry) => entry.name);
    const withVoidNames = getWizardAvailableClasses([...srdEntries, ...voidPlaytestContent]).map((entry) => entry.name);

    expect(srdOnlyNames).not.toContain("Warlock");
    expect(withVoidNames).toContain("Warlock");
    expect(withVoidNames).toContain("Witch");
    expect(withVoidNames).toContain("Assassin");
    expect(withVoidNames).toContain("Brawler");
    expect(withVoidNames).toContain("Blood Hunter");
  });

  test("applies Blood Hunter suggestions when Void content is active", () => {
    const activeContent = [...srdEntries, ...voidPlaytestContent];
    const next = applyWizardClassSelection(createWizardDraft(), activeContent, "the_void_class_bloodhunter");

    expect(next.classId).toBe("the_void_class_bloodhunter");
    expect(next.selectedDomains).toEqual(["blade", "blood"]);
    expect(next.traits).toEqual({
      agility: 2,
      strength: -1,
      finesse: 1,
      instinct: 1,
      presence: 0,
      knowledge: 0,
    });
    expect(next.selectedEquipment).toEqual(["core_weapon_longsword", "core_armor_leather_armor"]);
    expect(next.status).toMatchObject({
      maxHp: 6,
      evasion: 9,
      armorScore: 3,
      majorThreshold: 6,
      severeThreshold: 13,
    });
  });

  test("requires final identity and starting domain-card selections before save", () => {
    const incomplete = {
      ...applyWizardClassSelection(createWizardDraft(), srdEntries, "core_class_guardian"),
      ancestryId: "core_ancestry_elf",
      communityId: "core_community_highborne",
      selectedDomainCards: ["core_domain_card_i_am_your_shield"],
    };

    expect(WIZARD_DOMAIN_CARD_LIMIT).toBe(2);
    expect(validateWizardBuild(incomplete, srdEntries)).toContain("Choose 2 starting domain cards.");

    const ready = {
      ...incomplete,
      name: "Aster Vale",
      selectedDomainCards: ["core_domain_card_i_am_your_shield", "core_domain_card_whirlwind"],
    };

    expect(validateWizardBuild(ready, srdEntries)).toEqual([]);
  });
});
