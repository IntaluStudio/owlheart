import { useEffect, useMemo, useState } from "react";
import { ContentCard } from "./ContentCard";
import { TrackerStrip } from "./TrackerStrip";
import {
  createExperienceRollTarget,
  createTraitRollTarget,
  splitCardVault,
  type RollTarget,
} from "../lib/quickReference";
import {
  TRAIT_KEYS,
  type CharacterAlternateTracker,
  type CharacterBuild,
  type ContentEntry,
  type DaggerheartRollResult,
  type DaggerheartRollKind,
  type DaggerheartRollMode,
  type TraitKey,
} from "../lib/types";
import type { CharacterFeatureToken } from "../lib/types";

type QuickReferenceBoardProps = {
  build: CharacterBuild;
  ancestry?: ContentEntry;
  community?: ContentEntry;
  classEntry?: ContentEntry;
  subclass?: ContentEntry;
  domainCards: ContentEntry[];
  abilities: ContentEntry[];
  equipment: ContentEntry[];
  entries?: ContentEntry[];
  onRoll: (target: RollTarget) => void;
  lastRoll?: { label: string; result: DaggerheartRollResult };
  onStatusChange: (patch: Partial<CharacterBuild["status"]>) => void;
  onTokenChange: (tokens: CharacterFeatureToken[]) => void;
  onLinkToken?: () => void;
  onAlternateTrackerChange?: (kind: "beastform" | "companion", tracker: CharacterAlternateTracker) => void;
};

type SheetKind = "character" | "beastform" | "companion";

const TRAIT_LABELS: Record<TraitKey, string> = {
  agility: "Agility",
  strength: "Strength",
  finesse: "Finesse",
  instinct: "Instinct",
  presence: "Presence",
  knowledge: "Knowledge",
};

const TRAIT_HELP: Record<TraitKey, string> = {
  agility: "Sprint, leap, maneuver",
  strength: "Lift, smash, grapple",
  finesse: "Control, hide, tinker",
  instinct: "Perceive, sense, navigate",
  presence: "Charm, perform, deceive",
  knowledge: "Recall, analyze, comprehend",
};

const emptyAlternateStatus: CharacterBuild["status"] = {
  maxHp: 0,
  markedHp: 0,
  maxStress: 6,
  markedStress: 0,
  evasion: 0,
  armorScore: 0,
  armorSlots: 0,
  markedArmor: 0,
  hope: 0,
  majorThreshold: 0,
  severeThreshold: 0,
};

const alternateStatusFields: Array<{
  key: keyof CharacterBuild["status"];
  label: string;
}> = [
  { key: "maxHp", label: "HP slots" },
  { key: "markedHp", label: "Current HP" },
  { key: "maxStress", label: "Stress slots" },
  { key: "markedStress", label: "Current Stress" },
  { key: "evasion", label: "Evasion" },
  { key: "armorScore", label: "Armor score" },
  { key: "armorSlots", label: "Armor slots" },
  { key: "markedArmor", label: "Current Armor" },
  { key: "majorThreshold", label: "Major threshold" },
  { key: "severeThreshold", label: "Severe threshold" },
];

function modifierLabel(modifier: number) {
  return modifier >= 0 ? `+${modifier}` : String(modifier);
}

function EmptySlot({ label }: { label: string }) {
  return <div className="reference-slot reference-slot--empty">{label}</div>;
}

function makeEmptyAlternateTracker(name: string): CharacterAlternateTracker {
  return {
    name,
    status: emptyAlternateStatus,
    attackDice: "",
  };
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function abilitySection(entry: ContentEntry) {
  return `${entry.name}: ${entry.text || entry.description || ""}`.trim();
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function isFeatureAvailableForLevel(entry: ContentEntry, level: number) {
  if (entry.tags.includes("mastery")) {
    return level >= 8;
  }

  if (entry.tags.includes("specialization")) {
    return level >= 5;
  }

  return true;
}

function uniqueById(entries: ContentEntry[]) {
  return [...new Map(entries.map((entry) => [entry.id, entry])).values()];
}

function enrichFeatureCard(entry: ContentEntry | undefined, linkedAbilities: ContentEntry[]) {
  if (!entry || linkedAbilities.length === 0) {
    return entry;
  }

  return {
    ...entry,
    text: [entry.text, ...linkedAbilities.map(abilitySection)].filter(Boolean).join("\n\n"),
  };
}

export function QuickReferenceBoard({
  build,
  ancestry,
  community,
  classEntry,
  subclass,
  domainCards,
  abilities,
  equipment,
  entries = [],
  onRoll,
  lastRoll,
  onStatusChange,
  onTokenChange,
  onLinkToken,
  onAlternateTrackerChange,
}: QuickReferenceBoardProps) {
  const [rollKind, setRollKind] = useState<DaggerheartRollKind>("action");
  const [rollMode, setRollMode] = useState<DaggerheartRollMode>("normal");
  const [rollDifficulty, setRollDifficulty] = useState("");
  const [activeSheet, setActiveSheet] = useState<SheetKind>("character");
  const cardSplit = splitCardVault(domainCards);
  const hasDruidBeastform =
    build.classId === "core_class_druid" ||
    classEntry?.id === "core_class_druid" ||
    abilities.some((entry) => entry.id === "core_class_druid:feature:beastform");
  const hasBeastboundCompanion =
    build.subclassId === "core_subclass_beastbound" ||
    subclass?.id === "core_subclass_beastbound" ||
    abilities.some((entry) => entry.id === "core_subclass_beastbound:foundation:companion");
  const showBeastform = Boolean(build.beastform || hasDruidBeastform);
  const showCompanion = Boolean(build.companion || hasBeastboundCompanion);
  const beastformTracker = build.beastform ?? makeEmptyAlternateTracker("Beastform");
  const companionTracker = build.companion ?? makeEmptyAlternateTracker("Companion");
  const classSlug = classEntry ? slug(classEntry.name) : "";
  const classAbilities = abilities.filter(
    (entry) =>
      classSlug &&
      entry.tags.includes(classSlug) &&
      (entry.tags.includes("class-feature") || entry.tags.includes("hope-feature")),
  );
  const subclassAbilities = abilities.filter(
    (entry) => classSlug && entry.tags.includes(classSlug) && entry.tags.includes("subclass-feature"),
  );
  const subclassLinkedAbilities = subclass
    ? entries.filter(
        (entry) =>
          entry.type === "ability" &&
          entry.tags.includes("subclass-feature") &&
          stringArray(entry.system?.subclassIds).includes(subclass.id) &&
          isFeatureAvailableForLevel(entry, build.level),
      )
    : [];
  const enrichedSubclassAbilities = uniqueById([...subclassAbilities, ...subclassLinkedAbilities]);
  const linkedAbilityIds = new Set([...classAbilities, ...subclassAbilities].map((entry) => entry.id));
  const looseAbilities = abilities.filter((entry) => !linkedAbilityIds.has(entry.id));
  const featureCards = [
    ancestry,
    community,
    enrichFeatureCard(classEntry, classAbilities),
    enrichFeatureCard(subclass, enrichedSubclassAbilities),
  ].filter(Boolean) as ContentEntry[];
  const primaryEquipment = equipment.slice(0, 4);
  const extraEquipment = equipment.slice(4);
  const rollOptions = useMemo(
    () => ({
      kind: rollKind,
      mode: rollMode,
      difficulty: rollDifficulty ? Number(rollDifficulty) : undefined,
    }),
    [rollDifficulty, rollKind, rollMode],
  );
  const rollTrait = (trait: TraitKey) => onRoll(createTraitRollTarget(trait, build.traits[trait], rollOptions));
  const rollExperience = (experience: CharacterBuild["experiences"][number]) =>
    onRoll(createExperienceRollTarget(experience, rollOptions));
  const sheetTabs = [
    { kind: "character" as const, label: "Character", detail: build.name, attackDice: undefined },
    ...(showBeastform
      ? [
          {
            kind: "beastform" as const,
            label: "Beastform",
            detail: beastformTracker.name || "Manual tracker",
            attackDice: beastformTracker.attackDice,
          },
        ]
      : []),
    ...(showCompanion
      ? [
          {
            kind: "companion" as const,
            label: "Companion",
            detail: companionTracker.name || "Manual tracker",
            attackDice: companionTracker.attackDice,
          },
        ]
      : []),
  ];
  const activeAlternateKind = activeSheet === "beastform" || activeSheet === "companion" ? activeSheet : undefined;
  const activeAlternateTracker =
    activeAlternateKind === "beastform"
      ? beastformTracker
      : activeAlternateKind === "companion"
        ? companionTracker
        : undefined;

  useEffect(() => {
    if ((activeSheet === "beastform" && !showBeastform) || (activeSheet === "companion" && !showCompanion)) {
      setActiveSheet("character");
    }
  }, [activeSheet, showBeastform, showCompanion]);

  const updateAlternateTracker = (kind: "beastform" | "companion", patch: Partial<CharacterAlternateTracker>) => {
    const tracker = kind === "beastform" ? beastformTracker : companionTracker;
    onAlternateTrackerChange?.(kind, { ...tracker, ...patch });
  };

  const updateAlternateStatus = (
    kind: "beastform" | "companion",
    patch: Partial<CharacterAlternateTracker["status"]>,
  ) => {
    const tracker = kind === "beastform" ? beastformTracker : companionTracker;
    onAlternateTrackerChange?.(kind, {
      ...tracker,
      status: {
        ...tracker.status,
        ...patch,
      },
    });
  };

  const sheetSwitcher =
    sheetTabs.length > 1 ? (
      <div className="sheet-tabs" role="tablist" aria-label="Character reference slides">
        {sheetTabs.map((tab) => (
          <button
            key={tab.kind}
            type="button"
            role="tab"
            aria-selected={activeSheet === tab.kind}
            className={activeSheet === tab.kind ? "sheet-tab sheet-tab--active" : "sheet-tab"}
            onClick={() => setActiveSheet(tab.kind)}
          >
            <span>{tab.label}</span>
            <strong>{tab.detail}</strong>
            {tab.attackDice ? <small>{tab.attackDice}</small> : null}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <section className="quick-board" aria-label={`${build.name} quick reference board`}>
      <header className="quick-board__header">
        <div>
          <span>Character</span>
          <h2>{build.name}</h2>
        </div>
        <div className="quick-board__identity">
          <span>{classEntry?.name ?? "No class"}</span>
          <span>{subclass?.name ?? "No subclass"}</span>
          <strong>Level {build.level}</strong>
        </div>
      </header>

      {sheetSwitcher}

      {activeAlternateKind && activeAlternateTracker ? (
        <section className="quick-board__zone alternate-tracker-panel">
          <div className="selection-section__header">
            <h3>{activeAlternateKind === "beastform" ? "Beastform Tracker" : "Companion Tracker"}</h3>
            <span>Manual independent tracker</span>
          </div>
          <div className="form-grid">
            <label>
              <span>Name</span>
              <input
                value={activeAlternateTracker.name}
                disabled={!onAlternateTrackerChange}
                onChange={(event) => updateAlternateTracker(activeAlternateKind, { name: event.currentTarget.value })}
              />
            </label>
            <label>
              <span>Attack dice</span>
              <input
                value={activeAlternateTracker.attackDice ?? ""}
                disabled={!onAlternateTrackerChange}
                onChange={(event) =>
                  updateAlternateTracker(activeAlternateKind, {
                    attackDice: event.currentTarget.value || undefined,
                  })
                }
                placeholder="Optional"
              />
            </label>
          </div>
          <div className="alternate-status-grid">
            {alternateStatusFields.map((field) => (
              <label key={field.key}>
                <span>{field.label}</span>
                <input
                  type="number"
                  min={0}
                  value={activeAlternateTracker.status[field.key]}
                  disabled={!onAlternateTrackerChange}
                  onChange={(event) => updateAlternateStatus(activeAlternateKind, { [field.key]: Number(event.currentTarget.value) })}
                />
              </label>
            ))}
          </div>
        </section>
      ) : (
        <>

      <TrackerStrip build={build} onStatusChange={onStatusChange} onTokenChange={onTokenChange} onLinkToken={onLinkToken} />

      <section className="quick-board__zone">
        <h3>Traits</h3>
        <div className="roll-toolbar" aria-label="Direct roll controls">
          <div>
            <span>Roll kind</span>
            <div className="segmented-tabs segmented-tabs--compact">
              {(["action", "reaction"] satisfies DaggerheartRollKind[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={rollKind === option ? "segmented-tab segmented-tab--active" : "segmented-tab"}
                  onClick={() => setRollKind(option)}
                >
                  {option === "action" ? "Action" : "Reaction"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span>Roll mode</span>
            <div className="segmented-tabs segmented-tabs--compact">
              {(["normal", "advantage", "disadvantage"] satisfies DaggerheartRollMode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={rollMode === option ? "segmented-tab segmented-tab--active" : "segmented-tab"}
                  onClick={() => setRollMode(option)}
                >
                  {option === "normal" ? "Normal" : option === "advantage" ? "Advantage" : "Disadvantage"}
                </button>
              ))}
            </div>
          </div>
          <label>
            <span>Difficulty</span>
            <input
              type="number"
              min={0}
              value={rollDifficulty}
              onChange={(event) => setRollDifficulty(event.target.value)}
              placeholder="Optional"
            />
          </label>
        </div>
        <div className="trait-grid">
          {TRAIT_KEYS.map((trait) => (
            <button
              key={trait}
              type="button"
              className="trait-button"
              onPointerUp={() => rollTrait(trait)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  rollTrait(trait);
                }
              }}
            >
              <span>{TRAIT_LABELS[trait]}</span>
              <strong>{modifierLabel(build.traits[trait])}</strong>
              <small>{TRAIT_HELP[trait]}</small>
            </button>
          ))}
        </div>
        {lastRoll ? (
          <div className={`inline-roll-result roll-result roll-result--${lastRoll.result.outcome.toLowerCase().replace(/\s+/g, "-")}`}>
            <span>Last roll - {lastRoll.label}</span>
            <strong>{lastRoll.result.total}</strong>
            <em>
              {lastRoll.result.success === undefined ? "" : lastRoll.result.success ? "Success " : "Failure "}
              {lastRoll.result.outcome}
            </em>
            <code>
              Hope {lastRoll.result.hopeDie} + Fear {lastRoll.result.fearDie}{" "}
              {lastRoll.result.modifier + lastRoll.result.adjustment >= 0 ? "+" : "-"}{" "}
              {Math.abs(lastRoll.result.modifier + lastRoll.result.adjustment)}
            </code>
          </div>
        ) : null}
      </section>

      <section className="quick-board__zone">
        <h3>Manual Reference</h3>
        <div className="status-reference-grid">
          <div>
            <span>HP</span>
            <strong>{build.status.markedHp}/{build.status.maxHp}</strong>
          </div>
          <div>
            <span>Stress</span>
            <strong>{build.status.markedStress}/{build.status.maxStress}</strong>
          </div>
          <div>
            <span>Evasion</span>
            <strong>{build.status.evasion}</strong>
          </div>
          <div>
            <span>Armor</span>
            <strong>{build.status.markedArmor}/{build.status.armorSlots}</strong>
            <small>Score {build.status.armorScore}</small>
          </div>
          <div>
            <span>Thresholds</span>
            <strong>{build.status.majorThreshold}/{build.status.severeThreshold}</strong>
            <small>Major / Severe</small>
          </div>
        </div>
      </section>

      <section className="quick-board__zone">
        <h3>Experiences</h3>
        {build.experiences.length ? (
          <div className="experience-grid">
            {build.experiences.map((experience) => (
            <button
              key={experience.id}
              type="button"
              className="experience-button"
              onPointerUp={() => rollExperience(experience)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  rollExperience(experience);
                }
              }}
            >
                <span>{experience.name}</span>
                <strong>{modifierLabel(experience.modifier)}</strong>
              </button>
            ))}
          </div>
        ) : (
          <p className="empty-state">No experiences added.</p>
        )}
      </section>

      <div className="quick-board__columns">
        <section className="quick-board__zone">
          <h3>Features</h3>
          <div className="reference-grid reference-grid--board">
            {featureCards.map((entry) => (
              <ContentCard
                key={entry.id}
                entry={entry}
                collapsible
                dense
                featureFirst={entry.type === "ancestry" || entry.type === "community" || entry.type === "class" || entry.type === "subclass"}
                hideTags={entry.type === "class" || entry.type === "subclass"}
              />
            ))}
          </div>
          {looseAbilities.length ? (
            <div className="feature-ability-grid">
              {looseAbilities.map((entry) => (
                <ContentCard key={entry.id} entry={entry} dense />
              ))}
            </div>
          ) : null}
        </section>

        <section className="quick-board__zone">
          <h3>Domain Cards</h3>
          <div className="card-slot-grid">
            {cardSplit.visible.map((entry) => (
              <div key={entry.id} className="reference-slot">
                <ContentCard entry={entry} dense />
              </div>
            ))}
            {Array.from({ length: Math.max(0, 5 - cardSplit.visible.length) }, (_, index) => (
              <EmptySlot key={index} label="Open card slot" />
            ))}
          </div>
          {cardSplit.vault.length ? (
            <div className="vault-strip">
              <h4>Vault</h4>
              <div>
                {cardSplit.vault.map((entry) => (
                  <span key={entry.id}>{entry.name}</span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <section className="quick-board__zone">
        <h3>Equipment</h3>
        <div className="equipment-slot-row">
          {primaryEquipment.map((entry) => (
            <div key={entry.id} className="reference-slot reference-slot--equipment">
              <ContentCard entry={entry} dense />
            </div>
          ))}
          {primaryEquipment.length === 0 ? <EmptySlot label="No equipment selected" /> : null}
        </div>
        {extraEquipment.length ? (
          <p className="status-line">Additional equipment: {extraEquipment.map((entry) => entry.name).join(", ")}</p>
        ) : null}
      </section>

      {build.notes ? (
        <section className="quick-board__zone">
          <h3>Notes</h3>
          <p className="quick-board__notes">{build.notes}</p>
        </section>
      ) : null}
        </>
      )}
    </section>
  );
}
