import { describe, expect, test } from "vitest";
import { groupSrdResults } from "./srdResultGrouping";
import type { ContentEntry } from "./types";

function entry(partial: Partial<ContentEntry> & Pick<ContentEntry, "id" | "name" | "type">): ContentEntry {
  return {
    source: "SRD Core",
    tags: [partial.type],
    text: "",
    ...partial,
  };
}

describe("groupSrdResults", () => {
  test("groups domain cards by domain and level", () => {
    const groups = groupSrdResults([
      entry({ id: "blade-1", name: "Whirlwind", type: "domain-card", domain: "blade", level: 1 }),
      entry({ id: "blade-2", name: "Reckless", type: "domain-card", domain: "blade", level: 2 }),
      entry({ id: "bone-1", name: "Deft Maneuvers", type: "domain-card", domain: "bone", level: 1 }),
    ]);

    expect(groups.map((group) => group.label)).toEqual(["Blade - Level 1", "Blade - Level 2", "Bone - Level 1"]);
    expect(groups.map((group) => group.entries.map((item) => item.id))).toEqual([["blade-1"], ["blade-2"], ["bone-1"]]);
  });

  test("groups items by equipment type", () => {
    const groups = groupSrdResults([
      entry({ id: "armor", name: "Gambeson Armor", type: "item", system: { equipmentType: "armor" } }),
      entry({ id: "weapon", name: "Broadsword", type: "item", system: { equipmentType: "weapon" } }),
      entry({ id: "misc", name: "Rope", type: "item" }),
    ]);

    expect(groups.map((group) => group.label)).toEqual(["Armor", "Weapon", "Other Items"]);
    expect(groups.map((group) => group.entries.map((item) => item.id))).toEqual([["armor"], ["weapon"], ["misc"]]);
  });
});
