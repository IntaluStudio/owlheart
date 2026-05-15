# Local Tracker And Roll Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add local-only character resource tracking, character deletion, feature token counters, and richer Daggerheart roll modes without replacing shared Owlbear tracker extensions.

**Architecture:** Extend `CharacterBuild` with backward-compatible local tracker fields, keep roll calculation in pure library functions, and wire the Quick Reference board to update local character state through `BuildManager`. Roll output should use SRD semantics from `core_rule_action_rolls`, `core_rule_reaction_rolls`, and `core_rule_advantage_disadvantage`: action rolls can generate Hope/Fear context, reaction rolls do not, and advantage/disadvantage are d6 adjustments.

**Tech Stack:** React, TypeScript, Vite, Vitest, Zod, existing Three.js dice panel.

---

## File Structure

- `src/lib/types.ts`: Add `hope` and `featureTokens` data types; add roll mode/types.
- `src/lib/schema.ts`: Default old character JSON into the new tracker fields.
- `src/lib/daggerheartRolls.ts`: Pure roll engine for action, trait, and reaction rolls with advantage/disadvantage.
- `src/lib/daggerheartRolls.test.ts`: Unit tests for SRD roll semantics.
- `src/components/TrackerStrip.tsx`: Compact local HP/stress/armor/hope/token controls.
- `src/components/TrackerStrip.test.tsx`: Server-render tests for tracker labels and controls.
- `src/components/QuickReferenceBoard.tsx`: Render tracker controls and use richer roll targets.
- `src/lib/quickReference.ts`: Expand roll target metadata to include roll type and trait label.
- `src/components/DualityDiceRoller.tsx`: Accept roll mode/type/difficulty and display action/reaction-aware output.
- `src/components/BuildManager.tsx`: Pass status update callbacks, add delete character, and preserve local-only state.

---

### Task 1: Extend Character Schema For Local Tracker State

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/schema.ts`
- Test: `src/lib/schema.test.ts`

- [ ] **Step 1: Write failing schema test**

Add this test to `src/lib/schema.test.ts`:

```ts
it("defaults local tracker fields for older character JSON", () => {
  const parsed = validateCharacterBuild({
    id: "character:old",
    name: "Old Build",
    level: 1,
  });

  expect(parsed.status.hope).toBe(0);
  expect(parsed.featureTokens).toEqual([]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- schema`

Expected before implementation: FAIL because `status.hope` or `featureTokens` is missing.

- [ ] **Step 3: Update types**

In `src/lib/types.ts`, add:

```ts
export type CharacterFeatureToken = {
  id: string;
  label: string;
  current: number;
  max?: number;
  sourceContentId?: string;
};
```

Update `CharacterStatusReference`:

```ts
export type CharacterStatusReference = {
  maxHp: number;
  markedHp: number;
  maxStress: number;
  markedStress: number;
  evasion: number;
  armorScore: number;
  armorSlots: number;
  markedArmor: number;
  hope: number;
  majorThreshold: number;
  severeThreshold: number;
};
```

Update `CharacterBuild`:

```ts
featureTokens: CharacterFeatureToken[];
```

- [ ] **Step 4: Update Zod schema defaults**

In `src/lib/schema.ts`, add `hope` to `defaultStatus`:

```ts
hope: 0,
```

Add it to `characterStatusSchema`:

```ts
hope: z.number().int().min(0).default(0),
```

Add token schema:

```ts
const characterFeatureTokenSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  current: z.number().int().min(0).default(0),
  max: z.number().int().min(0).optional(),
  sourceContentId: z.string().optional(),
});
```

Add to `characterBuildSchema`:

```ts
featureTokens: z.array(characterFeatureTokenSchema).default([]),
```

- [ ] **Step 5: Update sample/new builds**

Update `src/data/sampleCharacter.ts` and `createBlankBuild` in `src/components/BuildManager.tsx` with:

```ts
hope: 0,
featureTokens: [],
```

- [ ] **Step 6: Verify**

Run:

```bash
npm test -- schema
npx tsc --noEmit
```

Expected: schema tests pass; TypeScript passes.

---

### Task 2: Add Pure Daggerheart Roll Engine

**Files:**
- Create: `src/lib/daggerheartRolls.ts`
- Create: `src/lib/daggerheartRolls.test.ts`
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Add roll types**

In `src/lib/types.ts`, add:

```ts
export type DaggerheartRollKind = "action" | "trait" | "reaction";
export type DaggerheartRollMode = "normal" | "advantage" | "disadvantage";

export type DaggerheartRollInput = {
  kind: DaggerheartRollKind;
  label: string;
  hopeDie: number;
  fearDie: number;
  modifier: number;
  mode: DaggerheartRollMode;
  advantageDie?: number;
  difficulty?: number;
};

export type DaggerheartRollResult = DaggerheartRollInput & {
  adjustment: number;
  total: number;
  success?: boolean;
  outcome: DualityOutcome;
  labelText: string;
  copyText: string;
};
```

- [ ] **Step 2: Write failing roll tests**

Create `src/lib/daggerheartRolls.test.ts`:

```ts
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
```

- [ ] **Step 3: Run tests to verify failure**

Run: `npm test -- daggerheartRolls`

Expected: FAIL because `src/lib/daggerheartRolls.ts` does not exist.

- [ ] **Step 4: Implement roll formatter**

Create `src/lib/daggerheartRolls.ts`:

```ts
import type { DaggerheartRollInput, DaggerheartRollResult } from "./types";
import { getDualityOutcome } from "./duality";

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

function actionContext(input: DaggerheartRollInput, outcome: string) {
  if (input.kind === "reaction") {
    return "Reaction roll: no Hope/Fear generation.";
  }
  if (outcome === "Critical Success") {
    return "Critical Success: gain Hope and clear Stress.";
  }
  if (outcome === "With Hope") {
    return "Gain Hope.";
  }
  return "GM gains Fear.";
}

export function formatDaggerheartRoll(input: DaggerheartRollInput): DaggerheartRollResult {
  assertDie(input.hopeDie, 12, "Hope die");
  assertDie(input.fearDie, 12, "Fear die");

  const adjustment = modeAdjustment(input);
  const total = input.hopeDie + input.fearDie + input.modifier + adjustment;
  const success = input.difficulty === undefined ? undefined : total >= input.difficulty;
  const outcome = getDualityOutcome(input.hopeDie, input.fearDie);
  const labelText = `${input.label}: ${total} ${successText(success)}${outcome}`.trim();
  const modeLine =
    input.mode === "normal"
      ? "Mode: normal"
      : `${input.mode === "advantage" ? "Advantage" : "Disadvantage"} d6: ${adjustment >= 0 ? "+" : ""}${adjustment}`;

  const copyText = [
    `Daggerheart ${input.kind} roll: ${labelText}`,
    `Hope d12: ${input.hopeDie}`,
    `Fear d12: ${input.fearDie}`,
    `Modifier: ${input.modifier >= 0 ? "+" : ""}${input.modifier}`,
    modeLine,
    input.difficulty === undefined ? undefined : `Difficulty: ${input.difficulty}`,
    actionContext(input, outcome),
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
```

- [ ] **Step 5: Verify**

Run:

```bash
npm test -- daggerheartRolls
npx tsc --noEmit
```

Expected: roll tests pass; TypeScript passes.

---

### Task 3: Add Tracker Strip Component

**Files:**
- Create: `src/components/TrackerStrip.tsx`
- Create: `src/components/TrackerStrip.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing render test**

Create `src/components/TrackerStrip.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TrackerStrip } from "./TrackerStrip";
import type { CharacterBuild } from "../lib/types";

const build = {
  id: "character:test",
  name: "Test",
  level: 1,
  selectedDomains: [],
  selectedDomainCards: [],
  selectedAbilities: [],
  selectedEquipment: [],
  traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
  experiences: [],
  status: {
    maxHp: 6,
    markedHp: 2,
    maxStress: 7,
    markedStress: 1,
    evasion: 10,
    armorScore: 3,
    armorSlots: 4,
    markedArmor: 1,
    hope: 2,
    majorThreshold: 8,
    severeThreshold: 15,
  },
  featureTokens: [{ id: "token:favor", label: "Favor", current: 3, max: 6 }],
  notes: "",
  manualOverrides: {},
} satisfies CharacterBuild;

describe("TrackerStrip", () => {
  it("renders local resource controls", () => {
    const html = renderToStaticMarkup(
      <TrackerStrip build={build} onStatusChange={() => undefined} onTokenChange={() => undefined} />,
    );

    expect(html).toContain("HP");
    expect(html).toContain("2/6");
    expect(html).toContain("Stress");
    expect(html).toContain("1/7");
    expect(html).toContain("Armor");
    expect(html).toContain("1/4");
    expect(html).toContain("Hope");
    expect(html).toContain("Favor");
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- TrackerStrip`

Expected: FAIL because `TrackerStrip` does not exist.

- [ ] **Step 3: Implement component**

Create `src/components/TrackerStrip.tsx`:

```tsx
import type { CharacterBuild, CharacterFeatureToken } from "../lib/types";

type TrackerStripProps = {
  build: CharacterBuild;
  onStatusChange: (patch: Partial<CharacterBuild["status"]>) => void;
  onTokenChange: (tokens: CharacterFeatureToken[]) => void;
};

function clamp(value: number, min: number, max?: number) {
  return Math.max(min, max === undefined ? value : Math.min(max, value));
}

function ResourceControl({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="tracker-control">
      <span>{label}</span>
      <div>
        <button type="button" className="icon-button" onClick={() => onChange(clamp(value - 1, 0, max))} aria-label={`Decrease ${label}`}>
          -
        </button>
        <strong>{max === undefined ? value : `${value}/${max}`}</strong>
        <button type="button" className="icon-button" onClick={() => onChange(clamp(value + 1, 0, max))} aria-label={`Increase ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

export function TrackerStrip({ build, onStatusChange, onTokenChange }: TrackerStripProps) {
  const updateToken = (tokenId: string, value: number) => {
    onTokenChange(
      build.featureTokens.map((token) =>
        token.id === tokenId ? { ...token, current: clamp(value, 0, token.max) } : token,
      ),
    );
  };

  return (
    <section className="tracker-strip" aria-label="Local character trackers">
      <ResourceControl label="HP" value={build.status.markedHp} max={build.status.maxHp} onChange={(markedHp) => onStatusChange({ markedHp })} />
      <ResourceControl label="Stress" value={build.status.markedStress} max={build.status.maxStress} onChange={(markedStress) => onStatusChange({ markedStress })} />
      <ResourceControl label="Armor" value={build.status.markedArmor} max={build.status.armorSlots} onChange={(markedArmor) => onStatusChange({ markedArmor })} />
      <ResourceControl label="Hope" value={build.status.hope} onChange={(hope) => onStatusChange({ hope })} />
      {build.featureTokens.map((token) => (
        <ResourceControl
          key={token.id}
          label={token.label}
          value={token.current}
          max={token.max}
          onChange={(value) => updateToken(token.id, value)}
        />
      ))}
    </section>
  );
}
```

- [ ] **Step 4: Add styles**

Append to `src/styles.css`:

```css
.tracker-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
  gap: 8px;
}

.tracker-control {
  display: grid;
  gap: 6px;
  border: 1px solid #d7ddd8;
  border-radius: 8px;
  background: #ffffff;
  padding: 8px;
}

.tracker-control > span {
  color: #50575d;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.tracker-control > div {
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
  gap: 6px;
}

.tracker-control strong {
  text-align: center;
}
```

- [ ] **Step 5: Verify**

Run:

```bash
npm test -- TrackerStrip
npx tsc --noEmit
```

Expected: TrackerStrip test passes; TypeScript passes.

---

### Task 4: Wire Tracker Strip Into Quick Reference

**Files:**
- Modify: `src/components/QuickReferenceBoard.tsx`
- Modify: `src/components/BuildManager.tsx`
- Test: `src/components/QuickReferenceBoard.test.tsx`

- [ ] **Step 1: Write failing QuickReferenceBoard test**

Add to `src/components/QuickReferenceBoard.test.tsx`:

```tsx
it("renders local tracker controls in quick reference mode", () => {
  const html = renderToStaticMarkup(
    <QuickReferenceBoard
      build={sampleCharacter}
      domainCards={[]}
      abilities={[]}
      equipment={[]}
      onRoll={() => undefined}
      onStatusChange={() => undefined}
      onTokenChange={() => undefined}
    />,
  );

  expect(html).toContain("Local character trackers");
  expect(html).toContain("Hope");
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- QuickReferenceBoard`

Expected: FAIL because props/component are not wired yet.

- [ ] **Step 3: Update props and render tracker**

In `src/components/QuickReferenceBoard.tsx`, import:

```ts
import { TrackerStrip } from "./TrackerStrip";
import type { CharacterFeatureToken } from "../lib/types";
```

Update props:

```ts
onStatusChange: (patch: Partial<CharacterBuild["status"]>) => void;
onTokenChange: (tokens: CharacterFeatureToken[]) => void;
```

Render after header:

```tsx
<TrackerStrip build={build} onStatusChange={onStatusChange} onTokenChange={onTokenChange} />
```

- [ ] **Step 4: Wire BuildManager callbacks**

In `src/components/BuildManager.tsx`, pass:

```tsx
onStatusChange={updateStatus}
onTokenChange={(featureTokens) => updateBuild({ featureTokens })}
```

- [ ] **Step 5: Verify**

Run:

```bash
npm test -- QuickReferenceBoard TrackerStrip
npx tsc --noEmit
```

Expected: tests pass; TypeScript passes.

---

### Task 5: Add Feature Token Editing In Build Edit Mode

**Files:**
- Modify: `src/components/BuildManager.tsx`
- Test: `src/components/BuildManager.test.tsx`

- [ ] **Step 1: Write failing render test**

Add to `src/components/BuildManager.test.tsx`:

```tsx
test("shows feature token editor", () => {
  const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

  expect(html).toContain("Feature tokens");
  expect(html).toContain("Add token");
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- BuildManager`

Expected: FAIL because token editor does not exist.

- [ ] **Step 3: Add token helpers**

In `src/components/BuildManager.tsx`, import `CharacterFeatureToken` and add:

```ts
const addFeatureToken = () => {
  if (!selectedBuild) return;
  updateBuild({
    featureTokens: [
      ...selectedBuild.featureTokens,
      { id: createLocalId("token", `${selectedBuild.name}-token`), label: "New Token", current: 0 },
    ],
  });
};

const updateFeatureToken = (tokenId: string, patch: Partial<CharacterFeatureToken>) => {
  if (!selectedBuild) return;
  updateBuild({
    featureTokens: selectedBuild.featureTokens.map((token) => (token.id === tokenId ? { ...token, ...patch } : token)),
  });
};

const removeFeatureToken = (tokenId: string) => {
  if (!selectedBuild) return;
  updateBuild({
    featureTokens: selectedBuild.featureTokens.filter((token) => token.id !== tokenId),
  });
};
```

- [ ] **Step 4: Render token editor**

Place after Experiences:

```tsx
<div className="selection-section">
  <div className="selection-section__header">
    <h3>Feature tokens</h3>
    <button type="button" className="button" onClick={addFeatureToken}>
      <Plus size={16} aria-hidden="true" />
      Add token
    </button>
  </div>
  {selectedBuild.featureTokens.length ? (
    <div className="experience-editor">
      {selectedBuild.featureTokens.map((token) => (
        <div key={token.id} className="experience-editor__row">
          <label>
            <span>Label</span>
            <input value={token.label} onChange={(event) => updateFeatureToken(token.id, { label: event.target.value })} />
          </label>
          <label>
            <span>Current</span>
            <input type="number" min={0} value={token.current} onChange={(event) => updateFeatureToken(token.id, { current: Number(event.target.value) })} />
          </label>
          <label>
            <span>Max</span>
            <input
              type="number"
              min={0}
              value={token.max ?? ""}
              onChange={(event) => updateFeatureToken(token.id, { max: event.target.value ? Number(event.target.value) : undefined })}
            />
          </label>
          <button type="button" className="icon-button icon-button--danger" onClick={() => removeFeatureToken(token.id)} aria-label={`Remove ${token.label}`}>
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  ) : (
    <p className="empty-state">No feature tokens added.</p>
  )}
</div>
```

- [ ] **Step 5: Verify**

Run:

```bash
npm test -- BuildManager
npx tsc --noEmit
```

Expected: test passes; TypeScript passes.

---

### Task 6: Add Delete Character

**Files:**
- Modify: `src/components/BuildManager.tsx`
- Test: `src/components/BuildManager.test.tsx`

- [ ] **Step 1: Write failing render test**

Add to `src/components/BuildManager.test.tsx`:

```tsx
test("shows delete character action", () => {
  const html = renderToStaticMarkup(<BuildManager builds={[sampleCharacter]} entries={srdEntries} onChange={() => undefined} />);

  expect(html).toContain("Delete character");
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- BuildManager`

Expected: FAIL because delete action is not rendered.

- [ ] **Step 3: Implement delete handler**

In `src/components/BuildManager.tsx`, add:

```ts
const deleteSelectedBuild = () => {
  if (!selectedBuild) return;
  if (!window.confirm(`Delete ${selectedBuild.name}? This cannot be undone.`)) return;

  const remaining = builds.filter((build) => build.id !== selectedBuild.id);
  onChange(remaining);
  setSelectedBuildId(remaining[0]?.id);
};
```

- [ ] **Step 4: Render delete button**

In the editor toolbar, add:

```tsx
<button type="button" className="button button--danger" onClick={deleteSelectedBuild}>
  <Trash2 size={16} aria-hidden="true" />
  Delete character
</button>
```

Add styles:

```css
.button--danger {
  border-color: #a83434;
  color: #a83434;
}

.button--danger:hover {
  background: #fff5f5;
}
```

- [ ] **Step 5: Verify**

Run:

```bash
npm test -- BuildManager
npx tsc --noEmit
```

Expected: test passes; TypeScript passes.

---

### Task 7: Upgrade Dice Roller To Roll Modes

**Files:**
- Modify: `src/lib/quickReference.ts`
- Modify: `src/components/DualityDiceRoller.tsx`
- Modify: `src/components/DualityHelper.tsx`
- Test: `src/lib/quickReference.test.ts`

- [ ] **Step 1: Update quick reference roll target test**

In `src/lib/quickReference.test.ts`, assert:

```ts
expect(createTraitRollTarget("agility", 2)).toMatchObject({
  kind: "trait",
  mode: "normal",
  modifier: 2,
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- quickReference`

Expected: FAIL because roll target does not include `kind` and `mode`.

- [ ] **Step 3: Update RollTarget**

In `src/lib/quickReference.ts`, make:

```ts
import type { CharacterExperience, DaggerheartRollKind, DaggerheartRollMode, TraitKey } from "./types";

export type RollTarget = {
  label: string;
  modifier: number;
  kind: DaggerheartRollKind;
  mode: DaggerheartRollMode;
};
```

Return `kind: "trait"` and `mode: "normal"` from trait/experience target helpers.

- [ ] **Step 4: Update DualityDiceRoller props**

In `src/components/DualityDiceRoller.tsx`, replace `formatDualityResult` with `formatDaggerheartRoll`.

Add state:

```ts
const [mode, setMode] = useState<DaggerheartRollMode>(initialMode);
const [difficulty, setDifficulty] = useState<number | undefined>(undefined);
const [advantageDie, setAdvantageDie] = useState(rollD6());
```

When rolling, roll Hope/Fear and roll d6 if mode is not normal.

Use:

```ts
const result = useMemo(
  () => formatDaggerheartRoll({ kind, label, hopeDie, fearDie, modifier, mode, advantageDie, difficulty }),
  [advantageDie, difficulty, fearDie, hopeDie, kind, label, mode, modifier],
);
```

Render segmented controls for `normal`, `advantage`, `disadvantage`, and a Difficulty input.

- [ ] **Step 5: Keep Duality tab as manual fallback**

In `src/components/DualityHelper.tsx`, either keep existing manual formatter or add roll mode controls. For this pass, keep existing manual fallback unchanged to avoid scope creep.

- [ ] **Step 6: Verify**

Run:

```bash
npm test -- quickReference daggerheartRolls
npx tsc --noEmit
```

Expected: tests pass; TypeScript passes.

---

### Task 8: Final Verification

**Files:**
- All touched files

- [ ] **Step 1: Run focused tests**

Run:

```bash
npm test -- schema daggerheartRolls TrackerStrip QuickReferenceBoard BuildManager quickReference
```

Expected: all focused tests pass. If this environment reports `spawn EPERM`, record the blocker and run `npx tsc --noEmit`.

- [ ] **Step 2: Run full test suite**

Run:

```bash
npm test
```

Expected: all tests pass. If blocked by `spawn EPERM`, do not bypass; report the blocker.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: build passes. Existing large chunk warning for Three.js is acceptable.

- [ ] **Step 4: Browser QA**

Use the local app at `http://127.0.0.1:5173/`:

- Quick Reference shows HP, Stress, Armor, Hope controls.
- Buttons increment/decrement current resource values.
- Feature token added in edit mode appears in Quick Reference.
- Delete character shows confirmation and removes the build.
- Trait click opens roller.
- Roller can switch normal / advantage / disadvantage.
- Reaction roll output does not say Hope/Fear is gained.

- [ ] **Step 5: Commit**

Stage only intended files, leaving `Reference Data/` untracked:

```bash
git add src docs
git commit -m "Add local trackers and roll modes"
```

Expected: commit succeeds.
