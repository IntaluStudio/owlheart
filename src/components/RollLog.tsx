import type { SharedRollEntry } from "../lib/types";

type RollLogProps = {
  rolls: SharedRollEntry[];
};

export function RollLog({ rolls }: RollLogProps) {
  return (
    <section className="roll-log" aria-label="Shared roll log">
      <div className="roll-log__header">
        <strong>Shared rolls</strong>
        <span>{rolls.length ? "Last rolls in room" : "Waiting for room rolls"}</span>
      </div>
      {rolls.length ? (
        <ol>
          {rolls.map((roll) => (
            <li key={roll.id}>
              <span>{roll.playerName}</span>
              <strong>{roll.label}</strong>
              <em>{roll.resultText}</em>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
