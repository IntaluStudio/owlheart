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
  notes: "Sample lightweight build. Content is referenced by ID; rules text stays in the content index.",
  manualOverrides: {},
};
