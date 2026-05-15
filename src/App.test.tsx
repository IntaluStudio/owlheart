import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

vi.mock("./lib/owlbear", () => ({
  describeDiceIntegration: () => ({ bones: "", rumble: "" }),
  isOwlbearAvailable: () => false,
  sendRumbleChat: async () => false,
  showOwlbearNotification: async () => false,
  writeLastDualityResult: async () => false,
}));

describe("App navigation", () => {
  test("opens Builds first and disables Packs for now", async () => {
    const { App } = await import("./App");
    const html = renderToStaticMarkup(<App />);
    const nav = html.slice(html.indexOf("<nav"), html.indexOf("</nav>"));
    const buildsIndex = nav.indexOf(">Builds<");
    const srdIndex = nav.indexOf(">SRD<");
    const packsIndex = nav.indexOf(">Packs<");
    const dualityIndex = nav.indexOf(">Duality<");

    expect(buildsIndex).toBeGreaterThan(-1);
    expect(srdIndex).toBeGreaterThan(buildsIndex);
    expect(packsIndex).toBeGreaterThan(srdIndex);
    expect(dualityIndex).toBeGreaterThan(packsIndex);
    expect(nav).toContain("tab-button tab-button--active");
    expect(nav.indexOf("tab-button tab-button--active")).toBeLessThan(srdIndex);
    expect(nav).toContain('disabled=""');
    expect(nav).toContain("Packs disabled for now");
  });
});
