import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { DualityDiceRoller } from "./DualityDiceRoller";

vi.mock("../lib/owlbear", () => ({
  sendRumbleChat: async () => false,
  showOwlbearNotification: async () => false,
  writeLastDualityResult: async () => false,
}));

describe("DualityDiceRoller", () => {
  test("keeps roll results out of the scrollable roller panel", () => {
    const html = renderToStaticMarkup(
      <DualityDiceRoller label="Strength" modifier={2} onClose={() => undefined} onRolled={() => undefined} />,
    );

    expect(html).toContain("Duality Roll");
    expect(html).toContain("Strength");
    expect(html).toContain("Roll");
    expect(html).not.toContain("Total");
    expect(html).not.toContain("roll-result");
  });
});
