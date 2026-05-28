import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

vi.mock("./lib/owlbear", () => ({
  describeDiceIntegration: () => ({ bones: "", rumble: "" }),
  isOwlbearAvailable: () => false,
  sendRumbleChat: async () => false,
  showOwlbearNotification: async () => false,
  subscribeToSharedRolls: async () => () => undefined,
  writeLastDualityResult: async () => false,
  broadcastSharedRoll: async () => false,
}));

describe("App navigation", () => {
  test("opens Builds first and disables Packs for now", async () => {
    const { App } = await import("./App");
    const html = renderToStaticMarkup(<App />);
    const nav = html.slice(html.indexOf("<nav"), html.indexOf("</nav>"));
    const buildsIndex = nav.indexOf(">Builds<");
    const srdIndex = nav.indexOf(">SRD<");
    const packsIndex = nav.indexOf(">Packs<");
    const diceIndex = nav.indexOf(">Dice<");

    expect(buildsIndex).toBeGreaterThan(-1);
    expect(srdIndex).toBeGreaterThan(buildsIndex);
    expect(packsIndex).toBeGreaterThan(srdIndex);
    expect(diceIndex).toBeGreaterThan(packsIndex);
    expect(nav).toContain("tab-button tab-button--active");
    expect(nav.indexOf("tab-button tab-button--active")).toBeLessThan(srdIndex);
    expect(nav).toContain('disabled=""');
    expect(nav).toContain("Packs disabled for now");
    expect(html).toContain("Void content");
    expect(html).toContain("Quick roll");
    expect(html).toContain("Shared rolls");
  }, 10000);
});
