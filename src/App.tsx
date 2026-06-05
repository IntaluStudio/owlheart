import { Boxes, BookOpen, Dice5, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BuildManager } from "./components/BuildManager";
import { DualityHelper } from "./components/DualityHelper";
import { HomebrewManager } from "./components/HomebrewManager";
import { RollLog } from "./components/RollLog";
import { SrdBrowser } from "./components/SrdBrowser";
import { sampleCharacter } from "./data/sampleCharacter";
import { voidPlaytestContent } from "./data/voidPlaytestContent";
import { getActiveContent } from "./lib/contentIndex";
import { loadSrdContent } from "./lib/srdDataLoader";
import { subscribeToSharedRolls } from "./lib/owlbear";
import {
  loadCharacterBuilds,
  loadHomebrewPacks,
  loadVoidContentEnabled,
  saveCharacterBuilds,
  saveHomebrewPacks,
  saveVoidContentEnabled,
} from "./lib/storage";
import type { CharacterBuild, ContentEntry, HomebrewPack, SharedRollEntry } from "./lib/types";

type TabId = "srd" | "homebrew" | "builds" | "duality";

const tabs = [
  { id: "builds", label: "Builds", icon: UserRound },
  { id: "srd", label: "SRD", icon: BookOpen },
  { id: "homebrew", label: "Packs", icon: Boxes, disabled: true },
  { id: "duality", label: "Dice", icon: Dice5 },
] satisfies Array<{ id: TabId; label: string; icon: typeof BookOpen; disabled?: boolean }>;

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("builds");
  const [srdContent, setSrdContent] = useState<ContentEntry[]>([]);
  const [isSrdLoading, setIsSrdLoading] = useState(true);
  const [srdLoadError, setSrdLoadError] = useState<string | null>(null);
  const [packs, setPacks] = useState<HomebrewPack[]>(() => loadHomebrewPacks());
  const [builds, setBuilds] = useState<CharacterBuild[]>(() => loadCharacterBuilds([sampleCharacter]));
  const [voidContentEnabled, setVoidContentEnabled] = useState(() => loadVoidContentEnabled());
  const [sharedRolls, setSharedRolls] = useState<SharedRollEntry[]>([]);

  useEffect(() => {
    let isCurrent = true;

    loadSrdContent()
      .then((entries) => {
        if (isCurrent) {
          setSrdContent(entries);
          setSrdLoadError(null);
          setIsSrdLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setSrdLoadError(error instanceof Error ? error.message : "Unable to load SRD data");
          setIsSrdLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    saveHomebrewPacks(packs);
  }, [packs]);

  useEffect(() => {
    saveCharacterBuilds(builds);
  }, [builds]);

  useEffect(() => {
    saveVoidContentEnabled(voidContentEnabled);
  }, [voidContentEnabled]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isCurrent = true;

    subscribeToSharedRolls((roll) => {
      setSharedRolls((current) => [roll, ...current.filter((entry) => entry.id !== roll.id)].slice(0, 10));
    }).then((cleanup) => {
      if (isCurrent) {
        unsubscribe = cleanup;
      } else {
        cleanup();
      }
    });

    return () => {
      isCurrent = false;
      unsubscribe?.();
    };
  }, []);

  const baseContent = useMemo(
    () => (voidContentEnabled ? [...srdContent, ...voidPlaytestContent] : srdContent),
    [srdContent, voidContentEnabled],
  );
  const activeContent = useMemo(() => getActiveContent(baseContent, packs), [baseContent, packs]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Daggerheart Toolkit</h1>
          <p>SRD lookup, homebrew packs, build references, and duality results.</p>
        </div>
        <label className="switch switch--header">
          <input
            type="checkbox"
            checked={voidContentEnabled}
            onChange={(event) => setVoidContentEnabled(event.target.checked)}
          />
          <span>Void content</span>
        </label>
      </header>

      <nav className="tab-bar" aria-label="Daggerheart Toolkit views">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "tab-button tab-button--active" : "tab-button"}
              disabled={tab.disabled}
              title={tab.disabled ? `${tab.label} disabled for now` : undefined}
              onClick={() => {
                if (!tab.disabled) {
                  setActiveTab(tab.id);
                }
              }}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {isSrdLoading ? <p className="status-line">Loading SRD data...</p> : null}
      {srdLoadError ? <p className="inline-error">{srdLoadError}</p> : null}

      {activeTab === "srd" ? <SrdBrowser entries={activeContent} /> : null}
      {activeTab === "homebrew" ? <HomebrewManager packs={packs} onChange={setPacks} /> : null}
      {activeTab === "builds" ? <BuildManager builds={builds} entries={activeContent} onChange={setBuilds} /> : null}
      {activeTab === "duality" ? <DualityHelper /> : null}
      <RollLog rolls={sharedRolls} />
    </main>
  );
}
