import type { ContentEntry, ContentFilters, ContentType, HomebrewPack } from "./types";

const SEARCH_FIELDS = ["name", "type", "source", "text", "description", "domain"] as const;

function containsQuery(entry: ContentEntry, query: string) {
  if (!query.trim()) {
    return true;
  }

  const haystack = [
    ...SEARCH_FIELDS.map((field) => entry[field]),
    entry.tags.join(" "),
    entry.domains?.join(" "),
    JSON.stringify(entry.system ?? {}),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.trim().toLowerCase());
}

function isInFilter<T extends string>(filter: T[], value?: T | string) {
  return filter.length === 0 || (value ? filter.includes(value as T) : false);
}

export function getActiveContent(srdEntries: ContentEntry[], packs: HomebrewPack[]) {
  const activeHomebrew = packs.filter((pack) => pack.enabled !== false).flatMap((pack) => pack.entries);
  return [...srdEntries, ...activeHomebrew];
}

export function filterContent(entries: ContentEntry[], filters: ContentFilters) {
  return entries.filter((entry) => {
    const matchesQuery = containsQuery(entry, filters.query);
    const matchesCategory = isInFilter<ContentType>(filters.categories, entry.type);
    const matchesLevel = filters.level === undefined || entry.level === filters.level;
    const matchesDomain = filters.domains.length === 0 || Boolean(entry.domain && filters.domains.includes(entry.domain));
    const matchesTags = filters.tags.length === 0 || filters.tags.every((tag) => entry.tags.includes(tag));
    const matchesSource = filters.sources.length === 0 || filters.sources.includes(entry.source);

    return matchesQuery && matchesCategory && matchesLevel && matchesDomain && matchesTags && matchesSource;
  });
}

export function getFilterOptions(entries: ContentEntry[]) {
  const domains = new Set<string>();
  const tags = new Set<string>();
  const sources = new Set<string>();

  for (const entry of entries) {
    if (entry.domain) {
      domains.add(entry.domain);
    }
    for (const tag of entry.tags) {
      tags.add(tag);
    }
    sources.add(entry.source);
  }

  return {
    domains: [...domains].sort(),
    tags: [...tags].sort(),
    sources: [...sources].sort(),
  };
}

export function getContentByType(entries: ContentEntry[], type: ContentType) {
  return entries.filter((entry) => entry.type === type);
}
