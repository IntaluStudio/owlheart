import { describe, expect, test } from "vitest";
import { createExperienceRollTarget, createTraitRollTarget, filterContentChoices, splitCardVault } from "./quickReference";
import type { ContentEntry } from "./types";

function card(id: string): ContentEntry {
  return {
    id,
    name: id,
    type: "domain-card",
    source: "SRD Core",
    tags: [],
    text: "",
  };
}

describe("quick reference helpers", () => {
  test("creates trait roll targets with the selected modifier", () => {
    expect(createTraitRollTarget("agility", 2)).toEqual({
      id: "trait:agility",
      label: "Agility",
      modifier: 2,
    });
  });

  test("creates experience roll targets with the selected modifier", () => {
    expect(createExperienceRollTarget({ id: "exp:scout", name: "Scout", modifier: 3 })).toEqual({
      id: "exp:scout",
      label: "Scout",
      modifier: 3,
    });
  });

  test("splits selected cards into visible slots and vault overflow", () => {
    const cards = ["1", "2", "3", "4", "5", "6"].map(card);

    expect(splitCardVault(cards, 5)).toEqual({
      visible: cards.slice(0, 5),
      vault: cards.slice(5),
    });
  });

  test("filters content choices by name, text, tags, and source", () => {
    const choices: ContentEntry[] = [
      { id: "1", name: "Combat Training", type: "ability", source: "Warrior", tags: ["class"], text: "Strike hard." },
      { id: "2", name: "Courage", type: "ability", source: "Guardian", tags: ["hope"], text: "Hold fast." },
    ];

    expect(filterContentChoices(choices, "hope").map((choice) => choice.id)).toEqual(["2"]);
    expect(filterContentChoices(choices, "strike").map((choice) => choice.id)).toEqual(["1"]);
  });
});
