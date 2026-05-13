import { BookOpen, Search } from "lucide-react";
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

const SRD_PAGE_SIZE = 25;

const CATEGORY_LABELS: Record<ContentType, string> = {
  domain: "Domains",
  "domain-card": "Cards",
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

export function SrdBrowser({ entries }: SrdBrowserProps) {
  const [filters, setFilters] = useState<ContentFilters>(defaultFilters);
  const [selectedId, setSelectedId] = useState(entries[0]?.id);
  const [page, setPage] = useState(1);

  const options = useMemo(() => getFilterOptions(entries), [entries]);
  const results = useMemo(() => filterContent(entries, filters), [entries, filters]);
  const pageCount = Math.max(1, Math.ceil(results.length / SRD_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleResults = results.slice((currentPage - 1) * SRD_PAGE_SIZE, currentPage * SRD_PAGE_SIZE);
  const selected = results.find((entry) => entry.id === selectedId) ?? results[0];

  const updateFilters = (patch: Partial<ContentFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
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

      <div className="segmented-tabs" aria-label="SRD categories">
        <button
          type="button"
          className={filters.categories.length === 0 ? "segmented-tab segmented-tab--active" : "segmented-tab"}
          onClick={() => updateFilters({ categories: [] })}
        >
          All
        </button>
        {CONTENT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={filters.categories[0] === type ? "segmented-tab segmented-tab--active" : "segmented-tab"}
            onClick={() => updateFilters({ categories: [type] })}
          >
            {CATEGORY_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="filter-grid" aria-label="SRD filters">
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
            {results.length} entries • page {currentPage} of {pageCount}
          </div>
          {visibleResults.map((entry) => (
            <ContentCard key={entry.id} entry={entry} compact selected={entry.id === selected?.id} onClick={() => setSelectedId(entry.id)} />
          ))}
          <div className="pager" aria-label="SRD result pagination">
            <button type="button" className="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage <= 1}>
              Previous
            </button>
            <button type="button" className="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage >= pageCount}>
              Next
            </button>
          </div>
        </div>
        <div className="detail-pane" aria-live="polite">
          {selected ? <ContentCard entry={selected} /> : <p className="empty-state">No matching entries.</p>}
        </div>
      </div>
    </section>
  );
}
