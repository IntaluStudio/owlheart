import { useMemo, useState } from "react";
import { ContentCard } from "./ContentCard";
import { TrackerStrip } from "./TrackerStrip";
import {
  createExperienceRollTarget,
  createTraitRollTarget,
  splitCardVault,
  type RollTarget,
} from "../lib/quickReference";
import { TRAIT_KEYS, type CharacterBuild, type ContentEntry, type DaggerheartRollKind, type DaggerheartRollMode, type TraitKey } from "../lib/types";
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
  onStatusChange: (patch: Partial<CharacterBuild["status"]>) => void;
  onTokenChange: (tokens: CharacterFeatureToken[]) => void;
};

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

function modifierLabel(modifier: number) {
  return modifier >= 0 ? `+${modifier}` : String(modifier);
}

function EmptySlot({ label }: { label: string }) {
  return <div className="reference-slot reference-slot--empty">{label}</div>;
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
  onStatusChange,
  onTokenChange,
}: QuickReferenceBoardProps) {
  const [rollKind, setRollKind] = useState<DaggerheartRollKind>("action");
  const [rollMode, setRollMode] = useState<DaggerheartRollMode>("normal");
  const [rollDifficulty, setRollDifficulty] = useState("");
  const cardSplit = splitCardVault(domainCards);
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

      <TrackerStrip build={build} onStatusChange={onStatusChange} onTokenChange={onTokenChange} />

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
              onClick={() => onRoll(createTraitRollTarget(trait, build.traits[trait], rollOptions))}
            >
              <span>{TRAIT_LABELS[trait]}</span>
              <strong>{modifierLabel(build.traits[trait])}</strong>
              <small>{TRAIT_HELP[trait]}</small>
            </button>
          ))}
        </div>
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
                onClick={() => onRoll(createExperienceRollTarget(experience, rollOptions))}
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
    </section>
  );
}
