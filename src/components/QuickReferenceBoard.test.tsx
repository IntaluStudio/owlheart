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
    expect(html).toContain("Roll kind");
    expect(html).toContain("Advantage");
    expect(html).toContain("Difficulty");
    expect(html).toContain("Hope");
    expect(html).toContain("Agility");
    expect(html).toContain("Sprint, leap, maneuver");
    expect(html).toContain("Recall, analyze, comprehend");
    expect(html).toContain("Scout");
    expect(html).toContain("Thresholds");
    expect(html).toContain("8/15");
    expect(html).toContain("Open card slot");
  });

  test("shows a persistent last roll result below traits", () => {
    const html = renderToStaticMarkup(
      <QuickReferenceBoard
        build={build}
        domainCards={[]}
        abilities={[]}
        equipment={[]}
        lastRoll={{
          label: "Strength",
          result: {
            kind: "action",
            label: "Strength",
            hopeDie: 8,
            fearDie: 5,
            modifier: 2,
            mode: "normal",
            adjustment: 0,
            total: 15,
            outcome: "With Hope",
            labelText: "Strength: 15 With Hope",
            copyText: "Daggerheart action roll: Strength: 15 With Hope",
          },
        }}
        onRoll={() => undefined}
        onStatusChange={() => undefined}
        onTokenChange={() => undefined}
      />,
    );

    expect(html).toContain("Last roll - Strength");
    expect(html).toContain(">15<");
    expect(html).toContain("With Hope");
    expect(html).toContain("Hope 8 + Fear 5 + 2");
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

  test("enriches subclass cards with level-appropriate linked subclass features", () => {
    const subclass: ContentEntry = {
      id: "subclass:brave",
      name: "Call of the Brave",
      type: "subclass",
      source: "SRD Core",
      tags: ["subclass", "warrior"],
      text: "",
    };
    const foundation: ContentEntry = {
      id: "subclass:brave:foundation:courage",
      name: "Courage",
      type: "ability",
      source: "SRD Core",
      tags: ["subclass-feature", "foundation", "warrior"],
      text: "Gain a bonus when danger rises.",
      system: { subclassIds: ["subclass:brave"] },
    };
    const mastery: ContentEntry = {
      id: "subclass:brave:mastery:camaraderie",
      name: "Camaraderie",
      type: "ability",
      source: "SRD Core",
      tags: ["subclass-feature", "mastery", "warrior"],
      text: "A high-tier rally feature.",
      system: { subclassIds: ["subclass:brave"] },
    };

    const html = renderToStaticMarkup(
      <QuickReferenceBoard
        build={build}
        subclass={subclass}
        domainCards={[]}
        abilities={[]}
        equipment={[]}
        entries={[subclass, foundation, mastery]}
        onRoll={() => undefined}
        onStatusChange={() => undefined}
        onTokenChange={() => undefined}
      />,
    );

    expect(html).toContain("Courage");
    expect(html).toContain("Gain a bonus when danger rises.");
    expect(html).not.toContain("Camaraderie");
    expect(html).not.toContain("A high-tier rally feature.");
  });

  test("renders beastform and companion slides when the build has those features", () => {
    const html = renderToStaticMarkup(
      <QuickReferenceBoard
        build={{
          ...build,
          classId: "core_class_druid",
          subclassId: "core_subclass_beastbound",
          selectedAbilities: ["core_class_druid:feature:beastform", "core_subclass_beastbound:foundation:companion"],
          beastform: {
            name: "Bear",
            attackDice: "2d8+2",
            status: { ...build.status, markedHp: 0, maxHp: 4, evasion: 13 },
          },
          companion: {
            name: "Rook",
            status: { ...build.status, markedStress: 1, maxStress: 3, evasion: 12 },
          },
        }}
        classEntry={{ id: "core_class_druid", name: "Druid", type: "class", source: "SRD Core", tags: ["class"], text: "" }}
        subclass={{ id: "core_subclass_beastbound", name: "Beastbound", type: "subclass", source: "SRD Core", tags: ["subclass"], text: "" }}
        domainCards={[]}
        abilities={[
          { id: "core_class_druid:feature:beastform", name: "Beastform", type: "ability", source: "SRD Core", tags: ["class-feature"], text: "" },
          { id: "core_subclass_beastbound:foundation:companion", name: "Companion", type: "ability", source: "SRD Core", tags: ["subclass-feature"], text: "" },
        ]}
        equipment={[]}
        onRoll={() => undefined}
        onStatusChange={() => undefined}
        onTokenChange={() => undefined}
        onAlternateTrackerChange={() => undefined}
      />,
    );

    expect(html).toContain("Character");
    expect(html).toContain("Beastform");
    expect(html).toContain("Companion");
    expect(html).toContain("Bear");
    expect(html).toContain("2d8+2");
  });
});
