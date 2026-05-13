import type { CharacterBuild, HomebrewPack } from "./types";
import { characterBuildSchema, normalizeHomebrewPack } from "./schema";
import { METADATA_KEYS } from "./types";

const STORAGE_PREFIX = "com.fietrah.daggerheart-toolkit";

function storageKey(key: string) {
  return `${STORAGE_PREFIX}:${key}`;
}

function readJson<T>(key: string, fallback: T, parser: (value: unknown) => T): T {
  if (typeof localStorage === "undefined") {
    return fallback;
  }

  const raw = localStorage.getItem(storageKey(key));
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    return parser(parsed);
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(storageKey(key), JSON.stringify(value));
}

export function loadHomebrewPacks() {
  return readJson<HomebrewPack[]>(METADATA_KEYS.homebrewPacks, [], (value) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.flatMap((pack) => {
      try {
        return [normalizeHomebrewPack(pack)];
      } catch {
        return [];
      }
    });
  });
}

export function saveHomebrewPacks(packs: HomebrewPack[]) {
  writeJson(METADATA_KEYS.homebrewPacks, packs);
}

export function loadCharacterBuilds(fallback: CharacterBuild[] = []) {
  return readJson<CharacterBuild[]>(METADATA_KEYS.characters, fallback, (value) => {
    if (!Array.isArray(value)) {
      return fallback;
    }

    return value.flatMap((build) => {
      const parsed = characterBuildSchema.safeParse(build);
      return parsed.success ? [parsed.data] : [];
    });
  });
}

export function saveCharacterBuilds(builds: CharacterBuild[]) {
  writeJson(METADATA_KEYS.characters, builds);
}
