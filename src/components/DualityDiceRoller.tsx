import { Bell, Copy, Dices, MessageSquare, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AmbientLight,
  Color,
  DirectionalLight,
  DodecahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { formatDaggerheartRoll } from "../lib/daggerheartRolls";
import { sendRumbleChat, showOwlbearNotification, writeLastDualityResult } from "../lib/owlbear";
import type { DaggerheartRollKind, DaggerheartRollMode, DaggerheartRollResult, DualityResult } from "../lib/types";

type DualityDiceRollerProps = {
  label: string;
  modifier: number;
  kind?: DaggerheartRollKind;
  initialMode?: DaggerheartRollMode;
  initialDifficulty?: number;
  onClose: () => void;
};

function rollD12() {
  return Math.floor(Math.random() * 12) + 1;
}

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

function toDualityResult(result: DaggerheartRollResult): DualityResult {
  return {
    hopeDie: result.hopeDie,
    fearDie: result.fearDie,
    modifier: result.modifier + result.adjustment,
    total: result.total,
    outcome: result.outcome,
    label: result.labelText,
    copyText: result.copyText,
  };
}

function DiceScene({ hopeDie, fearDie, rolling }: { hopeDie: number; fearDie: number; rolling: boolean }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rollingRef = useRef(rolling);

  useEffect(() => {
    rollingRef.current = rolling;
  }, [rolling]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const scene = new Scene();
    scene.background = new Color("#f7f8f6");

    const camera = new PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    const ambient = new AmbientLight("#ffffff", 1.8);
    const key = new DirectionalLight("#fff4dc", 2.2);
    key.position.set(3, 4, 5);
    scene.add(ambient, key);

    const geometry = new DodecahedronGeometry(1, 0);
    const hope = new Mesh(
      geometry,
      new MeshStandardMaterial({ color: "#f7f4ea", roughness: 0.42, metalness: 0.08 }),
    );
    const fear = new Mesh(
      geometry,
      new MeshStandardMaterial({ color: "#2d3136", roughness: 0.5, metalness: 0.12 }),
    );
    hope.position.x = -1.35;
    fear.position.x = 1.35;
    scene.add(hope, fear);

    // Size from the panel itself so the canvas stays correct inside popovers.
    const resize = () => {
      const width = Math.max(240, host.clientWidth);
      const height = 190;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize(); // run once immediately; ResizeObserver fires async on first observe

    let animationId = 0;
    const animate = () => {
      const speed = rollingRef.current ? 0.075 : 0.015;
      hope.rotation.x += speed;
      hope.rotation.y += speed * 1.3;
      fear.rotation.x += speed * 1.1;
      fear.rotation.z += speed * 0.9;
      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      resizeObserver.disconnect();

      scene.remove(hope, fear, ambient, key);

      geometry.dispose();
      hope.material.dispose();
      fear.material.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="dice-scene" ref={hostRef} aria-label="Hope and Fear d12 dice">
      <div className="dice-scene__labels" aria-hidden="true">
        <span>{hopeDie}</span>
        <span>{fearDie}</span>
      </div>
    </div>
  );
}

export function DualityDiceRoller({
  label,
  modifier,
  kind = "trait",
  initialMode = "normal",
  initialDifficulty,
  onClose,
}: DualityDiceRollerProps) {
  const [hopeDie, setHopeDie] = useState(rollD12());
  const [fearDie, setFearDie] = useState(rollD12());
  const [advantageDie, setAdvantageDie] = useState(rollD6());
  const [mode, setMode] = useState<DaggerheartRollMode>(initialMode);
  const [rollKind, setRollKind] = useState<DaggerheartRollKind>(kind);
  const [difficulty, setDifficulty] = useState<number | undefined>(initialDifficulty);
  const [rolling, setRolling] = useState(false);
  const [status, setStatus] = useState("");

  const result = useMemo(
    () =>
      formatDaggerheartRoll({
        kind: rollKind,
        label,
        hopeDie,
        fearDie,
        modifier,
        mode,
        advantageDie,
        difficulty,
      }),
    [advantageDie, difficulty, fearDie, hopeDie, label, mode, modifier, rollKind],
  );
  const dualityResult = useMemo(() => toDualityResult(result), [result]);

  const roll = () => {
    setRolling(true);
    setStatus("");
    window.setTimeout(() => {
      setHopeDie(rollD12());
      setFearDie(rollD12());
      setAdvantageDie(rollD6());
      setRolling(false);
    }, 620);
  };

  const copyResult = async (rolled: DaggerheartRollResult) => {
    await navigator.clipboard.writeText(`${label}\n${rolled.copyText}`);
    setStatus("Copied result.");
  };

  const notify = async (rolled: DaggerheartRollResult) => {
    await writeLastDualityResult(toDualityResult(rolled));
    const shown = await showOwlbearNotification(`${label}: ${rolled.labelText}`, rolled.outcome === "With Fear" ? "WARNING" : "SUCCESS");
    setStatus(shown ? "Sent Owlbear notification." : "Owlbear is not available in this browser context.");
  };

  const sendToRumble = async (rolled: DaggerheartRollResult) => {
    await writeLastDualityResult(toDualityResult(rolled));
    const sent = await sendRumbleChat(`${label} | ${rolled.copyText.replace(/\n/g, " | ")}`);
    setStatus(sent ? "Sent to Rumble metadata." : "Rumble output requires an Owlbear room context.");
  };

  return (
    <div className="roller-backdrop" role="dialog" aria-modal="true" aria-label={`${label} duality roll`}>
      <section className="roller-panel">
        <div className="roller-panel__header">
          <div>
            <span>Duality Roll</span>
            <h2>{label}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close roller">
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <DiceScene hopeDie={hopeDie} fearDie={fearDie} rolling={rolling} />

        <div className="segmented-tabs segmented-tabs--compact" aria-label="Roll type">
          {(["trait", "action", "reaction"] satisfies DaggerheartRollKind[]).map((option) => (
            <button
              key={option}
              type="button"
              className={rollKind === option ? "segmented-tab segmented-tab--active" : "segmented-tab"}
              onClick={() => setRollKind(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="segmented-tabs segmented-tabs--compact" aria-label="Roll mode">
          {(["normal", "advantage", "disadvantage"] satisfies DaggerheartRollMode[]).map((option) => (
            <button
              key={option}
              type="button"
              className={mode === option ? "segmented-tab segmented-tab--active" : "segmented-tab"}
              onClick={() => setMode(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <label>
          <span>Difficulty</span>
          <input
            type="number"
            min={0}
            value={difficulty ?? ""}
            onChange={(event) => setDifficulty(event.target.value ? Number(event.target.value) : undefined)}
            placeholder="Optional"
          />
        </label>

        <div className={`roll-result roll-result--${result.outcome.toLowerCase().replace(/\s+/g, "-")}`}>
          <span>Total</span>
          <strong>{result.total}</strong>
          <em>
            {result.success === undefined ? "" : result.success ? "Success " : "Failure "}
            {result.outcome}
          </em>
          <code>
            Hope {hopeDie} + Fear {fearDie} {modifier >= 0 ? "+" : "-"} {Math.abs(modifier)}
            {mode !== "normal" ? ` ${result.adjustment >= 0 ? "+" : "-"} ${Math.abs(result.adjustment)}` : ""}
          </code>
        </div>

        <div className="toolbar toolbar--wrap">
          <button type="button" className="button button--primary" onClick={roll} disabled={rolling}>
            <Dices size={16} aria-hidden="true" />
            {rolling ? "Rolling" : "Roll"}
          </button>
          <button type="button" className="button" onClick={() => copyResult(result)}>
            <Copy size={16} aria-hidden="true" />
            Copy
          </button>
          <button type="button" className="button" onClick={() => notify(result)}>
            <Bell size={16} aria-hidden="true" />
            Notify
          </button>
          <button type="button" className="button" onClick={() => sendToRumble(result)}>
            <MessageSquare size={16} aria-hidden="true" />
            Rumble
          </button>
        </div>
        <p className="status-line">{dualityResult.copyText.split("\n").slice(-1)[0]}</p>
        {status ? <p className="status-line">{status}</p> : null}
      </section>
    </div>
  );
}
