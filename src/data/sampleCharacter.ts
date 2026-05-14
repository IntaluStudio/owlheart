import type { CharacterBuild } from "../lib/types";

export const sampleCharacter: CharacterBuild = {
  id: "character:kael-brightroad",
  name: "Kael Brightroad",
  ancestryId: "core_ancestry_human",
  communityId: "core_community_wanderborne",
  classId: "core_class_warrior",
  subclassId: "core_subclass_call_of_the_brave",
  level: 2,
  selectedDomains: ["blade", "bone"],
  selectedDomainCards: ["core_domain_card_whirlwind", "core_domain_card_deft_maneuvers"],
  selectedAbilities: ["core_class_warrior:feature:combat-training"],
  selectedEquipment: ["core_weapon_spear"],
  traits: {
    agility: 1,
    strength: 2,
    finesse: 0,
    instinct: 0,
    presence: 1,
    knowledge: -1,
  },
  experiences: [{ id: "experience:kael:pathfinder", name: "Pathfinder", modifier: 2 }],
  notes: "Sample lightweight build. Content is referenced by ID; rules text stays in the content index.",
  manualOverrides: {},
};
