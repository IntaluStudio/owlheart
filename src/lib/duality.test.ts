import { describe, expect, it } from "vitest";
import { formatDualityResult } from "./duality";

describe("formatDualityResult", () => {
  it("formats a roll with Hope when the hope die is higher", () => {
    const result = formatDualityResult({ hopeDie: 11, fearDie: 4, modifier: 2 });

    expect(result.total).toBe(17);
    expect(result.outcome).toBe("With Hope");
    expect(result.label).toBe("17 With Hope");
    expect(result.copyText).toContain("Hope d12: 11");
    expect(result.copyText).toContain("Fear d12: 4");
  });

  it("formats a roll with Fear when the fear die is higher", () => {
    const result = formatDualityResult({ hopeDie: 3, fearDie: 10, modifier: -1 });

    expect(result.total).toBe(12);
    expect(result.outcome).toBe("With Fear");
    expect(result.label).toBe("12 With Fear");
  });

  it("formats matching dice as a critical success", () => {
    const result = formatDualityResult({ hopeDie: 8, fearDie: 8, modifier: 4 });

    expect(result.total).toBe(20);
    expect(result.outcome).toBe("Critical Success");
    expect(result.label).toBe("20 Critical Success");
  });

  it("rejects die values outside a d12", () => {
    expect(() => formatDualityResult({ hopeDie: 0, fearDie: 4, modifier: 0 })).toThrow(
      "Hope die must be between 1 and 12",
    );
    expect(() => formatDualityResult({ hopeDie: 4, fearDie: 13, modifier: 0 })).toThrow(
      "Fear die must be between 1 and 12",
    );
  });
});
