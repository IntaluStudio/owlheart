import { Dices } from "lucide-react";
import { useState } from "react";
import { broadcastSharedRoll } from "../lib/owlbear";

function rollD12() {
  return Math.floor(Math.random() * 12) + 1;
}

export function QuickRollStrip() {
  const [status, setStatus] = useState("");

  const roll = async (label: string) => {
    const total = rollD12();
    const sent = await broadcastSharedRoll({
      label,
      resultText: `${label}: ${total}`,
      total,
    });
    setStatus(sent ? `${label}: ${total}` : `${label}: ${total} (local only)`);
  };

  return (
    <section className="quick-roll-strip" aria-label="Quick rolls">
      <span>Quick roll</span>
      <div>
        <button type="button" className="button" onClick={() => roll("Hope d12")}>
          <Dices size={15} aria-hidden="true" />
          Hope
        </button>
        <button type="button" className="button" onClick={() => roll("Fear d12")}>
          <Dices size={15} aria-hidden="true" />
          Fear
        </button>
        <button type="button" className="button" onClick={() => roll("Flat d12")}>
          <Dices size={15} aria-hidden="true" />
          d12
        </button>
      </div>
      {status ? <strong>{status}</strong> : null}
    </section>
  );
}
