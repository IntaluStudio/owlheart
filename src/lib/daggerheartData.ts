import type { ContentEntry } from "./types";

type JsonRecord = Record<string, unknown>;

type DaggerheartReleaseInput = {
  source: string;
  files: Record<string, unknown>;
};

const FILE_TYPE_MAP: Record<string, ContentEntry["type"]> = {
  "ancestries.json": "ancestry",
  "classes.json": "class",
  "communities.json": "community",
  "domain-cards.json": "domain-card",
  "rules.json": "rule",
  "subclasses.json": "subclass",
};

const EQUIPMENT_FILES = new Set(["armors.json", "consumables.json", "items.json", "transformations.json", "weapons.json"]);

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordsFrom(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toSlug(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function localize(value: unknown): string {
  if (typeof value === "string") {
    return value === value.toUpperCase() && value.length > 1 ? toTitleCase(value) : value;
  }

  if (isRecord(value)) {
    const localized = value;
    if (typeof localized["en-US"] === "string") {
      return localized["en-US"];
    }

    const firstString = Object.values(localized).find((entry) => typeof entry === "string");
    if (typeof firstString === "string") {
      return firstString;
    }
  }

  return "";
}

function normalizeEnum(value: unknown) {
  return toSlug(value);
}

function textFromDescription(description: unknown): string {
  return recordsFrom(description)
    .flatMap((block) => {
      if (isRecord(block.paragraph)) {
        return localize(block.paragraph);
      }

      if (Array.isArray(block.list)) {
        return block.list.map((item) => `- ${localize(item)}`);
      }

      return [];
    })
    .filter(Boolean)
    .join("\n\n");
}

function textFromFeatures(features: unknown): string {
  return recordsFrom(features)
    .map((feature) => {
      const name = localize(feature.name);
      const description = textFromDescription(feature.description);
      return [name, description].filter(Boolean).join(": ");
    })
    .filter(Boolean)
    .join("\n\n");
}

function baseEntry(record: JsonRecord, type: ContentEntry["type"], source: string): ContentEntry {
  return {
    id: String(record.id),
    name: localize(record.name),
    type,
    source,
    tags: [type],
    text: textFromDescription(record.description) || textFromFeatures(record.features),
    system: {},
  };
}

function normalizeDomainCard(record: JsonRecord, source: string): ContentEntry {
  const domain = normalizeEnum(record.domain);
  const cardType = normalizeEnum(record.type);
  const level = typeof record.level === "number" ? record.level : undefined;

  return {
    ...baseEntry(record, "domain-card", source),
    domain,
    level,
    tags: [domain, cardType, level !== undefined ? `level-${level}` : undefined].filter(Boolean) as string[],
    system: {
      cardType,
      recallCost: record.recallCost,
    },
  };
}

function normalizeClass(record: JsonRecord, source: string): ContentEntry[] {
  const classId = String(record.id);
  const classSlug = normalizeEnum(record.name);
  const domains = Array.isArray(record.domains) ? record.domains.map(normalizeEnum) : [];
  const classEntry: ContentEntry = {
    ...baseEntry(record, "class", source),
    tags: ["class", ...domains],
    domains,
    system: {
      domainIds: domains,
      startingEvasion: record.startingEvasion,
      startingHitPoints: record.startingHitPoints,
      classItems: Array.isArray(record.classItems) ? record.classItems.map(localize).filter(Boolean) : undefined,
    },
  };

  return [
    classEntry,
    ...featureAbilities({
      ownerId: classId,
      ownerKind: "class",
      ownerSlug: classSlug,
      source,
      features: recordsFrom(record.classFeatures),
      prefix: `${classId}:feature`,
      tags: ["class-feature", classSlug],
      systemKey: "classIds",
    }),
    ...featureAbilities({
      ownerId: classId,
      ownerKind: "class",
      ownerSlug: classSlug,
      source,
      features: record.hopeFeature && isRecord(record.hopeFeature) ? [record.hopeFeature] : [],
      prefix: `${classId}:hope`,
      tags: ["hope-feature", classSlug],
      systemKey: "classIds",
    }),
  ];
}

function normalizeSubclass(record: JsonRecord, source: string): ContentEntry[] {
  const subclassId = String(record.id);
  const classSlug = normalizeEnum(record.class);
  const domains = Array.isArray(record.domains) ? record.domains.map(normalizeEnum) : [];
  const subclassEntry: ContentEntry = {
    ...baseEntry(record, "subclass", source),
    tags: ["subclass", classSlug, ...domains].filter(Boolean),
    domains,
    system: {
      classIds: classSlug ? [`core_class_${classSlug}`] : [],
      domainIds: domains,
      spellcastTrait: normalizeEnum(record.spellcastTrait),
    },
  };

  const tiers = ["foundation", "specialization", "mastery"];
  const abilities = tiers.flatMap((tier) => {
    const tierRecord = record[tier];
    const features = isRecord(tierRecord) ? recordsFrom(tierRecord.features) : [];
    return featureAbilities({
      ownerId: subclassId,
      ownerKind: "subclass",
      ownerSlug: normalizeEnum(record.name),
      source,
      features,
      prefix: `${subclassId}:${tier}`,
      tags: ["subclass-feature", tier, classSlug].filter(Boolean),
      systemKey: "subclassIds",
      extraSystem: { classIds: classSlug ? [`core_class_${classSlug}`] : [] },
    });
  });

  return [subclassEntry, ...abilities];
}

function featureAbilities(input: {
  ownerId: string;
  ownerKind: "class" | "subclass";
  ownerSlug: string;
  source: string;
  features: JsonRecord[];
  prefix: string;
  tags: string[];
  systemKey: "classIds" | "subclassIds";
  extraSystem?: Record<string, unknown>;
}): ContentEntry[] {
  return input.features.flatMap((feature, index) => {
    const name = localize(feature.name) || `${toTitleCase(input.ownerSlug)} Feature ${index + 1}`;
    const text = textFromDescription(feature.description);
    const id = `${input.prefix}:${toSlug(name) || index + 1}`;

    return {
      id,
      name,
      type: "ability",
      source: input.source,
      tags: input.tags,
      text,
      system: {
        ownerKind: input.ownerKind,
        [input.systemKey]: [input.ownerId],
        ...input.extraSystem,
      },
    };
  });
}

function normalizeEquipment(record: JsonRecord, source: string, fileName: string): ContentEntry {
  const equipmentType = fileName.replace(".json", "").replace(/s$/, "");
  const subtype = normalizeEnum(record.type);
  const tier = typeof record.tier === "number" ? record.tier : undefined;

  return {
    ...baseEntry(record, "item", source),
    tags: [equipmentType, subtype || undefined, tier !== undefined ? `tier-${tier}` : undefined].filter(Boolean) as string[],
    system: {
      equipmentType,
      originalType: record.type,
      tier,
      trait: normalizeEnum(record.trait),
      range: normalizeEnum(record.range),
      burden: normalizeEnum(record.burden),
      damage: record.damage,
      baseMajorThreshold: record.baseMajorThreshold,
      baseSevereThreshold: record.baseSevereThreshold,
      baseScore: record.baseScore,
    },
  };
}

function normalizeGeneric(fileName: string, record: JsonRecord, source: string): ContentEntry[] {
  if (fileName === "domain-cards.json") {
    return [normalizeDomainCard(record, source)];
  }

  if (fileName === "classes.json") {
    return normalizeClass(record, source);
  }

  if (fileName === "subclasses.json") {
    return normalizeSubclass(record, source);
  }

  if (EQUIPMENT_FILES.has(fileName)) {
    return [normalizeEquipment(record, source, fileName)];
  }

  const type = FILE_TYPE_MAP[fileName];
  if (!type) {
    return [];
  }

  return [baseEntry(record, type, source)];
}

function collectDomains(entries: ContentEntry[], source: string): ContentEntry[] {
  const domains = new Set<string>();
  for (const entry of entries) {
    if (entry.domain) {
      domains.add(entry.domain);
    }
    for (const domain of entry.domains ?? []) {
      domains.add(domain);
    }
  }

  return [...domains].sort().map((domain) => ({
    id: `core_domain_${domain}`,
    name: toTitleCase(domain),
    type: "domain",
    source,
    tags: ["domain"],
    text: `${toTitleCase(domain)} domain reference generated from SRD class and domain card data.`,
    system: { generated: true },
  }));
}

export function normalizeDaggerheartRelease(input: DaggerheartReleaseInput): ContentEntry[] {
  const entries = Object.entries(input.files).flatMap(([fileName, fileContent]) =>
    recordsFrom(fileContent).flatMap((record) => normalizeGeneric(fileName, record, input.source)),
  );

  return [...collectDomains(entries, input.source), ...entries];
}
