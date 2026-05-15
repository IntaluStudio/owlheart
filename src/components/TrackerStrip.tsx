import type { CharacterBuild, CharacterFeatureToken } from "../lib/types";

type TrackerStripProps = {
  build: CharacterBuild;
  onStatusChange: (patch: Partial<CharacterBuild["status"]>) => void;
  onTokenChange: (tokens: CharacterFeatureToken[]) => void;
};

function clamp(value: number, min: number, max?: number) {
  return Math.max(min, max === undefined ? value : Math.min(max, value));
}

function ResourceControl({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="tracker-control">
      <span>{label}</span>
      <div>
        <button type="button" className="icon-button" onClick={() => onChange(clamp(value - 1, 0, max))} aria-label={`Decrease ${label}`}>
          -
        </button>
        <strong>{max === undefined ? value : `${value}/${max}`}</strong>
        <button type="button" className="icon-button" onClick={() => onChange(clamp(value + 1, 0, max))} aria-label={`Increase ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

export function TrackerStrip({ build, onStatusChange, onTokenChange }: TrackerStripProps) {
  const updateToken = (tokenId: string, value: number) => {
    onTokenChange(
      build.featureTokens.map((token) =>
        token.id === tokenId ? { ...token, current: clamp(value, 0, token.max) } : token,
      ),
    );
  };

  return (
    <section className="tracker-strip" aria-label="Local character trackers">
      <ResourceControl label="HP" value={build.status.markedHp} max={build.status.maxHp} onChange={(markedHp) => onStatusChange({ markedHp })} />
      <ResourceControl label="Stress" value={build.status.markedStress} max={build.status.maxStress} onChange={(markedStress) => onStatusChange({ markedStress })} />
      <ResourceControl label="Armor" value={build.status.markedArmor} max={build.status.armorSlots} onChange={(markedArmor) => onStatusChange({ markedArmor })} />
      <ResourceControl label="Hope" value={build.status.hope} onChange={(hope) => onStatusChange({ hope })} />
      {build.featureTokens.map((token) => (
        <ResourceControl
          key={token.id}
          label={token.label}
          value={token.current}
          max={token.max}
          onChange={(value) => updateToken(token.id, value)}
        />
      ))}
    </section>
  );
}
