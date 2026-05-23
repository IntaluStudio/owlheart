import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import srdContent from "../../public/data/srd-core.json";
import { CharacterWizard } from "./CharacterWizard";
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
});
