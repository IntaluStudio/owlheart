import { Download, Plus, Save, Sparkles, Trash2, Upload } from "lucide-react";
import { ChangeEvent, lazy, Suspense, useMemo, useState } from "react";
import { CharacterWizard } from "./CharacterWizard";
import { ContentCard } from "./ContentCard";
import { QuickReferenceBoard } from "./QuickReferenceBoard";
import { createLocalId, downloadJson, readJsonFile } from "../lib/importExport";
import { getAvailableAbilitiesForBuild, getAvailableDomainCardsForBuild, getSelectedReferences } from "../lib/buildFiltering";
import { characterBuildSchema, DEFAULT_MAX_STRESS } from "../lib/schema";
import { getContentByType } from "../lib/contentIndex";
import { TRAIT_KEYS, type CharacterBuild, type CharacterExperience, type CharacterFeatureToken, type ContentEntry, type TraitKey } from "../lib/types";
import { filterContentChoices, type RollTarget } from "../lib/quickReference";
import { applySuggestedClassReference, findSuggestedClassReference } from "../lib/suggestedBuilds";
import { getAutoSelectedAbilityIds, resetBuildForClassChange, resetBuildForSubclassChange } from "../lib/classChange";
import { applyDerivedStatus, buildDerivations } from "../lib/buildDerivations";
import { applySuggestedFeatureTokens, getCalculationHintsForBuild, getSuggestedFeatureTokens } from "../lib/calculationHints";

const EQUIPMENT_PAGE_SIZE = 10;
const CARD_PAGE_SIZE = 8;
const ABILITY_PAGE_SIZE = 8;
const CLASS_CHANGE_WARNING =
  "Changing class will clear selected subclass, domain cards, and class or subclass feature picks. You will need to repick subclass features and domain cards. Continue?";
const SUBCLASS_CHANGE_WARNING =
  "Changing subclass will replace selected subclass feature picks. Your class features will stay selected. Continue?";
const PLAYTEST_CLASS_WARNING = "This class is from playtest material and may change. Continue?";

const DualityDiceRoller = lazy(() => import("./DualityDiceRoller").then((module) => ({ default: module.DualityDiceRoller })));

const TRAIT_LABELS: Record<TraitKey, string> = {
  agility: "Agility",
  strength: "Strength",
  finesse: "Finesse",
  instinct: "Instinct",
  presence: "Presence",
  knowledge: "Knowledge",
};

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
  const firstSubclass = getContentByType(entries, "subclass").find((entry) =>
    getStringArray(entry.system?.classIds).includes(firstClass?.id ?? ""),
  );

  return {
    id: createLocalId("character", "new-build"),
    name: "New Build",
    ancestryId: getContentByType(entries, "ancestry")[0]?.id,
    communityId: getContentByType(entries, "community")[0]?.id,
    classId: firstClass?.id,
    subclassId: firstSubclass?.id,
    level: 1,
    selectedDomains,
    selectedDomainCards: [],
    selectedAbilities: getAutoSelectedAbilityIds(entries, firstClass?.id, firstSubclass?.id),
    selectedEquipment: [],
    traits: {
      agility: 0,
      strength: 0,
      finesse: 0,
      instinct: 0,
      presence: 0,
      knowledge: 0,
    },
    experiences: [],
    featureTokens: [],
    status: {
      maxHp: 0,
      markedHp: 0,
      // Per Daggerheart SRD p.5: every PC starts with 6 Stress slots, universal constant.
      maxStress: DEFAULT_MAX_STRESS,
      markedStress: 0,
      evasion: 0,
      armorScore: 0,
      armorSlots: 0,
      markedArmor: 0,
      hope: 0,
      majorThreshold: 0,
      severeThreshold: 0,
    },
    notes: "",
    manualOverrides: {},
  };
}

function toggleId(list: string[], id: string) {
  return list.includes(id) ? list.filter((value) => value !== id) : [...list, id];
}

export function BuildManager({ builds, entries, onChange }: BuildManagerProps) {
  const [selectedBuildId, setSelectedBuildId] = useState(builds[0]?.id);
  const [builderMode, setBuilderMode] = useState<"quick" | "wizard">("quick");
  const [quickReference, setQuickReference] = useState(false);
  const [importError, setImportError] = useState("");
  const [equipmentQuery, setEquipmentQuery] = useState("");
  const [equipmentPage, setEquipmentPage] = useState(1);
  const [cardDomainFilter, setCardDomainFilter] = useState("");
  const [cardLevelFilter, setCardLevelFilter] = useState("");
  const [cardPage, setCardPage] = useState(1);
  const [abilityQuery, setAbilityQuery] = useState("");
  const [abilityPage, setAbilityPage] = useState(1);
  const [activeRollTarget, setActiveRollTarget] = useState<RollTarget | null>(null);

  const selectedBuild = builds.find((build) => build.id === selectedBuildId) ?? builds[0];
  const selectedSuggestion = findSuggestedClassReference(selectedBuild?.classId);
  const selectedReferences = useMemo(
    () => (selectedBuild ? getSelectedReferences(entries, selectedBuild) : undefined),
    [entries, selectedBuild],
  );
  const derivationPreview = useMemo(
    () => (selectedBuild ? buildDerivations(selectedBuild, entries) : undefined),
    [entries, selectedBuild],
  );
  const calculationHints = useMemo(
    () => (selectedBuild ? getCalculationHintsForBuild(selectedBuild, entries) : []),
    [entries, selectedBuild],
  );
  const suggestedFeatureTokens = useMemo(
    () => (selectedBuild ? getSuggestedFeatureTokens(selectedBuild, entries) : []),
    [entries, selectedBuild],
  );
  const availableCards = useMemo(
    () => (selectedBuild ? getAvailableDomainCardsForBuild(entries, selectedBuild) : []),
    [entries, selectedBuild],
  );
  const cardDomains = useMemo(() => [...new Set(availableCards.flatMap((card) => card.domain ?? []))].sort(), [availableCards]);
  const cardLevels = useMemo(
    () => [...new Set(availableCards.flatMap((card) => (card.level !== undefined ? [card.level] : [])))].sort((a, b) => a - b),
    [availableCards],
  );
  const filteredCards = useMemo(() => {
    return availableCards
      .filter((card) => !cardDomainFilter || card.domain === cardDomainFilter)
      .filter((card) => !cardLevelFilter || card.level === Number(cardLevelFilter))
      .sort((a, b) => (a.level ?? 0) - (b.level ?? 0) || (a.domain ?? "").localeCompare(b.domain ?? "") || a.name.localeCompare(b.name));
  }, [availableCards, cardDomainFilter, cardLevelFilter]);
  const cardPageCount = Math.max(1, Math.ceil(filteredCards.length / CARD_PAGE_SIZE));
  const currentCardPage = Math.min(cardPage, cardPageCount);
  const visibleCards = filteredCards.slice((currentCardPage - 1) * CARD_PAGE_SIZE, currentCardPage * CARD_PAGE_SIZE);
  const availableAbilities = useMemo(
    () => (selectedBuild ? getAvailableAbilitiesForBuild(entries, selectedBuild) : []),
    [entries, selectedBuild],
  );
  const filteredAbilities = useMemo(
    () => filterContentChoices(availableAbilities, abilityQuery).sort((a, b) => a.name.localeCompare(b.name)),
    [abilityQuery, availableAbilities],
  );
  const abilityPageCount = Math.max(1, Math.ceil(filteredAbilities.length / ABILITY_PAGE_SIZE));
  const currentAbilityPage = Math.min(abilityPage, abilityPageCount);
  const visibleAbilities = filteredAbilities.slice(
    (currentAbilityPage - 1) * ABILITY_PAGE_SIZE,
    currentAbilityPage * ABILITY_PAGE_SIZE,
  );
  const filteredEquipment = useMemo(() => {
    return filterContentChoices(getContentByType(entries, "item"), equipmentQuery);
  }, [entries, equipmentQuery]);
  const equipmentPageCount = Math.max(1, Math.ceil(filteredEquipment.length / EQUIPMENT_PAGE_SIZE));
  const currentEquipmentPage = Math.min(equipmentPage, equipmentPageCount);
  const visibleEquipment = filteredEquipment.slice(
    (currentEquipmentPage - 1) * EQUIPMENT_PAGE_SIZE,
    currentEquipmentPage * EQUIPMENT_PAGE_SIZE,
  );

  const updateBuild = (patch: Partial<CharacterBuild>) => {
    if (!selectedBuild) {
      return;
    }

    const next = { ...selectedBuild, ...patch };
    onChange(builds.map((build) => (build.id === selectedBuild.id ? next : build)));
  };

  const updateTrait = (trait: TraitKey, value: number) => {
    if (!selectedBuild) {
      return;
    }

    updateBuild({
      traits: {
        ...selectedBuild.traits,
        [trait]: value,
      },
    });
  };

  const updateExperience = (experienceId: string, patch: Partial<CharacterExperience>) => {
    if (!selectedBuild) {
      return;
    }

    updateBuild({
      experiences: selectedBuild.experiences.map((experience) =>
        experience.id === experienceId ? { ...experience, ...patch } : experience,
      ),
    });
  };

  const addExperience = () => {
    if (!selectedBuild) {
      return;
    }

    updateBuild({
      experiences: [
        ...selectedBuild.experiences,
        {
          id: createLocalId("experience", `${selectedBuild.name}-experience`),
          name: "New Experience",
          modifier: 2,
        },
      ],
    });
  };

  const removeExperience = (experienceId: string) => {
    if (!selectedBuild) {
      return;
    }

    updateBuild({
      experiences: selectedBuild.experiences.filter((experience) => experience.id !== experienceId),
    });
  };

  const addFeatureToken = () => {
    if (!selectedBuild) {
      return;
    }

    updateBuild({
      featureTokens: [
        ...selectedBuild.featureTokens,
        {
          id: createLocalId("token", `${selectedBuild.name}-token`),
          label: "New Token",
          current: 0,
        },
      ],
    });
  };

  const updateFeatureToken = (tokenId: string, patch: Partial<CharacterFeatureToken>) => {
    if (!selectedBuild) {
      return;
    }

    updateBuild({
      featureTokens: selectedBuild.featureTokens.map((token) =>
        token.id === tokenId ? { ...token, ...patch } : token,
      ),
    });
  };

  const removeFeatureToken = (tokenId: string) => {
    if (!selectedBuild) {
      return;
    }

    updateBuild({
      featureTokens: selectedBuild.featureTokens.filter((token) => token.id !== tokenId),
    });
  };

  const updateStatus = (patch: Partial<CharacterBuild["status"]>) => {
    if (!selectedBuild) {
      return;
    }

    updateBuild({
      status: {
        ...selectedBuild.status,
        ...patch,
      },
    });
  };

  const applyClassSuggestions = () => {
    if (!selectedBuild || !selectedSuggestion) {
      return;
    }

    const next = applySuggestedClassReference(selectedBuild, entries);
    onChange(builds.map((build) => (build.id === selectedBuild.id ? next : build)));
  };

  const applyDerivedStats = () => {
    if (!selectedBuild || !derivationPreview) {
      return;
    }

    const next = applyDerivedStatus(selectedBuild, derivationPreview);
    onChange(builds.map((build) => (build.id === selectedBuild.id ? next : build)));
  };

  const applySuggestedTokens = () => {
    if (!selectedBuild) {
      return;
    }

    const next = applySuggestedFeatureTokens(selectedBuild, entries);
    onChange(builds.map((build) => (build.id === selectedBuild.id ? next : build)));
  };

  const handleClassChange = (classId: string) => {
    if (!selectedBuild || (selectedBuild.classId ?? "") === classId) {
      return;
    }

    const selectedClass = classes.find((entry) => entry.id === classId);
    const warning = [
      selectedBuild.classId ? CLASS_CHANGE_WARNING : undefined,
      selectedClass?.system?.playtest ? PLAYTEST_CLASS_WARNING : undefined,
    ]
      .filter(Boolean)
      .join("\n\n");

    if (warning && !window.confirm(warning)) {
      return;
    }

    const next = resetBuildForClassChange(selectedBuild, entries, classId);
    onChange(builds.map((build) => (build.id === selectedBuild.id ? next : build)));
    setCardDomainFilter("");
    setCardLevelFilter("");
    setCardPage(1);
    setAbilityQuery("");
    setAbilityPage(1);
  };

  const handleSubclassChange = (subclassId: string) => {
    if (!selectedBuild || (selectedBuild.subclassId ?? "") === subclassId) {
      return;
    }

    if (selectedBuild.subclassId && !window.confirm(SUBCLASS_CHANGE_WARNING)) {
      return;
    }

    const next = resetBuildForSubclassChange(selectedBuild, entries, subclassId);
    onChange(builds.map((build) => (build.id === selectedBuild.id ? next : build)));
    setAbilityQuery("");
    setAbilityPage(1);
  };

  const addBuild = () => {
    const build = createBlankBuild(entries);
    onChange([build, ...builds]);
    setSelectedBuildId(build.id);
    setBuilderMode("quick");
    setQuickReference(false);
  };

  const finishWizardBuild = (build: CharacterBuild) => {
    onChange([build, ...builds.filter((existing) => existing.id !== build.id)]);
    setSelectedBuildId(build.id);
    setBuilderMode("quick");
    setQuickReference(true);
  };

  const deleteSelectedBuild = () => {
    if (!selectedBuild) {
      return;
    }

    if (!window.confirm(`Delete ${selectedBuild.name}? This cannot be undone.`)) {
      return;
    }

    const remaining = builds.filter((build) => build.id !== selectedBuild.id);
    onChange(remaining);
    setSelectedBuildId(remaining[0]?.id);
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
        <div className="builder-mode-toggle" role="group" aria-label="Build creation mode">
          <button
            type="button"
            className={builderMode === "quick" ? "segmented-tab segmented-tab--active" : "segmented-tab"}
            onClick={() => setBuilderMode("quick")}
          >
            Quick Build
          </button>
          <button
            type="button"
            className={builderMode === "wizard" ? "segmented-tab segmented-tab--active" : "segmented-tab"}
            onClick={() => setBuilderMode("wizard")}
          >
            Wizard Builder
          </button>
        </div>
        {builderMode === "wizard" ? <CharacterWizard entries={entries} onFinish={finishWizardBuild} /> : null}
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
        <div className="builder-mode-toggle" role="group" aria-label="Build creation mode">
          <button
            type="button"
            className={builderMode === "quick" ? "segmented-tab segmented-tab--active" : "segmented-tab"}
            onClick={() => setBuilderMode("quick")}
          >
            Quick Build
          </button>
          <button
            type="button"
            className={builderMode === "wizard" ? "segmented-tab segmented-tab--active" : "segmented-tab"}
            onClick={() => setBuilderMode("wizard")}
          >
            Wizard Builder
          </button>
        </div>
        {builderMode === "wizard" ? (
          <CharacterWizard entries={entries} onFinish={finishWizardBuild} onCancel={() => setBuilderMode("quick")} />
        ) : (
          <>
        <div className="toolbar toolbar--wrap">
          <button type="button" className="button" onClick={() => setQuickReference((value) => !value)}>
            <Save size={16} aria-hidden="true" />
            {quickReference ? "Edit build" : "Quick reference"}
          </button>
          <button type="button" className="button" onClick={() => downloadJson(`${selectedBuild.id.replace(/[:/]/g, "-")}.json`, selectedBuild)}>
            <Download size={16} aria-hidden="true" />
            Export
          </button>
          {!quickReference ? (
            <button type="button" className="button" disabled={!selectedSuggestion} onClick={applyClassSuggestions}>
              <Sparkles size={16} aria-hidden="true" />
              Apply class suggestions
            </button>
          ) : null}
          <button type="button" className="button button--danger" onClick={deleteSelectedBuild}>
            <Trash2 size={16} aria-hidden="true" />
            Delete character
          </button>
        </div>

        {quickReference && selectedReferences ? (
          <QuickReferenceBoard
            build={selectedBuild}
            ancestry={selectedReferences.ancestry}
            community={selectedReferences.community}
            classEntry={selectedReferences.class}
            subclass={selectedReferences.subclass}
            domainCards={selectedReferences.domainCards}
            abilities={selectedReferences.abilities}
            equipment={selectedReferences.equipment}
            entries={entries}
            onRoll={setActiveRollTarget}
            onStatusChange={updateStatus}
            onTokenChange={(featureTokens) => updateBuild({ featureTokens })}
          />
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
                  onChange={(event) => handleClassChange(event.target.value)}
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
                <select value={selectedBuild.subclassId ?? ""} onChange={(event) => handleSubclassChange(event.target.value)}>
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

            <div className="selection-section">
              <h3>Traits</h3>
              <div className="form-grid">
                {TRAIT_KEYS.map((trait) => (
                  <label key={trait}>
                    <span>{TRAIT_LABELS[trait]}</span>
                    <input
                      type="number"
                      value={selectedBuild.traits[trait]}
                      onChange={(event) => updateTrait(trait, Number(event.target.value))}
                    />
                  </label>
                ))}
              </div>
            </div>

            {derivationPreview ? (
              <div className="selection-section">
                <div className="selection-section__header">
                  <h3>Derived stats</h3>
                  <button type="button" className="button" onClick={applyDerivedStats}>
                    <Sparkles size={16} aria-hidden="true" />
                    Apply derived stats
                  </button>
                </div>
                <div className="derived-grid">
                  {derivationPreview.status.map((preview) => (
                    <div key={preview.field} className="derived-card">
                      <span>{preview.label}</span>
                      <strong>
                        {preview.current} {preview.derived !== undefined ? `-> ${preview.derived}` : "-> no source"}
                      </strong>
                      <small>{preview.sourceName ?? "No structured source selected"}</small>
                    </div>
                  ))}
                </div>
                <div className="selected-summary-grid">
                  <div>
                    <span>Armor reference</span>
                    <strong>{derivationPreview.armor?.name ?? "None"}</strong>
                    <small>Armor score and thresholds use selected armor only.</small>
                  </div>
                  <div>
                    <span>Primary weapon</span>
                    <strong>{derivationPreview.primaryWeapons.map((entry) => entry.name).join(", ") || "None"}</strong>
                    <small>Selected equipment tagged as primary weapon.</small>
                  </div>
                  <div>
                    <span>Secondary weapon</span>
                    <strong>{derivationPreview.secondaryWeapons.map((entry) => entry.name).join(", ") || "None"}</strong>
                    <small>Selected equipment tagged as secondary weapon.</small>
                  </div>
                  <div>
                    <span>Spellcast trait</span>
                    <strong>{derivationPreview.spellcastTrait ?? "None"}</strong>
                    <small>From selected subclass structured data.</small>
                  </div>
                </div>
                <div className="derived-suggestions">
                  <div className="selection-section__header">
                    <h4>Feature suggestions</h4>
                    <button type="button" className="button" onClick={applySuggestedTokens} disabled={suggestedFeatureTokens.length === 0}>
                      <Sparkles size={16} aria-hidden="true" />
                      Apply suggested tokens
                    </button>
                  </div>
                  {calculationHints.length ? (
                    <div className="checkbox-list checkbox-list--compact">
                      {calculationHints.map((hint) => (
                        <div key={`${hint.sourceContentId}:${hint.type}:${hint.label}`} className="hint-row">
                          <strong>{hint.label}</strong>
                          <span>{hint.type === "featureToken" ? "Feature token" : hint.type === "statusBonus" ? "Status reminder" : "Roll reminder"}</span>
                          <small>{hint.note}</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No curated feature suggestions for the current selections.</p>
                  )}
                </div>
              </div>
            ) : null}

            <div className="selection-section">
              <h3>Manual reference</h3>
              <div className="manual-reference-grid">
                <div className="manual-reference-group">
                  <h4>Health</h4>
                  <div className="manual-reference-subgrid manual-reference-subgrid--pair">
                    <label>
                      <span>HP slots</span>
                      <input type="number" min={0} value={selectedBuild.status.maxHp} onChange={(event) => updateStatus({ maxHp: Number(event.target.value) })} />
                    </label>
                    <label>
                      <span>Current HP</span>
                      <input type="number" min={0} value={selectedBuild.status.markedHp} onChange={(event) => updateStatus({ markedHp: Number(event.target.value) })} />
                    </label>
                  </div>
                </div>
                <div className="manual-reference-group">
                  <h4>Stress</h4>
                  <div className="manual-reference-subgrid manual-reference-subgrid--pair">
                    <label>
                      <span>Stress slots</span>
                      <input type="number" min={0} value={selectedBuild.status.maxStress} onChange={(event) => updateStatus({ maxStress: Number(event.target.value) })} />
                    </label>
                    <label>
                      <span>Current Stress</span>
                      <input type="number" min={0} value={selectedBuild.status.markedStress} onChange={(event) => updateStatus({ markedStress: Number(event.target.value) })} />
                    </label>
                  </div>
                </div>
                <div className="manual-reference-group">
                  <h4>Defense</h4>
                  <div className="manual-reference-subgrid">
                    <label>
                      <span>Evasion</span>
                      <input type="number" min={0} value={selectedBuild.status.evasion} onChange={(event) => updateStatus({ evasion: Number(event.target.value) })} />
                    </label>
                    <label>
                      <span>Major threshold</span>
                      <input type="number" min={0} value={selectedBuild.status.majorThreshold} onChange={(event) => updateStatus({ majorThreshold: Number(event.target.value) })} />
                    </label>
                    <label>
                      <span>Severe threshold</span>
                      <input type="number" min={0} value={selectedBuild.status.severeThreshold} onChange={(event) => updateStatus({ severeThreshold: Number(event.target.value) })} />
                    </label>
                  </div>
                </div>
                <div className="manual-reference-group">
                  <h4>Armor</h4>
                  <div className="manual-reference-subgrid manual-reference-subgrid--pair">
                    <label>
                      <span>Armor score / slots</span>
                      <input
                        type="number"
                        min={0}
                        value={selectedBuild.status.armorScore}
                        onChange={(event) => {
                          const armorScore = Number(event.target.value);
                          updateStatus({ armorScore, armorSlots: armorScore });
                        }}
                      />
                    </label>
                    <label>
                      <span>Marked armor</span>
                      <input type="number" min={0} value={selectedBuild.status.markedArmor} onChange={(event) => updateStatus({ markedArmor: Number(event.target.value) })} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="selection-section">
              <div className="selection-section__header">
                <h3>Experiences</h3>
                <button type="button" className="button" onClick={addExperience}>
                  <Plus size={16} aria-hidden="true" />
                  Add
                </button>
              </div>
              {selectedBuild.experiences.length ? (
                <div className="experience-editor">
                  {selectedBuild.experiences.map((experience) => (
                    <div key={experience.id} className="experience-editor__row">
                      <label>
                        <span>Name</span>
                        <input value={experience.name} onChange={(event) => updateExperience(experience.id, { name: event.target.value })} />
                      </label>
                      <label>
                        <span>Modifier</span>
                        <input
                          type="number"
                          value={experience.modifier}
                          onChange={(event) => updateExperience(experience.id, { modifier: Number(event.target.value) })}
                        />
                      </label>
                      <button type="button" className="icon-button icon-button--danger" onClick={() => removeExperience(experience.id)} aria-label={`Remove ${experience.name}`}>
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No experiences added.</p>
              )}
            </div>

            <div className="selection-section">
              <div className="selection-section__header">
                <h3>Feature tokens</h3>
                <button type="button" className="button" onClick={addFeatureToken}>
                  <Plus size={16} aria-hidden="true" />
                  Add token
                </button>
              </div>
              {selectedBuild.featureTokens.length ? (
                <div className="experience-editor">
                  {selectedBuild.featureTokens.map((token) => (
                    <div key={token.id} className="experience-editor__row">
                      <label>
                        <span>Label</span>
                        <input value={token.label} onChange={(event) => updateFeatureToken(token.id, { label: event.target.value })} />
                      </label>
                      <label>
                        <span>Current</span>
                        <input
                          type="number"
                          min={0}
                          value={token.current}
                          onChange={(event) => updateFeatureToken(token.id, { current: Number(event.target.value) })}
                        />
                      </label>
                      <label>
                        <span>Max</span>
                        <input
                          type="number"
                          min={0}
                          value={token.max ?? ""}
                          onChange={(event) =>
                            updateFeatureToken(token.id, {
                              max: event.target.value ? Number(event.target.value) : undefined,
                            })
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className="icon-button icon-button--danger"
                        onClick={() => removeFeatureToken(token.id)}
                        aria-label={`Remove ${token.label}`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No feature tokens added.</p>
              )}
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

            {selectedReferences ? (
              <div className="selection-section">
                <h3>Selected references</h3>
                <div className="selected-summary-grid">
                  <div>
                    <span>Cards</span>
                    <strong>{selectedReferences.domainCards.length}</strong>
                    <small>{selectedReferences.domainCards.map((entry) => entry.name).join(", ") || "None selected"}</small>
                  </div>
                  <div>
                    <span>Abilities</span>
                    <strong>{selectedReferences.abilities.length}</strong>
                    <small>{selectedReferences.abilities.map((entry) => entry.name).join(", ") || "None selected"}</small>
                  </div>
                  <div>
                    <span>Equipment</span>
                    <strong>{selectedReferences.equipment.length}</strong>
                    <small>{selectedReferences.equipment.map((entry) => entry.name).join(", ") || "None selected"}</small>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="selection-section">
              <div className="selection-section__header">
                <h3>Available cards</h3>
                <span>
                  {filteredCards.length} matches • page {currentCardPage} of {cardPageCount}
                </span>
              </div>
              <div className="segmented-tabs segmented-tabs--compact" aria-label="Card domain filters">
                <button
                  type="button"
                  className={!cardDomainFilter ? "segmented-tab segmented-tab--active" : "segmented-tab"}
                  onClick={() => {
                    setCardDomainFilter("");
                    setCardPage(1);
                  }}
                >
                  All domains
                </button>
                {cardDomains.map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    className={cardDomainFilter === domain ? "segmented-tab segmented-tab--active" : "segmented-tab"}
                    onClick={() => {
                      setCardDomainFilter(domain);
                      setCardPage(1);
                    }}
                  >
                    {domain}
                  </button>
                ))}
              </div>
              <div className="segmented-tabs segmented-tabs--compact" aria-label="Card level filters">
                <button
                  type="button"
                  className={!cardLevelFilter ? "segmented-tab segmented-tab--active" : "segmented-tab"}
                  onClick={() => {
                    setCardLevelFilter("");
                    setCardPage(1);
                  }}
                >
                  All levels
                </button>
                {cardLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={cardLevelFilter === String(level) ? "segmented-tab segmented-tab--active" : "segmented-tab"}
                    onClick={() => {
                      setCardLevelFilter(String(level));
                      setCardPage(1);
                    }}
                  >
                    L{level}
                  </button>
                ))}
              </div>
              <div className="checkbox-list">
                {visibleCards.map((card, index) => (
                  <div key={card.id} className="checkbox-list__group">
                    {index === 0 || card.level !== visibleCards[index - 1]?.level ? <h4>Level {card.level ?? "Any"}</h4> : null}
                    <label key={card.id} className="domain-card-choice">
                    <input
                      type="checkbox"
                      checked={selectedBuild.selectedDomainCards.includes(card.id)}
                      onChange={() => updateBuild({ selectedDomainCards: toggleId(selectedBuild.selectedDomainCards, card.id) })}
                    />
                      <strong>{card.name}</strong>
                      <small className="domain-card-choice__meta">
                        {card.domain} {card.level !== undefined ? `L${card.level}` : ""} • {card.source}
                      </small>
                      <small className="choice-description">{card.text}</small>
                    </label>
                  </div>
                ))}
              </div>
              <div className="pager" aria-label="Card pagination">
                <button type="button" className="button" onClick={() => setCardPage((page) => Math.max(1, page - 1))} disabled={currentCardPage <= 1}>
                  Previous
                </button>
                <button type="button" className="button" onClick={() => setCardPage((page) => Math.min(cardPageCount, page + 1))} disabled={currentCardPage >= cardPageCount}>
                  Next
                </button>
              </div>
            </div>

            <details className="selection-section advanced-section">
              <summary>
                <span>Advanced ability overrides</span>
                <small>{selectedBuild.selectedAbilities.length} selected • auto-picked from class and subclass</small>
              </summary>
              <div className="selection-section__header">
                <h3>Available abilities</h3>
                <span>
                  {filteredAbilities.length} matches • page {currentAbilityPage} of {abilityPageCount}
                </span>
              </div>
              <label className="search-box search-box--compact">
                <span className="visually-hidden">Search abilities</span>
                <input
                  value={abilityQuery}
                  onChange={(event) => {
                    setAbilityQuery(event.target.value);
                    setAbilityPage(1);
                  }}
                  placeholder="Search abilities"
                />
              </label>
              <div className="checkbox-list">
                {visibleAbilities.map((ability) => (
                  <label key={ability.id}>
                    <input
                      type="checkbox"
                      checked={selectedBuild.selectedAbilities.includes(ability.id)}
                      onChange={() => updateBuild({ selectedAbilities: toggleId(selectedBuild.selectedAbilities, ability.id) })}
                    />
                    <span>
                      {ability.name}
                      <small>{ability.source} • {ability.tags.join(", ")}</small>
                    </span>
                  </label>
                ))}
              </div>
              <div className="pager" aria-label="Ability pagination">
                <button type="button" className="button" onClick={() => setAbilityPage((page) => Math.max(1, page - 1))} disabled={currentAbilityPage <= 1}>
                  Previous
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => setAbilityPage((page) => Math.min(abilityPageCount, page + 1))}
                  disabled={currentAbilityPage >= abilityPageCount}
                >
                  Next
                </button>
              </div>
            </details>

            <details className="selection-section advanced-section">
              <summary>
                <span>Advanced equipment overrides</span>
                <small>{selectedBuild.selectedEquipment.length} selected - suggested by class defaults or chosen manually</small>
              </summary>
              <div className="selection-section__header">
                <h3>Equipment</h3>
                <span>
                  {filteredEquipment.length} matches • page {currentEquipmentPage} of {equipmentPageCount}
                </span>
              </div>
              <label className="search-box search-box--compact">
                <span className="visually-hidden">Search equipment</span>
                <input
                  value={equipmentQuery}
                  onChange={(event) => {
                    setEquipmentQuery(event.target.value);
                    setEquipmentPage(1);
                  }}
                  placeholder="Search equipment"
                />
              </label>
              <div className="checkbox-list">
                {visibleEquipment.map((item) => (
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
              <div className="pager" aria-label="Equipment pagination">
                <button type="button" className="button" onClick={() => setEquipmentPage((page) => Math.max(1, page - 1))} disabled={currentEquipmentPage <= 1}>
                  Previous
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => setEquipmentPage((page) => Math.min(equipmentPageCount, page + 1))}
                  disabled={currentEquipmentPage >= equipmentPageCount}
                >
                  Next
                </button>
              </div>
            </details>
          </>
        )}
          </>
        )}
      </div>

      {activeRollTarget ? (
        <Suspense fallback={<div className="roller-backdrop"><div className="roller-panel"><p className="status-line">Loading dice roller...</p></div></div>}>
          <DualityDiceRoller
            label={activeRollTarget.label}
            modifier={activeRollTarget.modifier}
            kind={activeRollTarget.kind}
            initialMode={activeRollTarget.mode}
            initialDifficulty={activeRollTarget.difficulty}
            onClose={() => setActiveRollTarget(null)}
          />
        </Suspense>
      ) : null}
    </section>
  );
}
