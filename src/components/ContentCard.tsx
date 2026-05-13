import type { ContentEntry } from "../lib/types";

type ContentCardProps = {
  entry: ContentEntry;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
};

export function ContentCard({ entry, selected = false, compact = false, onClick }: ContentCardProps) {
  const detailBits = [
    entry.type,
    entry.domain ? `Domain: ${entry.domain}` : undefined,
    entry.level !== undefined ? `Level ${entry.level}` : undefined,
    entry.source,
  ].filter(Boolean);

  return (
    <article className={`content-card ${selected ? "content-card--selected" : ""}`} onClick={onClick}>
      <div className="content-card__header">
        <div>
          <h3>{entry.name}</h3>
          <p>{detailBits.join(" • ")}</p>
        </div>
        {entry.system?.cardType ? <span className="badge">{String(entry.system.cardType)}</span> : null}
      </div>
      {!compact ? <p className="content-card__text">{entry.text || entry.description}</p> : null}
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
