import { describe, expect, test } from "vitest";
import { voidPlaytestContent } from "./voidPlaytestContent";

describe("void playtest content", () => {
  test("normalizes class data from the vendored Void data folder", () => {
    const classes = voidPlaytestContent.filter((entry) => entry.type === "class");
    const abilities = voidPlaytestContent.filter((entry) => entry.type === "ability");

    expect(classes.map((entry) => entry.name).sort()).toEqual([
      "Assassin",
      "Brawler",
      "Warlock",
      "Witch",
    ]);
    expect(abilities.some((entry) => entry.name === "Hex")).toBe(true);
    expect(abilities.some((entry) => entry.name === "Patron's Boon")).toBe(true);
    expect(voidPlaytestContent.every((entry) => entry.source === "Void Playtest")).toBe(true);
    expect(voidPlaytestContent.every((entry) => entry.system?.playtest === true)).toBe(true);
  });
});
