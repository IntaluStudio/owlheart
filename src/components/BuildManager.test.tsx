import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { BuildManager } from "./BuildManager";
import { sampleCharacter } from "../data/sampleCharacter";
import srdContent from "../../public/data/srd-core.json";
import type { ContentEntry } from "../lib/types";

const srdEntries = srdContent as ContentEntry[];

describe("BuildManager", () => {
  test("uses current labels for manually tracked status fields", () => {
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={[]} onChange={() => undefined} />);

    expect(html).toContain("Current HP");
    expect(html).toContain("Current Stress");
    expect(html).toContain("Marked armor");
    expect(html).toContain("Armor score / slots");
    expect(html).not.toContain("Marked HP");
    expect(html).not.toContain("Marked Stress");
  });

  test("shows an autopick button when the selected class has suggestions", () => {
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).toContain("Apply class suggestions");
  });

  test("shows quick build and wizard builder mode choices", () => {
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).toContain("Quick Build");
    expect(html).toContain("Wizard Builder");
  });

  test("shows feature token editor", () => {
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).toContain("Feature tokens");
    expect(html).toContain("Add token");
  });

  test("shows delete character action", () => {
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).toContain("Delete character");
  });

  test("shows derived stats preview and apply action", () => {
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).toContain("Derived stats");
    expect(html).toContain("Apply derived stats");
  });
});
