import { BookOpen, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ContentCard } from "./ContentCard";
import { CONTENT_TYPES, type ContentEntry, type ContentFilters, type ContentType } from "../lib/types";
import { filterContent, getFilterOptions } from "../lib/contentIndex";

type SrdBrowserProps = {
  entries: ContentEntry[];
};

const defaultFilters: ContentFilters = {
  query: "",
  categories: [],
  domains: [],
  tags: [],
  sources: [],
};

export function SrdBrowser({ entries }: SrdBrowserProps) {
  const [filters, setFilters] = useState<ContentFilters>(defaultFilters);
  const [selectedId, setSelectedId] = useState(entries[0]?.id);

  const options = useMemo(() => getFilterOptions(entries), [entries]);
  const results = useMemo(() => filterContent(entries, filters), [entries, filters]);
  const selected = results.find((entry) => entry.id === selectedId) ?? results[0];

  const updateFilters = (patch: Partial<ContentFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  };

  return (
    <section className="view-grid">
      <div className="toolbar">
        <label className="search-box">
          <Search size={16} aria-hidden="true" />
          <input
            value={filters.query}
            onChange={(event) => updateFilters({ query: event.target.value })}
            placeholder="Search names, rules, tags"
          />
        </label>
      </div>

      <div className="filter-grid" aria-label="SRD filters">
        <label>
          <span>
            <Filter size={14} aria-hidden="true" /> Category
          </span>
          <select
            value={filters.categories[0] ?? ""}
            onChange={(event) =>
              updateFilters({ categories: event.target.value ? [event.target.value as ContentType] : [] })
            }
          >
            <option value="">All</option>
            {CONTENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Level</span>
          <select
            value={filters.level ?? ""}
            onChange={(event) => updateFilters({ level: event.target.value ? Number(event.target.value) : undefined })}
          >
            <option value="">Any</option>
            {Array.from({ length: 11 }, (_, level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Domain</span>
          <select
            value={filters.domains[0] ?? ""}
            onChange={(event) => updateFilters({ domains: event.target.value ? [event.target.value] : [] })}
          >
            <option value="">Any</option>
            {options.domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Tag</span>
          <select value={filters.tags[0] ?? ""} onChange={(event) => updateFilters({ tags: event.target.value ? [event.target.value] : [] })}>
            <option value="">Any</option>
            {options.tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Source</span>
          <select
            value={filters.sources[0] ?? ""}
            onChange={(event) => updateFilters({ sources: event.target.value ? [event.target.value] : [] })}
          >
            <option value="">Any</option>
            {options.sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="split-pane">
        <div className="list-pane" aria-label="SRD search results">
          <div className="list-count">
            <BookOpen size={16} aria-hidden="true" />
            {results.length} entries
          </div>
          {results.map((entry) => (
            <ContentCard key={entry.id} entry={entry} compact selected={entry.id === selected?.id} onClick={() => setSelectedId(entry.id)} />
          ))}
        </div>
        <div className="detail-pane" aria-live="polite">
          {selected ? <ContentCard entry={selected} /> : <p className="empty-state">No matching entries.</p>}
        </div>
      </div>
    </section>
  );
}
