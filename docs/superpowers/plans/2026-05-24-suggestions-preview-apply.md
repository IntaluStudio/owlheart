# Suggestions Preview/Apply Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make class, subclass, trait, weapon, armor, and inventory suggestions explicit preview/apply automation so users can see suggested changes before they overwrite manual character build choices.

**Architecture:** Centralize suggestion resolution in `src/lib/suggestedBuilds.ts`, keep source data in `src/data/suggestedClassReferences.ts`, and make Quick Builder and Character Wizard consume the same preview/apply contract.

**Tech Stack:** Vite, React, TypeScript, existing OwlHeart build state and test utilities.

---

## Source Context

Use these audit docs as the source of truth for this patch:

- `docs/suggested-build-cross-check-2026-05-24.md`
- `docs/feature-mechanics-index-v2-2026-05-24.md`

Known findings to preserve:

- Core class suggestions match the official character guide source.
- Guardian's suggested build is Battleaxe plus Chainmail Armor, not Spear.
- Spear appears because Quick Builder class changes currently preserve existing equipment, including sample character equipment.
- `applyWizardClassSelection(...)` already applies class suggestions automatically and currently gives Guardian Battleaxe plus Chainmail Armor.
- `handleClassChange(...)` in Quick Builder calls `resetBuildForClassChange(...)`, which preserves existing equipment until the user explicitly applies class suggestions.
- Void class suggestion source pages are recorded as `pdfPage: 1`, but the actual suggestion page is page 2 in those PDFs.
- Blood Hunter has source variants: Ghost Slayer and Mutant use Longsword and the current default trait profile; Lycan uses Battleaxe and a different trait profile.

## Non-Goals

- Do not implement full mechanics-index automation for roll hooks, Hope/Fear hooks, token prompts, or conditional feature effects in this patch.
- Do not silently apply choice-based or conditional benefits from ancestry, class, subclass, domain cards, weapons, armor, or consumables.
- Do not overwrite manual equipment choices on class or subclass change without an explicit user action.
- Do not refactor unrelated build, inventory, or derivation systems.

## Implementation Tasks

- [ ] Inspect the current suggestion flow before editing.
  - Read `src/data/suggestedClassReferences.ts`.
  - Read `src/lib/suggestedBuilds.ts`.
  - Read `src/lib/classChange.ts`.
  - Read `src/lib/characterWizard.ts`.
  - Read the relevant Quick Builder and Character Wizard components.
  - Confirm current tests around suggested builds and wizard class selection.

- [ ] Update suggestion source data.
  - In `src/data/suggestedClassReferences.ts`, update Void class `source.pdfPage` values from `1` to `2`, unless the patch chooses a more explicit `sheetPage` and `guidePage` source shape.
  - Add subclass-aware suggestion data for Blood Hunter Lycan.
  - Keep the current Blood Hunter class default for Ghost Slayer and Mutant:
    - Traits: Agility `+2`, Strength `-1`, Finesse `+1`, Instinct `+1`, Presence `0`, Knowledge `0`.
    - Primary weapon: `core_weapon_longsword`.
  - Add Lycan override for `the_void_subclass_order_of_the_lycan`:
    - Traits: Agility `+1`, Strength `+2`, Finesse `-1`, Instinct `+1`, Presence `0`, Knowledge `0`.
    - Primary weapon: `core_weapon_battleaxe`.
    - Armor: keep the Blood Hunter default armor unless source data says otherwise.
  - Validate every referenced ID exists in loaded game data.

- [ ] Add a shared suggestion resolver.
  - In `src/lib/suggestedBuilds.ts`, add a resolver such as `resolveSuggestedClassReference(build, entries)`.
  - The resolver should start from the class-level suggestion.
  - If `build.subclassId` has a subclass-specific suggestion override, merge it over the class-level suggestion.
  - Keep the merged result deterministic and source-aware so UI can explain whether a suggestion came from class or subclass data.

- [ ] Add a preview contract.
  - In `src/lib/suggestedBuilds.ts`, add a pure function such as `previewSuggestedClassReference(build, entries)`.
  - The preview should report current and suggested values for:
    - Traits.
    - Primary weapon.
    - Secondary weapon, when present.
    - Armor.
    - Relevant status derivations, such as armor score.
    - Suggested inventory note block.
  - Include `hasChanges` so UI can hide or disable Apply when the build already matches.
  - Include `warnings` for missing reference IDs, missing class suggestions, or source data that cannot be applied.
  - Preserve existing behavior that non-weapon and non-armor equipment stays untouched.

- [ ] Split apply from preview.
  - Keep or refactor `applySuggestedClassReference(build, entries)` so it applies the output of the preview/patch function.
  - Ensure applying suggestions removes only recognized selected weapons and armor.
  - Ensure applying suggestions preserves unrelated selected equipment and keepsakes.
  - Ensure applying suggestions updates traits, class status, armor status, and inventory notes in the same way the current helper does.
  - Ensure applying the same suggestion twice is idempotent and does not duplicate inventory note blocks.

- [ ] Update Quick Builder behavior.
  - In `src/components/BuildManager.tsx`, keep class changes conservative: do not auto-apply class suggestions inside `handleClassChange(...)`.
  - After a class change, show an explicit suggestion preview/apply area when a class suggestion exists and differs from the current build.
  - For the Guardian/Spear case, the preview must clearly show Spear will change to Battleaxe and Chainmail Armor will be added or selected.
  - Existing manual equipment should remain until the user clicks Apply.
  - If the user has already applied suggestions, the preview should collapse or show an already-applied state.

- [ ] Update Character Wizard behavior.
  - Reuse the same shared resolver and preview/apply functions as Quick Builder.
  - Keep existing wizard class-selection behavior only if tests and UX confirm this is still desired.
  - Add subclass-aware preview/apply behavior for subclass variants, especially Blood Hunter Lycan.
  - Do not silently overwrite class-default Blood Hunter equipment and traits when the user changes to Lycan after making manual edits; surface the Lycan variant as an explicit suggestion if the build differs.

- [ ] Add focused tests for source data.
  - In `src/data/suggestedClassReferences.test.ts`, assert Void suggestion source pages point to page 2 or to the new explicit guide-page field.
  - Assert all referenced trait, weapon, armor, and inventory IDs exist.
  - Assert Blood Hunter has a Lycan-specific override and keeps Ghost Slayer/Mutant defaults intact.

- [ ] Add focused tests for preview/apply logic.
  - In `src/lib/suggestedBuilds.test.ts`, add a Guardian fixture with existing `core_weapon_spear`.
  - Assert preview reports Spear to Battleaxe and Chainmail Armor as the suggested result.
  - Assert apply replaces Spear with Battleaxe and Chainmail Armor.
  - Assert apply preserves non-weapon and non-armor equipment.
  - Assert apply is idempotent.
  - Assert Blood Hunter with `the_void_subclass_order_of_the_lycan` resolves to the Lycan trait profile and Battleaxe.

- [ ] Update wizard tests.
  - In `src/lib/characterWizard.test.ts`, preserve or revise the existing Guardian expectation deliberately.
  - If class selection still auto-applies suggestions, Guardian should still produce `core_weapon_battleaxe` and `core_armor_chainmail_armor`.
  - Add coverage for Blood Hunter class default versus Lycan subclass variant.
  - Add coverage that subclass variant application is explicit if the implementation keeps subclass changes conservative.

- [ ] Add component-level coverage where the existing test setup supports it.
  - Quick Builder should show a suggestion preview after selecting Guardian while Spear is still selected.
  - Clicking Apply should update the build to Battleaxe plus Chainmail Armor.
  - Character Wizard should expose subclass variant suggestions when a selected subclass changes the source recommendation.

## Acceptance Criteria

- Guardian no longer appears to be "auto built" with Spear without explanation.
- Quick Builder class changes preserve manual equipment but show a clear preview/apply prompt for class suggestions.
- Applying Guardian suggestions changes the build to Battleaxe plus Chainmail Armor.
- Character Wizard and Quick Builder use the same suggestion resolver.
- Blood Hunter Lycan can apply its source-specific trait and weapon recommendation.
- Void source page references point to the actual suggestion page.
- Suggestion apply is idempotent and preserves unrelated equipment.
- Tests cover the Guardian/Spear case directly.

## Verification Commands

Run targeted tests first:

```powershell
npm test -- src/data/suggestedClassReferences.test.ts src/lib/suggestedBuilds.test.ts src/lib/characterWizard.test.ts
```

Run the TypeScript verifier:

```powershell
npx tsc --noEmit
```

If local Vitest or Vite workers fail with a Windows `spawn EPERM` error, record the failure and keep `npx tsc --noEmit` as the minimum local verification for this patch session.

## Handoff Notes

- The most important regression fixture is a Guardian build that currently has `core_weapon_spear`.
- The correct suggestion result for Guardian is `core_weapon_battleaxe` plus `core_armor_chainmail_armor`.
- Do not fix the Spear symptom by clearing all equipment on class change; that would discard manual user choices.
- The durable fix is a visible suggestion preview with an explicit Apply action.
