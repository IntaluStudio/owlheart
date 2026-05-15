import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("quick board CSS", () => {
  test("keeps domain card slots to two columns on popover width", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toMatch(/\.card-slot-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
    expect(css).toMatch(/@media\s*\(max-width:\s*420px\)[\s\S]*?\.card-slot-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  });
});
