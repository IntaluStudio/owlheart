import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("quick board CSS", () => {
  test("keeps domain card slots to two columns on popover width", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toMatch(/\.card-slot-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
    expect(css).toMatch(/@media\s*\(max-width:\s*420px\)[\s\S]*?\.card-slot-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  });

  test("keeps manual armor reference fields grouped at popover width", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toMatch(/\.manual-reference-grid\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(240px,\s*1fr\)\)/s);
    expect(css).toMatch(/\.manual-reference-subgrid--pair\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
    expect(css).toMatch(/@media\s*\(max-width:\s*420px\)[\s\S]*?\.manual-reference-grid,[\s\S]*?\.manual-reference-subgrid,[\s\S]*?\.manual-reference-subgrid--pair\s*\{[^}]*grid-template-columns:\s*1fr/s);
  });

  test("keeps available domain card rows aligned in adjacent columns", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toMatch(/\.checkbox-list label\.domain-card-choice\s*\{[^}]*grid-template-columns:\s*18px\s+minmax\(92px,\s*0\.9fr\)\s+minmax\(68px,\s*0\.55fr\)\s+minmax\(220px,\s*2\.2fr\)/s);
    expect(css).toMatch(/@media\s*\(max-width:\s*420px\)[\s\S]*?\.checkbox-list label\.domain-card-choice\s*\{[^}]*grid-template-columns:\s*18px\s+minmax\(0,\s*1fr\)/s);
  });

  test("keeps ability overrides collapsed as an advanced section", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toMatch(/\.advanced-section summary\s*\{/);
    expect(css).toMatch(/\.advanced-section summary\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/s);
  });

  test("gives quick reference roll controls breathing room", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toMatch(/\.roll-toolbar\s*\{[^}]*grid-template-columns:\s*minmax\(170px,\s*0\.9fr\)\s+minmax\(260px,\s*1\.35fr\)\s+minmax\(150px,\s*0\.8fr\)/s);
    expect(css).toMatch(/\.roll-toolbar\s*\{[^}]*gap:\s*14px/s);
    expect(css).toMatch(/@media\s*\(max-width:\s*720px\)[\s\S]*?\.roll-toolbar\s*\{[^}]*grid-template-columns:\s*1fr/s);
  });

  test("keeps quick reference feature cards in natural-height columns", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toMatch(/\.reference-grid--board\s*\{[^}]*column-count:\s*2/s);
    expect(css).toMatch(/\.reference-grid--board \.content-card\s*\{[^}]*break-inside:\s*avoid/s);
    expect(css).toMatch(/@media\s*\(max-width:\s*420px\)[\s\S]*?\.reference-grid--board\s*\{[^}]*column-count:\s*1/s);
  });
});
