import { afterEach, describe, expect, it, vi } from "vitest";

const mockObr = vi.hoisted(() => ({
  isAvailable: true,
  isReady: false,
  onReady: vi.fn(),
  notification: {
    show: vi.fn(),
  },
  player: {
    setMetadata: vi.fn(),
    getName: vi.fn(),
  },
}));

vi.mock("@owlbear-rodeo/sdk", () => ({
  default: mockObr,
}));

describe("owlbear integration helpers", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    vi.clearAllMocks();
    mockObr.isAvailable = true;
    mockObr.isReady = false;
  });

  it("returns false instead of hanging when Owlbear never becomes ready", async () => {
    vi.useFakeTimers();
    mockObr.onReady.mockImplementation(() => undefined);

    const { showOwlbearNotification } = await import("./owlbear");
    const result = showOwlbearNotification("test");

    await vi.advanceTimersByTimeAsync(5000);

    await expect(result).resolves.toBe(false);
    expect(mockObr.notification.show).not.toHaveBeenCalled();
  });
});
