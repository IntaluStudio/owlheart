import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { ContentCard } from "./ContentCard";
import type { ContentEntry } from "../lib/types";

describe("ContentCard", () => {
  test("collapses description-only feature cards by default", () => {
    const entry: ContentEntry = {
      id: "class:warrior",
      name: "Warrior",
      type: "class",
      source: "SRD Core",
      tags: ["class"],
      text: "Long class description that should not dominate the quick board.",
    };

    const html = renderToStaticMarkup(<ContentCard entry={entry} collapsible featureFirst />);

    expect(html).toContain("Show description");
    expect(html).not.toContain("Long class description");
  });

  test("renders domain-card metadata separately from rules text", () => {
    const entry: ContentEntry = {
      id: "card:blink-out",
      name: "Blink Out",
      type: "domain-card",
      source: "SRD Core",
      tags: ["arcana", "spell", "level-4"],
      text: "Make a Spellcast Roll (12).",
      domain: "arcana",
      level: 4,
      system: {
        cardType: "spell",
        recallCost: 1,
      },
    };

    const html = renderToStaticMarkup(<ContentCard entry={entry} />);

    expect(html).toContain("Domain");
    expect(html).toContain("arcana");
    expect(html).toContain("Level");
    expect(html).toContain("4");
    expect(html).toContain("Type");
    expect(html).toContain("spell");
    expect(html).toContain("Cost");
    expect(html).toContain("1");
    expect(html).toContain("Make a Spellcast Roll");
  });
});
