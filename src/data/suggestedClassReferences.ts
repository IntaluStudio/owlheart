import type { CharacterTraits } from "../lib/types";

type SuggestedInventoryOption = {
  label: string;
  contentId?: string;
};

type SuggestedInventoryChoice = {
  id: string;
  label: string;
  options: SuggestedInventoryOption[];
};

export type SuggestedClassReference = {
  classId: string;
  className: string;
  source: {
    pdf: string;
    pdfPage: number;
  };
  traits: CharacterTraits;
  equipment: {
    primaryWeaponId: string;
    secondaryWeaponId?: string;
    armorId: string;
  };
  inventory: {
    always: string[];
    choices: SuggestedInventoryChoice[];
    notes?: string[];
  };
};

const PDF_SOURCE = "Reference Data/Character-Sheets-and-Guides-Daggerheart-May212025.pdf";

const commonInventory = ["a torch", "50 feet of rope", "basic supplies", "a handful of gold"];

const minorConsumableChoice: SuggestedInventoryChoice = {
  id: "minor-consumable",
  label: "Choose one consumable",
  options: [
    { label: "Minor Health Potion", contentId: "core_consumable_minor_health_potion" },
    { label: "Minor Stamina Potion", contentId: "core_consumable_minor_stamina_potion" },
  ],
};

function source(pdfPage: number) {
  return {
    pdf: PDF_SOURCE,
    pdfPage,
  };
}

function inventory(classItemOptions: SuggestedInventoryOption[], notes: string[] = []) {
  return {
    always: commonInventory,
    choices: [
      minorConsumableChoice,
      {
        id: "class-item",
        label: "Choose one class item",
        options: classItemOptions,
      },
    ],
    notes,
  };
}

export const suggestedClassReferences: SuggestedClassReference[] = [
  {
    classId: "core_class_bard",
    className: "Bard",
    source: source(2),
    traits: { agility: 0, strength: -1, finesse: 1, instinct: 0, presence: 2, knowledge: 1 },
    equipment: {
      primaryWeaponId: "core_weapon_rapier",
      secondaryWeaponId: "core_weapon_small_dagger",
      armorId: "core_armor_gambeson_armor",
    },
    inventory: inventory(
      [{ label: "a romance novel" }, { label: "a letter never opened" }],
      ["Choose what you carry your spells in, such as a songbook or journal."],
    ),
  },
  {
    classId: "core_class_druid",
    className: "Druid",
    source: source(6),
    traits: { agility: 1, strength: 0, finesse: 1, instinct: 2, presence: -1, knowledge: 0 },
    equipment: {
      primaryWeaponId: "core_weapon_shortstaff",
      secondaryWeaponId: "core_weapon_round_shield",
      armorId: "core_armor_leather_armor",
    },
    inventory: inventory([{ label: "a small bag of rocks and bones" }, { label: "a strange pendant found in the dirt" }]),
  },
  {
    classId: "core_class_guardian",
    className: "Guardian",
    source: source(8),
    traits: { agility: 1, strength: 2, finesse: -1, instinct: 0, presence: 1, knowledge: 0 },
    equipment: {
      primaryWeaponId: "core_weapon_battleaxe",
      armorId: "core_armor_chainmail_armor",
    },
    inventory: inventory([{ label: "a totem from your mentor" }, { label: "a secret key" }]),
  },
  {
    classId: "core_class_ranger",
    className: "Ranger",
    source: source(11),
    traits: { agility: 2, strength: 0, finesse: 1, instinct: 1, presence: -1, knowledge: 0 },
    equipment: {
      primaryWeaponId: "core_weapon_shortbow",
      armorId: "core_armor_leather_armor",
    },
    inventory: inventory([{ label: "a trophy from your first kill" }, { label: "a seemingly broken compass" }]),
  },
  {
    classId: "core_class_rogue",
    className: "Rogue",
    source: source(13),
    traits: { agility: 1, strength: -1, finesse: 2, instinct: 0, presence: 1, knowledge: 0 },
    equipment: {
      primaryWeaponId: "core_weapon_dagger",
      secondaryWeaponId: "core_weapon_small_dagger",
      armorId: "core_armor_gambeson_armor",
    },
    inventory: inventory([{ label: "a set of forgery tools" }, { label: "a grappling hook" }]),
  },
  {
    classId: "core_class_seraph",
    className: "Seraph",
    source: source(15),
    traits: { agility: 0, strength: 2, finesse: 0, instinct: 1, presence: 1, knowledge: -1 },
    equipment: {
      primaryWeaponId: "core_weapon_hallowed_axe",
      secondaryWeaponId: "core_weapon_round_shield",
      armorId: "core_armor_chainmail_armor",
    },
    inventory: inventory([{ label: "a bundle of offerings" }, { label: "a sigil of your god" }]),
  },
  {
    classId: "core_class_sorcerer",
    className: "Sorcerer",
    source: source(17),
    traits: { agility: 0, strength: -1, finesse: 1, instinct: 2, presence: 1, knowledge: 0 },
    equipment: {
      primaryWeaponId: "core_weapon_dualstaff",
      armorId: "core_armor_gambeson_armor",
    },
    inventory: inventory([{ label: "a whispering orb" }, { label: "a family heirloom" }]),
  },
  {
    classId: "core_class_warrior",
    className: "Warrior",
    source: source(19),
    traits: { agility: 2, strength: 1, finesse: 0, instinct: 1, presence: -1, knowledge: 0 },
    equipment: {
      primaryWeaponId: "core_weapon_longsword",
      armorId: "core_armor_chainmail_armor",
    },
    inventory: inventory([{ label: "the drawing of a lover" }, { label: "a sharpening stone" }]),
  },
  {
    classId: "core_class_wizard",
    className: "Wizard",
    source: source(21),
    traits: { agility: -1, strength: 0, finesse: 0, instinct: 1, presence: 1, knowledge: 2 },
    equipment: {
      primaryWeaponId: "core_weapon_greatstaff",
      armorId: "core_armor_leather_armor",
    },
    inventory: inventory(
      [{ label: "a book you're trying to translate" }, { label: "a tiny, harmless elemental pet" }],
      ["Choose what you carry your spells in, such as large tomes or tarot cards."],
    ),
  },
];
