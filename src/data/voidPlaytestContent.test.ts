import { describe, expect, test } from "vitest";
import { voidPlaytestContent } from "./voidPlaytestContent";

describe("void playtest content", () => {
  test("normalizes class data from the vendored Void data folder", () => {
    const classes = voidPlaytestContent.filter((entry) => entry.type === "class");
    const subclasses = voidPlaytestContent.filter((entry) => entry.type === "subclass");
    const abilities = voidPlaytestContent.filter((entry) => entry.type === "ability");

    expect(classes.map((entry) => entry.name).sort()).toEqual([
      "Assassin",
      "Blood Hunter",
      "Brawler",
      "Warlock",
      "Witch",
    ]);
    expect(abilities.some((entry) => entry.name === "Hex")).toBe(true);
    expect(abilities.some((entry) => entry.name === "Blood Maledict")).toBe(true);
    expect(abilities.some((entry) => entry.name === "Crimson Rite")).toBe(true);
    expect(subclasses.some((entry) => entry.name === "Order of the Ghost Slayer")).toBe(true);
    expect(subclasses.some((entry) => entry.name === "Order of the Mutant")).toBe(true);
    expect(subclasses.some((entry) => entry.name === "Order of the Lycan")).toBe(true);
    expect(
      subclasses
        .filter((entry) => entry.name.startsWith("Order of the"))
        .every((entry) => {
          const system = entry.system as { classIds?: unknown };
          return Array.isArray(system.classIds) && system.classIds.includes("the_void_class_bloodhunter");
        }),
    ).toBe(true);
    expect(abilities.some((entry) => entry.name === "Patron's Boon")).toBe(true);
    expect(voidPlaytestContent.every((entry) => entry.source === "Void Playtest")).toBe(true);
    expect(voidPlaytestContent.every((entry) => entry.system?.playtest === true)).toBe(true);
  });
});
