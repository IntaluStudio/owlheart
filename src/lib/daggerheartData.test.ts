import { describe, expect, it } from "vitest";
import { normalizeDaggerheartRelease } from "./daggerheartData";

describe("normalizeDaggerheartRelease", () => {
  it("normalizes domain cards with localized names, feature text, level, and domain", () => {
    const entries = normalizeDaggerheartRelease({
      source: "SRD Core",
      files: {
        "domain-cards.json": [
          {
            id: "core_domain_card_a_soldiers_bond",
            name: { "en-US": "A Soldier's Bond" },
            domain: "BLADE",
            type: "ABILITY",
            level: 2,
            recallCost: 1,
            features: [
              {
                description: [
                  {
                    paragraph: {
                      "en-US": "Once per long rest, when you compliment someone, you can both gain 3 Hope.",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    expect(entries.find((entry) => entry.id === "core_domain_card_a_soldiers_bond")).toMatchObject({
      id: "core_domain_card_a_soldiers_bond",
      name: "A Soldier's Bond",
      type: "domain-card",
      source: "SRD Core",
      level: 2,
      domain: "blade",
      tags: ["blade", "ability", "level-2"],
      text: "Once per long rest, when you compliment someone, you can both gain 3 Hope.",
      system: { cardType: "ability", recallCost: 1 },
    });
  });

  it("creates class entries and class ability entries from class features", () => {
    const entries = normalizeDaggerheartRelease({
      source: "SRD Core",
      files: {
        "classes.json": [
          {
            id: "core_class_bard",
            name: "BARD",
            description: [{ paragraph: { "en-US": "Bards are charismatic performers." } }],
            domains: ["GRACE", "CODEX"],
            startingEvasion: 10,
            startingHitPoints: 5,
            hopeFeature: {
              name: { "en-US": "Make a Scene" },
              description: [{ paragraph: { "en-US": "Spend 3 Hope to Distract a target." } }],
            },
            classFeatures: [
              {
                name: { "en-US": "Rally" },
                description: [{ paragraph: { "en-US": "Give allies a Rally Die." } }],
              },
            ],
          },
        ],
      },
    });

    expect(entries.find((entry) => entry.id === "core_class_bard")).toMatchObject({
      name: "Bard",
      type: "class",
      domains: ["grace", "codex"],
      system: { domainIds: ["grace", "codex"], startingEvasion: 10, startingHitPoints: 5 },
    });
    expect(entries.find((entry) => entry.id === "core_class_bard:feature:rally")).toMatchObject({
      name: "Rally",
      type: "ability",
      text: "Give allies a Rally Die.",
      tags: ["class-feature", "bard"],
      system: { classIds: ["core_class_bard"] },
    });
    expect(entries.find((entry) => entry.id === "core_class_bard:hope:make-a-scene")).toMatchObject({
      name: "Make a Scene",
      type: "ability",
      text: "Spend 3 Hope to Distract a target.",
      tags: ["hope-feature", "bard"],
      system: { classIds: ["core_class_bard"] },
    });
  });

  it("normalizes equipment files as item entries with equipment-specific tags", () => {
    const entries = normalizeDaggerheartRelease({
      source: "SRD Core",
      files: {
        "weapons.json": [
          {
            id: "core_weapon_broadsword",
            name: { "en-US": "Broadsword" },
            type: "PRIMARY_PHYSICAL",
            tier: 1,
            trait: "AGILITY",
            range: "MELEE",
            damage: { dice: "D8", type: "PHYSICAL" },
            burden: "ONE_HANDED",
            features: [
              {
                name: { "en-US": "Reliable" },
                description: [{ paragraph: { "en-US": "+1 to attack rolls" } }],
              },
            ],
          },
        ],
      },
    });

    expect(entries[0]).toMatchObject({
      id: "core_weapon_broadsword",
      name: "Broadsword",
      type: "item",
      tags: ["weapon", "primary-physical", "tier-1"],
      text: "Reliable: +1 to attack rolls",
      system: {
        equipmentType: "weapon",
        tier: 1,
        trait: "agility",
        range: "melee",
        damage: { dice: "D8", type: "PHYSICAL" },
      },
    });
  });
});
