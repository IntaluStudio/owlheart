import { describe, expect, it } from "vitest";
import { formatDaggerheartRoll } from "./daggerheartRolls";

describe("formatDaggerheartRoll", () => {
  it("formats action rolls with success and Hope context", () => {
    const result = formatDaggerheartRoll({
      kind: "action",
      label: "Agility",
      hopeDie: 9,
      fearDie: 3,
      modifier: 2,
      mode: "normal",
      difficulty: 12,
    });

    expect(result.total).toBe(14);
    expect(result.success).toBe(true);
    expect(result.labelText).toBe("Agility: 14 Success With Hope");
    expect(result.copyText).toContain("Gain Hope");
  });

  it("adds advantage d6 to the total", () => {
    const result = formatDaggerheartRoll({
      kind: "trait",
      label: "Strength",
      hopeDie: 4,
      fearDie: 5,
      modifier: 1,
      mode: "advantage",
      advantageDie: 6,
    });

    expect(result.adjustment).toBe(6);
    expect(result.total).toBe(16);
    expect(result.copyText).toContain("Advantage d6: +6");
  });

  it("subtracts disadvantage d6 from the total", () => {
    const result = formatDaggerheartRoll({
      kind: "action",
      label: "Attack",
      hopeDie: 7,
      fearDie: 8,
      modifier: 2,
      mode: "disadvantage",
      advantageDie: 4,
    });

    expect(result.adjustment).toBe(-4);
    expect(result.total).toBe(13);
    expect(result.copyText).toContain("Disadvantage d6: -4");
  });

  it("throws a meaningful error when advantage mode has no advantage die", () => {
    expect(() =>
      formatDaggerheartRoll({
        kind: "action",
        label: "Attack",
        hopeDie: 7,
        fearDie: 8,
        modifier: 2,
        mode: "advantage",
      }),
    ).toThrow(/required/);
  });

  it("validates advantage die range", () => {
    expect(() =>
      formatDaggerheartRoll({
        kind: "action",
        label: "Attack",
        hopeDie: 7,
        fearDie: 8,
        modifier: 2,
        mode: "advantage",
        advantageDie: 0,
      }),
    ).toThrow(/between 1 and 6/);
  });

  it("does not claim Hope or Fear generation for reaction rolls", () => {
    const result = formatDaggerheartRoll({
      kind: "reaction",
      label: "Reaction",
      hopeDie: 12,
      fearDie: 2,
      modifier: 0,
      mode: "normal",
      difficulty: 15,
    });

    expect(result.success).toBe(false);
    expect(result.copyText).not.toContain("Gain Hope");
    expect(result.copyText).not.toContain("GM gains Fear");
  });
});
