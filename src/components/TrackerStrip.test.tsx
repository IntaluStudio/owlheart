import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TrackerStrip } from "./TrackerStrip";
import type { CharacterBuild } from "../lib/types";

const build = {
  id: "character:test",
  name: "Test",
  level: 1,
  selectedDomains: [],
  selectedDomainCards: [],
  selectedAbilities: [],
  selectedEquipment: [],
  traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
  experiences: [],
  status: {
    maxHp: 6,
    markedHp: 2,
    maxStress: 7,
    markedStress: 1,
    evasion: 10,
    armorScore: 3,
    armorSlots: 4,
    markedArmor: 1,
    hope: 2,
    majorThreshold: 8,
    severeThreshold: 15,
  },
  featureTokens: [{ id: "token:favor", label: "Favor", current: 3, max: 6 }],
  notes: "",
  manualOverrides: {},
} satisfies CharacterBuild;

describe("TrackerStrip", () => {
  it("renders local resource controls", () => {
    const html = renderToStaticMarkup(
      <TrackerStrip build={build} onStatusChange={() => undefined} onTokenChange={() => undefined} />,
    );

    expect(html).toContain("HP");
    expect(html).toContain("2/6");
    expect(html).toContain("Stress");
    expect(html).toContain("1/7");
    expect(html).toContain("Armor");
    expect(html).toContain("1/4");
    expect(html).toContain("Hope");
    expect(html).toContain("Favor");
  });
});
