import classes from "../../vendor/daggerheart-data/the_void/classes.json";
import domainCards from "../../vendor/daggerheart-data/the_void/domain-cards.json";
import subclasses from "../../vendor/daggerheart-data/the_void/subclasses.json";
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
