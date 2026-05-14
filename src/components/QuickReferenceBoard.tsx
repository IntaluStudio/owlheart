import { ContentCard } from "./ContentCard";
import {
  createExperienceRollTarget,
  createTraitRollTarget,
  splitCardVault,
  type RollTarget,
} from "../lib/quickReference";
import { TRAIT_KEYS, type CharacterBuild, type ContentEntry, type TraitKey } from "../lib/types";

type QuickReferenceBoardProps = {
  build: CharacterBuild;
  ancestry?: ContentEntry;
  community?: ContentEntry;
  classEntry?: ContentEntry;
  subclass?: ContentEntry;
  domainCards: ContentEntry[];
  abilities: ContentEntry[];
  equipment: ContentEntry[];
  onRoll: (target: RollTarget) => void;
};

const TRAIT_LABELS: Record<TraitKey, string> = {
  agility: "Agility",
  strength: "Strength",
  finesse: "Finesse",
  instinct: "Instinct",
  presence: "Presence",
  knowledge: "Knowledge",
};

function modifierLabel(modifier: number) {
  return modifier >= 0 ? `+${modifier}` : String(modifier);
}

function EmptySlot({ label }: { label: string }) {
  return <div className="reference-slot reference-slot--empty">{label}</div>;
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
  onRoll,
}: QuickReferenceBoardProps) {
  const cardSplit = splitCardVault(domainCards);
  const featureCards = [ancestry, community, classEntry, subclass].filter(Boolean) as ContentEntry[];
  const primaryEquipment = equipment.slice(0, 4);
  const extraEquipment = equipment.slice(4);

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

      <section className="quick-board__zone">
        <h3>Traits</h3>
        <div className="trait-grid">
          {TRAIT_KEYS.map((trait) => (
            <button
              key={trait}
              type="button"
              className="trait-button"
              onClick={() => onRoll(createTraitRollTarget(trait, build.traits[trait]))}
            >
              <span>{TRAIT_LABELS[trait]}</span>
              <strong>{modifierLabel(build.traits[trait])}</strong>
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
                onClick={() => onRoll(createExperienceRollTarget(experience))}
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
                featureFirst={entry.type === "ancestry" || entry.type === "community" || entry.type === "class" || entry.type === "subclass"}
              />
            ))}
          </div>
        </section>

        <section className="quick-board__zone">
          <h3>Domain Cards</h3>
          <div className="card-slot-grid">
            {cardSplit.visible.map((entry) => (
              <div key={entry.id} className="reference-slot">
                <ContentCard entry={entry} />
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
              <ContentCard entry={entry} compact />
            </div>
          ))}
          {primaryEquipment.length === 0 ? <EmptySlot label="No equipment selected" /> : null}
        </div>
        {extraEquipment.length ? (
          <p className="status-line">Additional equipment: {extraEquipment.map((entry) => entry.name).join(", ")}</p>
        ) : null}
      </section>

      {abilities.length ? (
        <section className="quick-board__zone">
          <h3>Selected Abilities</h3>
          <div className="reference-grid reference-grid--board">
            {abilities.map((entry) => (
              <ContentCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}

      {build.notes ? (
        <section className="quick-board__zone">
          <h3>Notes</h3>
          <p className="quick-board__notes">{build.notes}</p>
        </section>
      ) : null}
    </section>
  );
}
