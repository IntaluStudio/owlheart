import classes from "./voidPlaytest/classes.json";
import domainCards from "./voidPlaytest/domain-cards.json";
import subclasses from "./voidPlaytest/subclasses.json";
import { normalizeDaggerheartRelease } from "../lib/daggerheartData";

const VOID_SOURCE = "Void Playtest";

export const voidPlaytestContent = normalizeDaggerheartRelease({
  source: VOID_SOURCE,
  files: {
    "classes.json": classes,
    "domain-cards.json": domainCards,
    "subclasses.json": subclasses,
  },
}).map((entry) => ({
  ...entry,
  source: VOID_SOURCE,
  tags: [...entry.tags, "void-playtest", "playtest"],
  system: {
    ...entry.system,
    playtest: true,
    sourceLabel: VOID_SOURCE,
  },
}));
