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

    const html = renderToStaticMarkup(<BuildManager builds={[guardianWithSpear]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).toContain("Suggestion preview");
    expect(html).toContain("Spear");
    expect(html).toContain("Battleaxe");
    expect(html).toContain("Chainmail Armor");
    expect(html).toContain("Apply suggestions");
  });

  test("shows quick build and wizard builder mode choices", () => {
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).toContain("Quick Build");
    expect(html).toContain("Wizard Builder");
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
