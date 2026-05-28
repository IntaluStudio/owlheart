# Data Audit - 2026-05-24

Scope:
- Current OwlHeart data:
  - `public/data/srd-core.json`
  - `src/data/voidPlaytest/classes.json`
  - `src/data/voidPlaytest/subclasses.json`
  - `src/data/voidPlaytest/domain-cards.json`
- Reference JSON:
  - `Reference Data/daggerheart-data-main/core`
  - `Reference Data/daggerheart-data-main/the_void`
- Reference PDFs:
  - `Reference Data/Assassin-v1.5-The-Void2.pdf`
  - `Reference Data/Bloodhunter-v1.5-The-Void.pdf`
  - `Reference Data/Brawler-v1.5-The-Void.pdf`
  - `Reference Data/Warlock-v1.5-The-Void.pdf`
  - `Reference Data/Witch-v1.5-The-Void.pdf`
  - `Reference Data/Character-Sheets-and-Guides-Daggerheart-May212025.pdf`

## Results

### Core SRD

`public/data/srd-core.json` matches the normalized reference JSON from `Reference Data/daggerheart-data-main/core`.

- Current entries: 712
- Reference entries after OwlHeart normalization: 712
- Missing entries: 0
- Extra entries: 0
- Changed entries: 0

No cleanup is needed for the generated core SRD data.

### Void Playtest JSON

`src/data/voidPlaytest` matches `Reference Data/daggerheart-data-main/the_void` for all shared records.

- Current normalized entries: 116
- Reference normalized entries: 95
- Missing entries: 0
- Changed shared entries: 0
- Extra current entries: 21 normalized entries, all from Blood Hunter content

Raw file comparison:

| File | Current | Reference | Missing | Extra | Changed |
| --- | ---: | ---: | ---: | ---: | ---: |
| `classes.json` | 5 | 4 | 0 | 1 | 0 |
| `domain-cards.json` | 21 | 21 | 0 | 0 | 0 |
| `subclasses.json` | 11 | 8 | 0 | 3 | 0 |

Extra current raw records:

- `the_void_class_bloodhunter`
- `the_void_subclass_order_of_the_ghost_slayer`
- `the_void_subclass_order_of_the_mutant`
- `the_void_subclass_order_of_the_lycan`

The extra normalized entries are the Blood Hunter class, its class features, its hope feature, the generated Blood domain, and the three Blood Hunter subclasses with their tier features.

### PDF Scan

Text extraction from the PDFs succeeded with `pypdf`.

Extracted text sizes:

| PDF | Pages | Extracted chars |
| --- | ---: | ---: |
| `Assassin-v1.5-The-Void2.pdf` | 3 | 6,723 |
| `Bloodhunter-v1.5-The-Void.pdf` | 6 | 19,957 |
| `Brawler-v1.5-The-Void.pdf` | 4 | 10,149 |
| `Character-Sheets-and-Guides-Daggerheart-May212025.pdf` | 22 | 72,729 |
| `Warlock-v1.5-The-Void.pdf` | 6 | 6,788 |
| `Witch-v1.5-The-Void.pdf` | 6 | 6,875 |

Confirmed class PDF presence:

| Current class | PDF evidence |
| --- | --- |
| Assassin | `Assassin-v1.5-The-Void2.pdf` |
| Blood Hunter | `Bloodhunter-v1.5-The-Void.pdf` |
| Brawler | `Brawler-v1.5-The-Void.pdf` |
| Warlock | `Warlock-v1.5-The-Void.pdf` |
| Witch | `Witch-v1.5-The-Void.pdf` |

Confirmed Blood Hunter subclass PDF presence:

| Current subclass | PDF evidence |
| --- | --- |
| Order of the Ghost Slayer | `Bloodhunter-v1.5-The-Void.pdf` |
| Order of the Mutant | `Bloodhunter-v1.5-The-Void.pdf` |
| Order of the Lycan | `Bloodhunter-v1.5-The-Void.pdf` |

Confirmed starting evasion values visible in class PDFs:

| Class | Current JSON | PDF |
| --- | ---: | ---: |
| Assassin | 12 | 12 |
| Blood Hunter | 9 | 9 |
| Brawler | 10 | 10 |
| Warlock | 11 | 11 |
| Witch | 10 | 10 |

## Cleanup Notes

The reference JSON in `daggerheart-data-main/the_void` is not a complete source for the local Void data because it omits Blood Hunter. The local Blood Hunter records should not be deleted just because they are absent from the reference JSON; they are backed by `Bloodhunter-v1.5-The-Void.pdf`.

The PDF name-presence scan is reliable for class sheets and Blood Hunter subclass names, but not reliable for every subclass/domain-card record. Many subclass and domain-card names were absent from extracted PDF text because the available PDFs do not expose those sections as clean searchable text, or because those records are not represented in the provided class-sheet PDFs.

Recommended next cleanup step:

1. Keep `public/data/srd-core.json` unchanged.
2. Keep the Blood Hunter local records unless the target data policy is "match reference JSON only."
3. If the goal is a complete source-backed Void pack, add a source marker or audit note for Blood Hunter records indicating `Bloodhunter-v1.5-The-Void.pdf` as their source.
4. For deeper PDF-to-JSON validation, compare one Void class PDF at a time against its JSON class and subclass records using manual review around extracted text snippets, starting with Blood Hunter because it is the only known reference-JSON gap.
