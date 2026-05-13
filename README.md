# Daggerheart Toolkit

A lightweight Owlbear Rodeo extension for Daggerheart SRD lookup, homebrew packs, character build references, and duality result formatting.

This extension is intentionally complementary to existing Owlbear Rodeo tools:

- It does not replace Game Master's Daggerheart, Bones, Rumble, or Trackers.
- It does not implement HP, stress, armor, inventory automation, combat automation, chat, or a generic dice roller.
- Character builds reference content by ID instead of duplicating rules text.

## Features

- Searchable SRD browser with filters for category, level, domain, tag, and source.
- JSON homebrew pack import/export with Zod validation and clear validation errors.
- Multiple active homebrew packs shown side by side with SRD content.
- Lightweight character build manager with quick reference mode.
- Build filtering for selected domains, level, class abilities, and selected equipment.
- Manual override toggles for unusual or homebrew builds.
- Duality result formatter for Hope die, Fear die, and modifier.
- Copy result, Owlbear notification output, and Rumble chat metadata output when embedded in Owlbear.

## Setup

```bash
npm install
npm run dev
```

The Vite dev server defaults to:

```text
http://localhost:5173/
```

Add this install URL as a custom Owlbear Rodeo extension:

```text
http://localhost:5173/manifest.json
```

## Deploy on Render

This repo includes `render.yaml` for Render Blueprints.

Render Static Site settings:

```text
Service name: owlheart
Build Command: npm install && npm run build
Publish Directory: dist
```

After Render deploys the site, use the deployed manifest URL as the Owlbear custom extension URL:

```text
https://<your-render-service>.onrender.com/manifest.json
```

You can either create a Render Blueprint from this repo, or create a Render Static Site manually with the settings above.

## Testing

```bash
npm test
npm run build
```

The unit tests cover:

- Duality result parsing and formatting.
- Homebrew validation and collection-key normalization.
- Character build filtering and ID reference resolution.

## Project Structure

```text
public/manifest.json              Owlbear Rodeo extension manifest
sample-data/                      Importable example JSON files
src/data/                         Generated SRD, sample homebrew, sample character
src/lib/                          Pure data, validation, filtering, SDK wrappers
src/components/                   React popover views
src/App.tsx                       App shell and tab routing
scripts/generate-srd.ts           Imports daggersearch/daggerheart-data core JSON
```

## Data Model

Content entries use a normalized shape:

```ts
type ContentEntry = {
  id: string;
  name: string;
  type: "domain" | "domain-card" | "ancestry" | "community" | "class" | "subclass" | "condition" | "item" | "adversary" | "rule" | "ability";
  source: string;
  tags: string[];
  text: string;
  level?: number;
  domain?: string;
  domains?: string[];
  system?: Record<string, unknown>;
};
```

Homebrew packs may use either normalized `entries` or daggerheart-data-style collection keys such as `cards`, `abilities`, `ancestries`, `items`, and `adversaries`. Imported packs are normalized into one active content index.

## Samples

- `sample-data/srd-sample.json`
- `sample-data/homebrew-pack.sample.json`
- `sample-data/character-build.sample.json`

The bundled SRD browser uses generated normalized content from `daggersearch/daggerheart-data/core`.

To refresh it:

```bash
git clone --depth 1 https://github.com/daggersearch/daggerheart-data.git vendor/daggerheart-data
npm run generate:srd
```

## Data and License Notes

The structured SRD sample is intentionally small and paraphrased for development. If you import the full Daggerheart SRD data, preserve the Darrington Press Community Gaming License notice and attribution required by that data source.

## Owlbear Integration

The extension manifest is in `public/manifest.json`.

Namespaced toolkit metadata keys use:

```text
com.intalu.daggerheart-toolkit/...
```

Rumble integration uses its documented chat metadata key:

```text
com.battle-system.friends/metadata_chatlog
```

Bones exposes dice roll/result metadata keys, but this toolkit only formats entered duality results. It does not ask Bones to roll dice.

## References

- Daggerheart SRD: https://www.daggerheart.com/srd/
- Daggerheart structured data: https://github.com/daggersearch/daggerheart-data
- Owlbear Rodeo extension docs: https://docs.owlbear.rodeo/extensions/
- Foundryborne Daggerheart feature overview: https://foundryborne.online/features.html
