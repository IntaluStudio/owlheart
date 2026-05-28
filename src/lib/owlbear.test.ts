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
    getSelection: vi.fn(),
  },
  room: {
    setMetadata: vi.fn(),
    onMetadataChange: vi.fn(),
  },
  scene: {
    items: {
      updateItems: vi.fn(),
    },
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
    mockObr.player.getName.mockResolvedValue("Test Player");
    mockObr.player.getSelection.mockResolvedValue(["token:one"]);
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

  it("broadcasts duality results to room metadata", async () => {
    mockObr.isReady = true;

    const { writeLastDualityResult } = await import("./owlbear");
    const sent = await writeLastDualityResult(
      {
        hopeDie: 8,
        fearDie: 3,
        modifier: 2,
        total: 13,
        outcome: "With Hope",
        label: "13 With Hope",
        copyText: "Daggerheart Duality Roll: 13 With Hope",
      },
      "Agility",
    );

    expect(sent).toBe(true);
    expect(mockObr.room.setMetadata).toHaveBeenCalledWith({
      "com.intalu.daggerheart-toolkit/shared-roll": expect.objectContaining({
        playerName: "Test Player",
        label: "Agility",
        resultText: "13 With Hope",
        total: 13,
        outcome: "With Hope",
      }),
    });
  });

  it("writes selected character stats to linked token metadata", async () => {
    mockObr.isReady = true;

    const { linkSelectedTokenToCharacter } = await import("./owlbear");
    const tokenId = await linkSelectedTokenToCharacter({
      id: "character:test",
      name: "Test",
      level: 1,
      selectedDomains: [],
      selectedDomainCards: [],
      selectedAbilities: [],
      selectedEquipment: [],
      traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      experiences: [],
      featureTokens: [],
      status: {
        maxHp: 6,
        markedHp: 2,
        maxStress: 6,
        markedStress: 1,
        evasion: 10,
        armorScore: 3,
        armorSlots: 3,
        markedArmor: 0,
        hope: 4,
        majorThreshold: 8,
        severeThreshold: 15,
      },
      notes: "",
      manualOverrides: {},
    });

    expect(tokenId).toBe("token:one");
    expect(mockObr.scene.items.updateItems).toHaveBeenCalledWith(["token:one"], expect.any(Function));
  });
});
