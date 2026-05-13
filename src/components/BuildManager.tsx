import { Download, Plus, Save, Upload } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { ContentCard } from "./ContentCard";
import { createLocalId, downloadJson, readJsonFile } from "../lib/importExport";
import { getAvailableAbilitiesForBuild, getAvailableDomainCardsForBuild, getSelectedReferences } from "../lib/buildFiltering";
import { characterBuildSchema } from "../lib/schema";
import { getContentByType } from "../lib/contentIndex";
import type { CharacterBuild, ContentEntry } from "../lib/types";

type BuildManagerProps = {
  builds: CharacterBuild[];
  entries: ContentEntry[];
  onChange: (builds: CharacterBuild[]) => void;
};

function getStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function createBlankBuild(entries: ContentEntry[]): CharacterBuild {
  const firstClass = getContentByType(entries, "class")[0];
  const selectedDomains = getStringArray(firstClass?.system?.domainIds ?? firstClass?.domains).slice(0, 2);

  return {
    id: createLocalId("character", "new-build"),
    name: "New Build",
    ancestryId: getContentByType(entries, "ancestry")[0]?.id,
    communityId: getContentByType(entries, "community")[0]?.id,
    classId: firstClass?.id,
    subclassId: getContentByType(entries, "subclass").find((entry) => getStringArray(entry.system?.classIds).includes(firstClass?.id ?? ""))?.id,
    level: 1,
    selectedDomains,
    selectedDomainCards: [],
    selectedAbilities: [],
    selectedEquipment: [],
    notes: "",
    manualOverrides: {},
  };
}

function toggleId(list: string[], id: string) {
  return list.includes(id) ? list.filter((value) => value !== id) : [...list, id];
}

export function BuildManager({ builds, entries, onChange }: BuildManagerProps) {
  const [selectedBuildId, setSelectedBuildId] = useState(builds[0]?.id);
  const [quickReference, setQuickReference] = useState(false);
  const [importError, setImportError] = useState("");

  const selectedBuild = builds.find((build) => build.id === selectedBuildId) ?? builds[0];
  const selectedReferences = useMemo(
    () => (selectedBuild ? getSelectedReferences(entries, selectedBuild) : undefined),
    [entries, selectedBuild],
  );
  const availableCards = useMemo(
    () => (selectedBuild ? getAvailableDomainCardsForBuild(entries, selectedBuild) : []),
    [entries, selectedBuild],
  );
  const availableAbilities = useMemo(
    () => (selectedBuild ? getAvailableAbilitiesForBuild(entries, selectedBuild) : []),
    [entries, selectedBuild],
  );

  const updateBuild = (patch: Partial<CharacterBuild>) => {
    if (!selectedBuild) {
      return;
    }

    const next = { ...selectedBuild, ...patch };
    onChange(builds.map((build) => (build.id === selectedBuild.id ? next : build)));
  };

  const addBuild = () => {
    const build = createBlankBuild(entries);
    onChange([build, ...builds]);
    setSelectedBuildId(build.id);
  };

  const importBuild = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    try {
      const imported = await readJsonFile(file);
      const parsed = characterBuildSchema.parse(imported);
      onChange([parsed, ...builds.filter((build) => build.id !== parsed.id)]);
      setSelectedBuildId(parsed.id);
      setImportError("");
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Invalid character JSON");
    }
  };

  const classes = getContentByType(entries, "class");
  const subclasses = getContentByType(entries, "subclass").filter((entry) =>
    selectedBuild?.classId ? getStringArray(entry.system?.classIds).includes(selectedBuild.classId) : true,
  );

  if (!selectedBuild) {
    return (
      <section className="view-grid">
        <button type="button" className="button button--primary" onClick={addBuild}>
          <Plus size={16} aria-hidden="true" />
          Create build
        </button>
      </section>
    );
  }

  return (
    <section className="build-layout">
      <aside className="build-list">
        <div className="toolbar toolbar--wrap">
          <button type="button" className="button button--primary" onClick={addBuild}>
            <Plus size={16} aria-hidden="true" />
            New
          </button>
          <label className="button">
            <Upload size={16} aria-hidden="true" />
            Import
            <input className="visually-hidden" type="file" accept="application/json,.json" onChange={importBuild} />
          </label>
        </div>
        {importError ? <p className="field-error">{importError}</p> : null}
        {builds.map((build) => (
          <button
            key={build.id}
            type="button"
            className={`build-list__item ${build.id === selectedBuild.id ? "build-list__item--selected" : ""}`}
            onClick={() => setSelectedBuildId(build.id)}
          >
            <strong>{build.name}</strong>
            <span>Level {build.level}</span>
          </button>
        ))}
      </aside>

      <div className="build-editor">
        <div className="toolbar toolbar--wrap">
          <button type="button" className="button" onClick={() => setQuickReference((value) => !value)}>
            <Save size={16} aria-hidden="true" />
            {quickReference ? "Edit build" : "Quick reference"}
          </button>
          <button type="button" className="button" onClick={() => downloadJson(`${selectedBuild.id.replace(/[:/]/g, "-")}.json`, selectedBuild)}>
            <Download size={16} aria-hidden="true" />
            Export
          </button>
        </div>

        {quickReference && selectedReferences ? (
          <div className="reference-grid">
            {[selectedReferences.ancestry, selectedReferences.community, selectedReferences.class, selectedReferences.subclass]
              .filter(Boolean)
              .map((entry) => (
                <ContentCard key={entry!.id} entry={entry!} />
              ))}
            {selectedReferences.domainCards.map((entry) => (
              <ContentCard key={entry.id} entry={entry} />
            ))}
            {selectedReferences.abilities.map((entry) => (
              <ContentCard key={entry.id} entry={entry} />
            ))}
            {selectedReferences.equipment.map((entry) => (
              <ContentCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <>
            <div className="form-grid">
              <label>
                <span>Name</span>
                <input value={selectedBuild.name} onChange={(event) => updateBuild({ name: event.target.value })} />
              </label>
              <label>
                <span>Level</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={selectedBuild.level}
                  onChange={(event) => updateBuild({ level: Number(event.target.value) })}
                />
              </label>
              <label>
                <span>Ancestry</span>
                <select value={selectedBuild.ancestryId ?? ""} onChange={(event) => updateBuild({ ancestryId: event.target.value })}>
                  <option value="">None</option>
                  {getContentByType(entries, "ancestry").map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Community</span>
                <select value={selectedBuild.communityId ?? ""} onChange={(event) => updateBuild({ communityId: event.target.value })}>
                  <option value="">None</option>
                  {getContentByType(entries, "community").map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Class</span>
                <select
                  value={selectedBuild.classId ?? ""}
                  onChange={(event) => {
                    const selectedClass = classes.find((entry) => entry.id === event.target.value);
                    updateBuild({
                      classId: event.target.value,
                      selectedDomains: getStringArray(selectedClass?.system?.domainIds ?? selectedClass?.domains),
                    });
                  }}
                >
                  <option value="">None</option>
                  {classes.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Subclass</span>
                <select value={selectedBuild.subclassId ?? ""} onChange={(event) => updateBuild({ subclassId: event.target.value })}>
                  <option value="">None</option>
                  {subclasses.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-grid__wide">
                <span>Selected domains</span>
                <input
                  value={selectedBuild.selectedDomains.join(", ")}
                  onChange={(event) =>
                    updateBuild({
                      selectedDomains: event.target.value
                        .split(",")
                        .map((domain) => domain.trim().toLowerCase())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <label className="form-grid__wide">
                <span>Notes</span>
                <textarea value={selectedBuild.notes} onChange={(event) => updateBuild({ notes: event.target.value })} rows={3} />
              </label>
            </div>

            <div className="toggle-grid">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(selectedBuild.manualOverrides.ignoreDomainRequirements)}
                  onChange={(event) =>
                    updateBuild({
                      manualOverrides: {
                        ...selectedBuild.manualOverrides,
                        ignoreDomainRequirements: event.target.checked,
                      },
                    })
                  }
                />
                <span>Ignore domain requirements</span>
              </label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(selectedBuild.manualOverrides.ignoreLevelRequirements)}
                  onChange={(event) =>
                    updateBuild({
                      manualOverrides: {
                        ...selectedBuild.manualOverrides,
                        ignoreLevelRequirements: event.target.checked,
                      },
                    })
                  }
                />
                <span>Ignore level requirements</span>
              </label>
            </div>

            <div className="selection-section">
              <h3>Available cards</h3>
              <div className="checkbox-list">
                {availableCards.map((card) => (
                  <label key={card.id}>
                    <input
                      type="checkbox"
                      checked={selectedBuild.selectedDomainCards.includes(card.id)}
                      onChange={() => updateBuild({ selectedDomainCards: toggleId(selectedBuild.selectedDomainCards, card.id) })}
                    />
                    <span>
                      {card.name} <small>{card.domain} {card.level !== undefined ? `L${card.level}` : ""}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="selection-section">
              <h3>Available abilities</h3>
              <div className="checkbox-list">
                {availableAbilities.map((ability) => (
                  <label key={ability.id}>
                    <input
                      type="checkbox"
                      checked={selectedBuild.selectedAbilities.includes(ability.id)}
                      onChange={() => updateBuild({ selectedAbilities: toggleId(selectedBuild.selectedAbilities, ability.id) })}
                    />
                    <span>{ability.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="selection-section">
              <h3>Equipment</h3>
              <div className="checkbox-list">
                {getContentByType(entries, "item").map((item) => (
                  <label key={item.id}>
                    <input
                      type="checkbox"
                      checked={selectedBuild.selectedEquipment.includes(item.id)}
                      onChange={() => updateBuild({ selectedEquipment: toggleId(selectedBuild.selectedEquipment, item.id) })}
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
