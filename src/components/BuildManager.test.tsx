import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { BuildManager } from "./BuildManager";
import { sampleCharacter } from "../data/sampleCharacter";
import srdContent from "../../public/data/srd-core.json";
import type { ContentEntry } from "../lib/types";

const srdEntries = srdContent as ContentEntry[];

vi.mock("../lib/owlbear", () => ({
  linkSelectedTokenToCharacter: async () => undefined,
  updateLinkedTokenStats: async () => false,
}));

describe("BuildManager", () => {
  test("opens in reference view with a clear edit action", () => {
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).toContain("Reference View");
    expect(html).toContain("Edit Build");
    expect(html).not.toContain("Save Build");
    expect(html).toContain("Local character trackers");
  });

  test("shows an autopick button when the selected class has suggestions", () => {
    const guardianWithSpear = {
      ...sampleCharacter,
      classId: "core_class_guardian",
      selectedEquipment: ["core_weapon_spear"],
    };

    const referenceHtml = renderToStaticMarkup(<BuildManager builds={[guardianWithSpear]} entries={srdEntries} onChange={() => undefined} />);
    const editHtml = renderToStaticMarkup(
      <BuildManager builds={[guardianWithSpear]} entries={srdEntries} onChange={() => undefined} initialQuickReference={false} />,
    );

    expect(referenceHtml).not.toContain("Suggestion preview");
    expect(editHtml).toContain("Suggestion preview");
    expect(editHtml.indexOf("Traits")).toBeLessThan(editHtml.indexOf("Suggestion preview"));
    expect(editHtml).toContain("Spear");
    expect(editHtml).toContain("Battleaxe");
    expect(editHtml).toContain("Chainmail Armor");
    expect(editHtml).toContain("Apply suggestions");
  });

  test("shows quick build and wizard builder mode choices", () => {
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).toContain("Quick Build");
    expect(html).toContain("Wizard Builder");
  });

  test("uses a compact character selector instead of a growing card list", () => {
    const secondBuild = { ...sampleCharacter, id: "character:second", name: "Second Build", level: 2 };
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter, secondBuild]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).toContain("<select");
    expect(html).toContain("Character");
    expect(html).toContain("Second Build - Warrior / Call of the Brave - Level 2");
    expect(html).not.toContain("build-list__item");
  });

  test("shows feature token trackers in reference view", () => {
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).toContain("HP");
    expect(html).toContain("Stress");
  });

  test("shows delete character action", () => {
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).toContain("Delete character");
  });

  test("keeps edit-only derived stats behind edit mode", () => {
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).not.toContain("Derived stats");
    expect(html).not.toContain("Apply derived stats");
  });
});
