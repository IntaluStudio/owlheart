import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import srdContent from "../../public/data/srd-core.json";
import { voidPlaytestContent } from "../data/voidPlaytestContent";
import { CharacterWizard } from "./CharacterWizard";
import {
  applyWizardClassSelection,
  applyWizardSubclassSelection,
  createWizardDraft,
  finalizeWizardBuild,
  getWizardSubclasses,
  setWizardInventoryChoice,
} from "../lib/characterWizard";
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

  test("does not expose subclass choices until a class is selected", () => {
    const html = renderToStaticMarkup(<CharacterWizard entries={srdEntries} onFinish={() => undefined} />);

    expect(html).toContain("Choose a class first");
    expect(html).toContain("disabled=\"\"");
    expect(html).not.toContain("Call of the Brave</option>");
    expect(getWizardSubclasses(srdEntries, undefined)).toEqual([]);
  });

  test("ignores invalid subclass selections for the current class", () => {
    const classed = applyWizardClassSelection(createWizardDraft(), srdEntries, "core_class_bard");
    const invalid = applyWizardSubclassSelection(classed, srdEntries, "core_subclass_call_of_the_brave");

    expect(invalid.classId).toBe("core_class_bard");
    expect(invalid.subclassId).not.toBe("core_subclass_call_of_the_brave");
  });

  test("stores text-only inventory class item choices for final notes", () => {
    const draft = applyWizardClassSelection(createWizardDraft(), srdEntries, "core_class_wizard");
    const selected = setWizardInventoryChoice(draft, "class-item", "a tiny, harmless elemental pet");
    const finalized = finalizeWizardBuild(selected);

    expect(selected.inventorySelections?.["class-item"]).toBe("a tiny, harmless elemental pet");
    expect(finalized.notes).toContain("Selected wizard inventory:");
    expect(finalized.notes).toContain("class-item: a tiny, harmless elemental pet");
  });

  test("keeps wizard inventory limited to sheet-defined choices", () => {
    const wizardDraft = applyWizardClassSelection(createWizardDraft(), srdEntries, "core_class_wizard");
    const inventoryStepIndex = 6;
    const html = renderToStaticMarkup(
      <CharacterWizard entries={srdEntries} initialDraft={wizardDraft} initialStepIndex={inventoryStepIndex} onFinish={() => undefined} />,
    );

    expect(html).toContain("Minor Health Potion");
    expect(html).toContain("a book you&#x27;re trying to translate");
    expect(html).not.toContain("Stride Potion");
    expect(html).not.toContain("Bolster Potion");
  });

  test("sorts starting domain cards by domain before card name", () => {
    const wizardDraft = applyWizardClassSelection(createWizardDraft(), srdEntries, "core_class_wizard");
    const cardsStepIndex = 9;
    const html = renderToStaticMarkup(
      <CharacterWizard entries={srdEntries} initialDraft={wizardDraft} initialStepIndex={cardsStepIndex} onFinish={() => undefined} />,
    );

    expect(html.indexOf("Book of Ava")).toBeLessThan(html.indexOf("Book of Tyfar"));
    expect(html.indexOf("Book of Tyfar")).toBeLessThan(html.indexOf("Bolt Beacon"));
    expect(html.indexOf("Bolt Beacon")).toBeLessThan(html.indexOf("Mending Touch"));
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
