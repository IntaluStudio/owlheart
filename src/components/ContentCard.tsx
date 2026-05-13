import { useMemo, useState } from "react";
import type { ContentEntry } from "../lib/types";

type ContentCardProps = {
  entry: ContentEntry;
  selected?: boolean;
  compact?: boolean;
  collapsible?: boolean;
  featureFirst?: boolean;
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

export function ContentCard({ entry, selected = false, compact = false, collapsible = false, featureFirst = false, onClick }: ContentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const detailBits = [
    entry.type,
    entry.domain ? `Domain: ${entry.domain}` : undefined,
    entry.level !== undefined ? `Level ${entry.level}` : undefined,
    entry.source,
  ].filter(Boolean);
  const text = entry.text || entry.description || "";
  const splitText = useMemo(() => splitFeatureText(text), [text]);
  const primaryText = featureFirst && splitText.features ? splitText.features : text;
  const secondaryText = featureFirst && splitText.features ? splitText.description : "";
  const visibleText = collapsible && !expanded ? primaryText : [primaryText, secondaryText].filter(Boolean).join("\n\n");

  return (
    <article className={`content-card ${selected ? "content-card--selected" : ""}`} onClick={onClick}>
      <div className="content-card__header">
        <div>
          <h3>{entry.name}</h3>
          <p>{detailBits.join(" • ")}</p>
        </div>
        {entry.system?.cardType ? <span className="badge">{String(entry.system.cardType)}</span> : null}
      </div>
      {!compact && visibleText ? <FormattedText text={visibleText} /> : null}
      {!compact && collapsible && secondaryText ? (
        <button type="button" className="text-button" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Hide description" : "Show description"}
        </button>
      ) : null}
      {entry.tags.length ? (
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
