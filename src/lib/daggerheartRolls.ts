import { getDualityOutcome } from "./duality";
import type { DaggerheartRollInput, DaggerheartRollResult, DualityOutcome } from "./types";

function assertDie(value: number, sides: number, label: string) {
  if (!Number.isInteger(value) || value < 1 || value > sides) {
    throw new Error(`${label} must be between 1 and ${sides}`);
  }
}

function modeAdjustment(input: DaggerheartRollInput) {
  if (input.mode === "normal") {
    return 0;
  }

  assertDie(input.advantageDie ?? 0, 6, input.mode === "advantage" ? "Advantage die" : "Disadvantage die");
  return input.mode === "advantage" ? input.advantageDie ?? 0 : -(input.advantageDie ?? 0);
}

function successText(success?: boolean) {
  if (success === undefined) {
    return "";
  }

  return success ? "Success " : "Failure ";
}

function rollContext(input: DaggerheartRollInput, outcome: DualityOutcome) {
  if (input.kind === "reaction") {
    return "Reaction roll: no Hope/Fear generation.";
  }

  if (outcome === "Critical Success") {
    return "Critical Success: gain Hope and clear Stress.";
  }

  return outcome === "With Hope" ? "Gain Hope." : "GM gains Fear.";
}

function modeLine(input: DaggerheartRollInput, adjustment: number) {
  if (input.mode === "normal") {
    return "Mode: normal";
  }

  return `${input.mode === "advantage" ? "Advantage" : "Disadvantage"} d6: ${adjustment >= 0 ? "+" : ""}${adjustment}`;
}

export function formatDaggerheartRoll(input: DaggerheartRollInput): DaggerheartRollResult {
  assertDie(input.hopeDie, 12, "Hope die");
  assertDie(input.fearDie, 12, "Fear die");

  const adjustment = modeAdjustment(input);
  const total = input.hopeDie + input.fearDie + input.modifier + adjustment;
  const success = input.difficulty === undefined ? undefined : total >= input.difficulty;
  const outcome = getDualityOutcome(input.hopeDie, input.fearDie);
  const labelText = `${input.label}: ${total} ${successText(success)}${outcome}`.trim();
  const copyText = [
    `Daggerheart ${input.kind} roll: ${labelText}`,
    `Hope d12: ${input.hopeDie}`,
    `Fear d12: ${input.fearDie}`,
    `Modifier: ${input.modifier >= 0 ? "+" : ""}${input.modifier}`,
    modeLine(input, adjustment),
    input.difficulty === undefined ? undefined : `Difficulty: ${input.difficulty}`,
    rollContext(input, outcome),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    ...input,
    adjustment,
    total,
    success,
    outcome,
    labelText,
    copyText,
  };
}
