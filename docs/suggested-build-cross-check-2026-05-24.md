# Suggested Build Cross-Check - 2026-05-24

Scope:
- App source: `src/data/suggestedClassReferences.ts`
- Apply path: `src/lib/suggestedBuilds.ts`
- Core PDF: `Reference Data/Character-Sheets-and-Guides-Daggerheart-May212025.pdf`
- Void PDFs:
  - `Reference Data/Witch-v1.5-The-Void.pdf`
  - `Reference Data/Assassin-v1.5-The-Void2.pdf`
  - `Reference Data/Warlock-v1.5-The-Void.pdf`
  - `Reference Data/Brawler-v1.5-The-Void.pdf`
  - `Reference Data/Bloodhunter-v1.5-The-Void.pdf`
- JSON sources:
  - `Reference Data/daggerheart-data-main/core/classes.json`
  - `src/data/voidPlaytest/classes.json`
  - `public/data/srd-core.json`

## What The App Currently Suggests

`suggestedClassReferences.ts` stores one suggested build profile per class:
- suggested traits
- primary weapon
- optional secondary weapon
- armor
- common inventory
- class item choices
- PDF source path and page number

`applySuggestedClassReference(...)` applies those suggestions when the app explicitly asks for class suggestions. It replaces selected weapons/armor, preserves non-weapon/non-armor equipment, sets traits, derives class HP/evasion, derives armor score/slots/thresholds from the selected armor, and writes the suggested inventory block into notes.

Important runtime distinction:
- Wizard class selection calls `applyWizardClassSelection(...)`, which does apply class suggestions immediately. Guardian becomes Battleaxe + Chainmail in this path.
- Quick Builder class changes call `resetBuildForClassChange(...)`, which does not apply class suggestions. It preserves existing selected equipment. If the current build started from the sample character with `core_weapon_spear`, changing the class to Guardian can leave Spear selected until the separate "Apply class suggestions" action is used.

## Summary

Core classes match the PDF guide pages for suggested traits, primary weapons, secondary weapons, and armor.

Void classes mostly match the PDF guide pages, but the app records the source page as `1` for each Void class while the suggested traits/equipment are on page `2` of each Void PDF.

Blood Hunter needs special handling: the PDF has two suggested trait/weapon variants, but the app stores only the Ghost Slayer / Mutant default.

The Guardian/Spear behavior is not a source-data mismatch. `core_class_guardian` correctly suggests Battleaxe + Chainmail, and the Wizard helper test expects `["core_weapon_battleaxe", "core_armor_chainmail_armor"]`. Spear comes from `src/data/sampleCharacter.ts` and `sample-data/character-build.sample.json`; Quick Builder class changes preserve that existing equipment unless class suggestions are explicitly applied.

## Class Suggestion Check

| Class | App source page has suggestions? | PDF evidence page | Trait match | Primary match | Secondary match | Armor match | Class item source match | Notes |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| Bard | yes | 2 | yes | Rapier | Small Dagger | Gambeson | yes |  |
| Druid | yes | 6 | yes | Shortstaff | Round Shield | Leather | yes |  |
| Guardian | yes | 8 | yes | Battleaxe | none | Chainmail | yes |  |
| Ranger | yes | 11 | yes | Shortbow | none | Leather | yes |  |
| Rogue | yes | 13 | yes | Dagger | Small Dagger | Gambeson | yes |  |
| Seraph | yes | 15 | yes | Hallowed Axe | Round Shield | Chainmail | yes |  |
| Sorcerer | yes | 17 | yes | Dualstaff | none | Gambeson | yes |  |
| Warrior | yes | 19 | yes | Longsword | none | Chainmail | yes |  |
| Wizard | yes | 21 | yes | Greatstaff | none | Leather | yes |  |
| Witch | no | 2 | yes | Dualstaff | none | Gambeson | yes | App `pdfPage: 1` points to the class sheet page; suggestions are on p.2. |
| Assassin | no | 2 | yes | Broadsword | Shortsword | Leather | yes | App `pdfPage: 1` points to the class sheet page; suggestions are on p.2. |
| Warlock | no | 2 | yes | Scepter | none | Leather | yes | App `pdfPage: 1` points to the class sheet page; suggestions are on p.2. |
| Brawler | no | 2 | yes | Quarterstaff | none | Leather | yes | App `pdfPage: 1` points to the class sheet page; suggestions are on p.2. |
| Blood Hunter | no | 2 | partial | Longsword | none | Leather | yes | App stores the Ghost Slayer / Mutant trait and weapon profile only. PDF also has a Lycan variant. App `pdfPage: 1` points to the class sheet page; suggestions are on p.2. |

## Blood Hunter Variant Detail

The Blood Hunter PDF lists shared suggested traits plus subclass-specific differences:

| Variant | PDF suggested traits | PDF suggested primary weapon | App status |
| --- | --- | --- | --- |
| Ghost Slayer / Mutant | +2 Agility, -1 Strength, +1 Finesse, +1 Instinct, 0 Presence, 0 Knowledge | Longsword | App matches this variant. |
| Lycan | +1 Agility, +2 Strength, -1 Finesse, +1 Instinct, 0 Presence, 0 Knowledge | Battleaxe | Not represented by current class-level suggestion. |

Recommended behavior:
- Keep the class-level Blood Hunter default as Ghost Slayer / Mutant if only one default is allowed.
- Better: add subclass-aware suggested profiles so selecting `the_void_subclass_order_of_the_lycan` can suggest the Lycan trait and weapon profile.

## Inventory Choice Check

Class item choices in the app match `classItems` in JSON for every suggested class.

| Class | App class item options | JSON source match |
| --- | --- | --- |
| Bard | a romance novel / a letter never opened | yes |
| Druid | a small bag of rocks and bones / a strange pendant found in the dirt | yes |
| Guardian | a totem from your mentor / a secret key | yes |
| Ranger | a trophy from your first kill / a seemingly broken compass | yes |
| Rogue | a set of forgery tools / a grappling hook | yes |
| Seraph | a bundle of offerings / a sigil of your god | yes |
| Sorcerer | a whispering orb / a family heirloom | yes |
| Warrior | the drawing of a lover / a sharpening stone | yes |
| Wizard | a book you're trying to translate / a tiny, harmless elemental pet | yes |
| Witch | a handcrafted besom / a pouch of animal bones you found in the wild | yes |
| Assassin | a list of names with several marked off / a mortar and pestle inscribed with a mysterious insignia | yes |
| Warlock | a carving that symbolizes your patron / a ring you can't remove | yes |
| Brawler | hand wraps from a mentor / a book about your secret hobby | yes |
| Blood Hunter | a steel needle / a vial holding a foe's blood | yes |

The shared minor consumable IDs also exist in `public/data/srd-core.json`:
- `core_consumable_minor_health_potion`
- `core_consumable_minor_stamina_potion`

## Follow-Up Fixes

Recommended app cleanup:

1. Update Void suggested class `source.pdfPage` values from `1` to `2`, or split the source metadata into `sheetPage` and `guidePage`.
2. Add subclass-aware suggested references for Blood Hunter:
   - Ghost Slayer / Mutant: current values.
   - Lycan: traits `{ agility: 1, strength: 2, finesse: -1, instinct: 1, presence: 0, knowledge: 0 }`, primary weapon `core_weapon_battleaxe`, armor `core_armor_leather_armor`.
3. Consider making suggested build application preview-based for Void Blood Hunter so subclass selection can revise the class-level default without overwriting manual user choices silently.
4. Decide whether Quick Builder class changes should offer an explicit "Apply Guardian suggestions" prompt when existing class weapon/armor choices remain from a previous class or sample build.
