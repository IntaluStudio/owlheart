import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { SrdBrowser } from "./SrdBrowser";
import type { ContentEntry } from "../lib/types";

const blinkOut: ContentEntry = {
  id: "core_card_blink_out",
  name: "Blink Out",
  type: "domain-card",
  source: "SRD Core",
  tags: ["arcana", "spell", "level-4"],
  text: "Make a Spellcast Roll.",
  domain: "arcana",
  level: 4,
  system: { cardType: "spell" },
};

describe("SrdBrowser", () => {
  test("renders an inline selected detail for narrow layouts", () => {
    const html = renderToStaticMarkup(<SrdBrowser entries={[blinkOut]} />);

    expect(html).toContain("srd-inline-detail");
    expect(html).toContain("Make a Spellcast Roll.");
  });
});
