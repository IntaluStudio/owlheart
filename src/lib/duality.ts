import type { DualityInput, DualityOutcome, DualityResult } from "./types";

function assertD12(value: number, label: "Hope" | "Fear") {
  if (!Number.isInteger(value) || value < 1 || value > 12) {
    throw new Error(`${label} die must be between 1 and 12`);
  }
}

function assertModifier(value: number) {
  if (!Number.isInteger(value)) {
    throw new Error("Modifier must be an integer");
  }
}

export function getDualityOutcome(hopeDie: number, fearDie: number): DualityOutcome {
  if (hopeDie === fearDie) {
    return "Critical Success";
  }

  return hopeDie > fearDie ? "With Hope" : "With Fear";
}

export function formatModifier(modifier: number): string {
  if (modifier === 0) {
    return "+0";
  }

  return modifier > 0 ? `+${modifier}` : String(modifier);
}

export function formatDualityResult(input: DualityInput): DualityResult {
  assertD12(input.hopeDie, "Hope");
  assertD12(input.fearDie, "Fear");
  assertModifier(input.modifier);

  const total = input.hopeDie + input.fearDie + input.modifier;
  const outcome = getDualityOutcome(input.hopeDie, input.fearDie);
  const label = `${total} ${outcome}`;
  const copyText = [
    `Daggerheart Duality Roll: ${label}`,
    `Hope d12: ${input.hopeDie}`,
    `Fear d12: ${input.fearDie}`,
    `Modifier: ${formatModifier(input.modifier)}`,
  ].join("\n");

  return {
    ...input,
    total,
    outcome,
    label,
    copyText,
  };
}
