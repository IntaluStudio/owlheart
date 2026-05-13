import { Boxes, BookOpen, Dice5, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BuildManager } from "./components/BuildManager";
import { DualityHelper } from "./components/DualityHelper";
import { HomebrewManager } from "./components/HomebrewManager";
import { SrdBrowser } from "./components/SrdBrowser";
import { sampleCharacter } from "./data/sampleCharacter";
import { srdContent } from "./data/srdContent";
import { getActiveContent } from "./lib/contentIndex";
import { loadCharacterBuilds, loadHomebrewPacks, saveCharacterBuilds, saveHomebrewPacks } from "./lib/storage";
import type { CharacterBuild, HomebrewPack } from "./lib/types";

type TabId = "srd" | "homebrew" | "builds" | "duality";

const tabs = [
  { id: "srd", label: "SRD", icon: BookOpen },
  { id: "homebrew", label: "Packs", icon: Boxes },
  { id: "builds", label: "Builds", icon: UserRound },
  { id: "duality", label: "Duality", icon: Dice5 },
] satisfies Array<{ id: TabId; label: string; icon: typeof BookOpen }>;

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("srd");
  const [packs, setPacks] = useState<HomebrewPack[]>(() => loadHomebrewPacks());
  const [builds, setBuilds] = useState<CharacterBuild[]>(() => loadCharacterBuilds([sampleCharacter]));

  useEffect(() => {
    saveHomebrewPacks(packs);
  }, [packs]);

  useEffect(() => {
    saveCharacterBuilds(builds);
  }, [builds]);

  const activeContent = useMemo(() => getActiveContent(srdContent, packs), [packs]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Daggerheart Toolkit</h1>
          <p>SRD lookup, homebrew packs, build references, and duality results.</p>
        </div>
      </header>

      <nav className="tab-bar" aria-label="Daggerheart Toolkit views">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "tab-button tab-button--active" : "tab-button"}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {activeTab === "srd" ? <SrdBrowser entries={activeContent} /> : null}
      {activeTab === "homebrew" ? <HomebrewManager packs={packs} onChange={setPacks} /> : null}
      {activeTab === "builds" ? <BuildManager builds={builds} entries={activeContent} onChange={setBuilds} /> : null}
      {activeTab === "duality" ? <DualityHelper /> : null}
    </main>
  );
}
