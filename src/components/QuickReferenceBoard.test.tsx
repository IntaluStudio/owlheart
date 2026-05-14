import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { QuickReferenceBoard } from "./QuickReferenceBoard";
import type { CharacterBuild } from "../lib/types";

const build: CharacterBuild = {
  id: "character:test",
  name: "Test Build",
  level: 2,
  selectedDomains: [],
  selectedDomainCards: [],
  selectedAbilities: [],
  selectedEquipment: [],
  traits: {
    agility: 1,
    strength: 0,
    finesse: 0,
    instinct: 0,
    presence: 0,
    knowledge: 0,
  },
  experiences: [{ id: "exp:scout", name: "Scout", modifier: 2 }],
  notes: "",
  manualOverrides: {},
};

describe("QuickReferenceBoard", () => {
  test("renders clickable traits and experiences", () => {
    const html = renderToStaticMarkup(
      <QuickReferenceBoard
        build={build}
        domainCards={[]}
        abilities={[]}
        equipment={[]}
        onRoll={() => undefined}
      />,
    );

    expect(html).toContain("Test Build");
    expect(html).toContain("Agility");
    expect(html).toContain("Scout");
    expect(html).toContain("Open card slot");
  });
});
