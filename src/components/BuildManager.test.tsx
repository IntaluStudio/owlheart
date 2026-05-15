import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { BuildManager } from "./BuildManager";
import { sampleCharacter } from "../data/sampleCharacter";

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
});
