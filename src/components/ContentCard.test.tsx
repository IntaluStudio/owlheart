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
});
