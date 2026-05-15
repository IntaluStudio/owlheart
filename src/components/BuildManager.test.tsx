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
    expect(html).toContain("Current Armor");
    expect(html).not.toContain("Marked HP");
    expect(html).not.toContain("Marked Stress");
    expect(html).not.toContain("Marked Armor");
  });

  test("shows an autopick button when the selected class has suggestions", () => {
    const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

    expect(html).toContain("Apply class suggestions");
  });
});
