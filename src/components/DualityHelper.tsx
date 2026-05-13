import { Bell, Copy, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDualityResult } from "../lib/duality";
import { sendRumbleChat, showOwlbearNotification, writeLastDualityResult } from "../lib/owlbear";

export function DualityHelper() {
  const [hopeDie, setHopeDie] = useState(8);
  const [fearDie, setFearDie] = useState(5);
  const [modifier, setModifier] = useState(1);
  const [status, setStatus] = useState("");

  const result = useMemo(() => {
    try {
      return formatDualityResult({ hopeDie, fearDie, modifier });
    } catch {
      return undefined;
    }
  }, [fearDie, hopeDie, modifier]);

  const copyResult = async () => {
    if (!result) {
      return;
    }
    await navigator.clipboard.writeText(result.copyText);
    setStatus("Copied result.");
  };

  const notify = async () => {
    if (!result) {
      return;
    }
    await writeLastDualityResult(result);
    const shown = await showOwlbearNotification(result.label, result.outcome === "With Fear" ? "WARNING" : "SUCCESS");
    setStatus(shown ? "Sent Owlbear notification." : "Owlbear is not available in this browser context.");
  };

  const sendToRumble = async () => {
    if (!result) {
      return;
    }
    await writeLastDualityResult(result);
    const sent = await sendRumbleChat(result.copyText.replace(/\n/g, " | "));
    setStatus(sent ? "Sent to Rumble metadata." : "Rumble output requires an Owlbear room context.");
  };

  return (
    <section className="duality-panel">
      <div className="duality-inputs">
        <label>
          <span>Hope die</span>
          <input type="number" min={1} max={12} value={hopeDie} onChange={(event) => setHopeDie(Number(event.target.value))} />
        </label>
        <label>
          <span>Fear die</span>
          <input type="number" min={1} max={12} value={fearDie} onChange={(event) => setFearDie(Number(event.target.value))} />
        </label>
        <label>
          <span>Modifier</span>
          <input type="number" value={modifier} onChange={(event) => setModifier(Number(event.target.value))} />
        </label>
      </div>

      {result ? (
        <div className={`roll-result roll-result--${result.outcome.toLowerCase().replace(/\s+/g, "-")}`}>
          <span>Total</span>
          <strong>{result.total}</strong>
          <em>{result.outcome}</em>
          <code>
            {result.hopeDie} + {result.fearDie} {modifier >= 0 ? "+" : "-"} {Math.abs(modifier)}
          </code>
        </div>
      ) : (
        <div className="error-box" role="alert">
          Hope and Fear dice must each be 1-12.
        </div>
      )}

      <div className="toolbar toolbar--wrap">
        <button type="button" className="button button--primary" onClick={copyResult} disabled={!result}>
          <Copy size={16} aria-hidden="true" />
          Copy result
        </button>
        <button type="button" className="button" onClick={notify} disabled={!result}>
          <Bell size={16} aria-hidden="true" />
          Notify
        </button>
        <button type="button" className="button" onClick={sendToRumble} disabled={!result}>
          <MessageSquare size={16} aria-hidden="true" />
          Rumble
        </button>
      </div>
      {status ? <p className="status-line">{status}</p> : null}
    </section>
  );
}
