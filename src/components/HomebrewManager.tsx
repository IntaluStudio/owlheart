import { Download, PackagePlus, Trash2, Upload } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { sampleHomebrewPack } from "../data/sampleHomebrew";
import { downloadJson, readJsonFile } from "../lib/importExport";
import { formatZodIssues, validateHomebrewPack } from "../lib/schema";
import type { HomebrewPack } from "../lib/types";

type HomebrewManagerProps = {
  packs: HomebrewPack[];
  onChange: (packs: HomebrewPack[]) => void;
};

export function HomebrewManager({ packs, onChange }: HomebrewManagerProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const activeCount = useMemo(() => packs.filter((pack) => pack.enabled !== false).length, [packs]);

  const upsertPack = (pack: HomebrewPack) => {
    onChange([pack, ...packs.filter((existing) => existing.id !== pack.id)]);
    setErrors([]);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    try {
      const imported = await readJsonFile(file);
      const parsed = validateHomebrewPack.safeParse(imported);
      if (!parsed.success) {
        setErrors(formatZodIssues(parsed.error));
        return;
      }
      upsertPack(parsed.data);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Unable to import JSON"]);
    }
  };

  const togglePack = (id: string) => {
    onChange(packs.map((pack) => (pack.id === id ? { ...pack, enabled: pack.enabled === false } : pack)));
  };

  const removePack = (id: string) => {
    onChange(packs.filter((pack) => pack.id !== id));
  };

  return (
    <section className="view-grid">
      <div className="toolbar toolbar--wrap">
        <label className="button button--primary">
          <Upload size={16} aria-hidden="true" />
          Import pack
          <input className="visually-hidden" type="file" accept="application/json,.json" onChange={handleImport} />
        </label>
        <button type="button" className="button" onClick={() => upsertPack(sampleHomebrewPack)}>
          <PackagePlus size={16} aria-hidden="true" />
          Load sample
        </button>
        <button type="button" className="button" onClick={() => downloadJson("daggerheart-homebrew-packs.json", packs)}>
          <Download size={16} aria-hidden="true" />
          Export all
        </button>
      </div>

      <div className="stat-strip">
        <span>{packs.length} packs imported</span>
        <span>{activeCount} active</span>
        <span>{packs.reduce((total, pack) => total + pack.entries.length, 0)} entries</span>
      </div>

      {errors.length ? (
        <div className="error-box" role="alert">
          <strong>Validation errors</strong>
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}

      <div className="list-pane list-pane--full">
        {packs.length === 0 ? <p className="empty-state">No homebrew packs imported.</p> : null}
        {packs.map((pack) => (
          <article key={pack.id} className="content-card">
            <div className="content-card__header">
              <div>
                <h3>{pack.name}</h3>
                <p>
                  {pack.source} • {pack.entries.length} entries
                </p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={pack.enabled !== false} onChange={() => togglePack(pack.id)} />
                <span>Active</span>
              </label>
            </div>
            {pack.description ? <p className="content-card__text">{pack.description}</p> : null}
            <div className="button-row">
              <button type="button" className="icon-button" title={`Export ${pack.name}`} onClick={() => downloadJson(`${pack.id.replace(/[:/]/g, "-")}.json`, pack)}>
                <Download size={16} aria-hidden="true" />
              </button>
              <button type="button" className="icon-button icon-button--danger" title={`Remove ${pack.name}`} onClick={() => removePack(pack.id)}>
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
