import { useMemo, useState } from "react";
import type { ContentEntry } from "../lib/types";

type ContentCardProps = {
  entry: ContentEntry;
  selected?: boolean;
  compact?: boolean;
  collapsible?: boolean;
  dense?: boolean;
  featureFirst?: boolean;
  hideTags?: boolean;
  onClick?: () => void;
};

function splitFeatureText(text: string) {
  const sections = text.split(/\n{2,}/).filter(Boolean);
  const firstFeatureIndex = sections.findIndex((section) => /^[A-Z][^:\n]{1,80}:/.test(section));

  if (firstFeatureIndex === -1) {
    return { description: text, features: "" };
  }

  return {
    description: sections.slice(0, firstFeatureIndex).join("\n\n"),
    features: sections.slice(firstFeatureIndex).join("\n\n"),
  };
}

function FormattedText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).filter(Boolean).map((section) => {
        const match = section.match(/^([^:\n]{1,80}):\s*(.*)$/s);
        if (match) {
          return (
            <p key={section} className="content-card__text">
              <strong>{match[1]}:</strong> {match[2]}
            </p>
          );
        }

        return (
          <p key={section} className="content-card__text">
            {section}
          </p>
        );
      })}
    </>
  );
}

function formatSystemValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && "dice" in value) {
    const damage = value as { dice?: unknown; modifier?: unknown; type?: unknown };
    const dice = typeof damage.dice === "string" ? damage.dice : "";
    const modifier = typeof damage.modifier === "number" ? `+${damage.modifier}` : "";
    const type = typeof damage.type === "string" ? damage.type.toLowerCase() : "";
    return [dice, modifier, type].filter(Boolean).join(" ");
  }

  return "";
}

function equipmentText(entry: ContentEntry): string {
  if (entry.type !== "item") {
    return "";
  }

  const fields = [
    ["Trait", entry.system?.trait],
    ["Range", entry.system?.range],
    ["Burden", entry.system?.burden],
    ["Damage", entry.system?.damage],
    ["Armor", entry.system?.baseScore],
    ["Threshold", entry.system?.threshold],
  ]
    .map(([label, value]) => {
      const formatted = formatSystemValue(value);
      return formatted ? `${label}: ${formatted}` : "";
    })
    .filter(Boolean);

  return fields.join("\n\n");
}

function metadataRows(entry: ContentEntry) {
  const cardType = typeof entry.system?.cardType === "string" ? entry.system.cardType : undefined;
  const recallCost =
    typeof entry.system?.recallCost === "string" || typeof entry.system?.recallCost === "number"
      ? String(entry.system.recallCost)
      : undefined;
  const equipmentType = typeof entry.system?.equipmentType === "string" ? entry.system.equipmentType : undefined;
  const trait = typeof entry.system?.trait === "string" ? entry.system.trait : undefined;
  const tier =
    typeof entry.system?.tier === "string" || typeof entry.system?.tier === "number" ? String(entry.system.tier) : undefined;

  return [
    { label: cardType ? "Type" : "Kind", value: cardType ?? equipmentType ?? entry.type },
    entry.domain ? { label: "Domain", value: entry.domain } : undefined,
    entry.level !== undefined ? { label: "Level", value: String(entry.level) } : undefined,
    recallCost ? { label: "Cost", value: recallCost } : undefined,
    trait ? { label: "Trait", value: trait } : undefined,
    tier ? { label: "Tier", value: tier } : undefined,
    { label: "Source", value: entry.source },
  ].filter((row): row is { label: string; value: string } => Boolean(row));
}

export function ContentCard({
  entry,
  selected = false,
  compact = false,
  collapsible = false,
  dense = false,
  featureFirst = false,
  hideTags = false,
  onClick,
}: ContentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const summaryBits = [entry.type, entry.source].filter(Boolean);
  const rows = metadataRows(entry);
  const text = entry.text || entry.description || equipmentText(entry);
  const splitText = useMemo(() => splitFeatureText(text), [text]);
  const primaryText = featureFirst ? splitText.features : text;
  const secondaryText = featureFirst ? splitText.description : "";
  const visibleText = collapsible && !expanded ? primaryText : [primaryText || text, secondaryText].filter(Boolean).join("\n\n");
  const canToggle = collapsible && Boolean(secondaryText || (featureFirst && text && !primaryText));
  const className = [
    "content-card",
    selected ? "content-card--selected" : "",
    dense ? "content-card--dense" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={className} onClick={onClick}>
      <div className="content-card__header">
        <div>
          <h3>{entry.name}</h3>
          <p>{summaryBits.join(" - ")}</p>
        </div>
        {entry.system?.cardType ? <span className="badge">{String(entry.system.cardType)}</span> : null}
      </div>
      {!compact && rows.length ? (
        <dl className="content-card__metadata" aria-label={`${entry.name} metadata`}>
          {rows.map((row) => (
            <div key={`${row.label}:${row.value}`}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {!compact && visibleText ? <FormattedText text={visibleText} /> : null}
      {!compact && canToggle ? (
        <button type="button" className="text-button" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Hide description" : "Show description"}
        </button>
      ) : null}
      {!hideTags && entry.tags.length ? (
        <div className="tag-row" aria-label={`${entry.name} tags`}>
          {entry.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
