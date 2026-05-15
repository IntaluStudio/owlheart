import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { QuickReferenceBoard } from "./QuickReferenceBoard";
import type { CharacterBuild, ContentEntry } from "../lib/types";

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
  featureTokens: [],
  status: {
    maxHp: 6,
    markedHp: 1,
    maxStress: 7,
    markedStress: 2,
    evasion: 11,
    armorScore: 3,
    armorSlots: 3,
    markedArmor: 1,
    hope: 0,
    majorThreshold: 8,
    severeThreshold: 15,
  },
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
        onStatusChange={() => undefined}
        onTokenChange={() => undefined}
      />,
    );

    expect(html).toContain("Test Build");
    expect(html).toContain("Local character trackers");
    expect(html).toContain("Hope");
    expect(html).toContain("Agility");
    expect(html).toContain("Scout");
    expect(html).toContain("Thresholds");
    expect(html).toContain("8/15");
    expect(html).toContain("Open card slot");
  });

  test("places selected abilities in the features zone without a duplicate section", () => {
    const classEntry: ContentEntry = {
      id: "class:warrior",
      name: "Warrior",
      type: "class",
      source: "SRD Core",
      tags: ["class", "warrior"],
      text: "Warrior description should stay behind the description toggle.",
    };
    const ability: ContentEntry = {
      id: "ability:combat-training",
      name: "Combat Training",
      type: "ability",
      source: "SRD Core",
      tags: ["class-feature", "warrior"],
      text: "You ignore burden when equipping weapons.",
    };

    const html = renderToStaticMarkup(
      <QuickReferenceBoard
        build={build}
        classEntry={classEntry}
        domainCards={[]}
        abilities={[ability]}
        equipment={[]}
        onRoll={() => undefined}
        onStatusChange={() => undefined}
        onTokenChange={() => undefined}
      />,
    );

    expect(html).toContain("Combat Training");
    expect(html).toContain("Show description");
    expect(html).not.toContain("Warrior description");
    expect(html).not.toContain("Selected Abilities");
  });
});
