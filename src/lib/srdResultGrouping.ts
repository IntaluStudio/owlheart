import type { ContentEntry, ContentType } from "./types";

export type SrdResultGroup = {
  key: string;
  label: string;
  entries: ContentEntry[];
};

const TYPE_LABELS: Record<ContentType, string> = {
  domain: "Domains",
  "domain-card": "Domain Cards",
  ancestry: "Ancestries",
  community: "Communities",
  class: "Classes",
  subclass: "Subclasses",
  condition: "Conditions",
  item: "Items",
  adversary: "Adversaries",
  rule: "Rules",
  ability: "Abilities",
};

function toTitleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function equipmentTypeLabel(entry: ContentEntry) {
  const equipmentType = entry.system?.equipmentType;
  return typeof equipmentType === "string" && equipmentType ? toTitleCase(equipmentType) : "Other Items";
}

function groupInfo(entry: ContentEntry) {
  if (entry.type === "domain-card") {
    const domain = entry.domain ? toTitleCase(entry.domain) : "Other Domains";
    const level = entry.level !== undefined ? `Level ${entry.level}` : "Any Level";
    return {
      key: `domain-card:${domain}:${entry.level ?? "any"}`,
      label: `${domain} - ${level}`,
    };
  }

  if (entry.type === "item") {
    const label = equipmentTypeLabel(entry);
    return {
      key: `item:${label}`,
      label,
    };
  }

  return {
    key: `type:${entry.type}`,
    label: TYPE_LABELS[entry.type],
  };
}

function groupSortValue(group: SrdResultGroup) {
  const first = group.entries[0];

  if (first?.type === "domain-card") {
    return `${first.domain ?? "zz"}:${String(first.level ?? 99).padStart(2, "0")}`;
  }

  if (first?.type === "item" && group.label === "Other Items") {
    return "zzzz";
  }

  return group.label;
}

export function groupSrdResults(entries: ContentEntry[]): SrdResultGroup[] {
  const groups = new Map<string, SrdResultGroup>();

  for (const entry of entries) {
    const info = groupInfo(entry);
    const group = groups.get(info.key);

    if (group) {
      group.entries.push(entry);
    } else {
      groups.set(info.key, { ...info, entries: [entry] });
    }
  }

  return [...groups.values()].sort((left, right) => groupSortValue(left).localeCompare(groupSortValue(right)));
}
