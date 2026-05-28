import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import srdContent from "../../public/data/srd-core.json";
import { voidPlaytestContent } from "../data/voidPlaytestContent";
import { CharacterWizard } from "./CharacterWizard";
import { applyWizardClassSelection, applyWizardSubclassSelection, createWizardDraft } from "../lib/characterWizard";
import type { ContentEntry } from "../lib/types";

const srdEntries = srdContent as ContentEntry[];

describe("CharacterWizard", () => {
  test("renders the guided builder shell and final save requirements", () => {
    const html = renderToStaticMarkup(<CharacterWizard entries={srdEntries} onFinish={() => undefined} />);

    expect(html).toContain("Wizard Builder");
    expect(html).toContain("01");
    expect(html).toContain("Choose Your Class");
    expect(html).toContain("Review and save");
    expect(html).toContain("2 starting domain cards");
  });

  test("renders explicit empty states instead of blank choice steps", () => {
    const html = renderToStaticMarkup(<CharacterWizard entries={[]} onFinish={() => undefined} />);

    expect(html).toContain("No classes available.");
  });

  test("includes suggestion preview UI for subclass variant differences", () => {
    const entries = [...srdEntries, ...voidPlaytestContent];
    const classed = applyWizardClassSelection(createWizardDraft(), entries, "the_void_class_bloodhunter");
    const lycanDraft = applyWizardSubclassSelection(classed, entries, "the_void_subclass_order_of_the_lycan");
    const html = renderToStaticMarkup(<CharacterWizard entries={entries} initialDraft={lycanDraft} onFinish={() => undefined} />);

    expect(html).toContain("Suggestion preview");
    expect(html).toContain("Order of the Lycan");
    expect(html).toContain("Battleaxe");
  });
});
