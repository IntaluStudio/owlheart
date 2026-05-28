import type { CharacterDescription, CharacterTraits } from "../lib/types";

type SuggestedInventoryOption = {
  label: string;
  contentId?: string;
};

type SuggestedInventoryChoice = {
  id: string;
  label: string;
  options: SuggestedInventoryOption[];
};

type SuggestedDescriptionPrompt = {
  id: keyof CharacterDescription;
  label: string;
  options: string[];
};

type SuggestedConnectionPrompt = {
  id: string;
  prompt: string;
};

export type SuggestedClassReferenceOverride = {
  subclassId: string;
  label: string;
  traits?: CharacterTraits;
  equipment?: Partial<{
    primaryWeaponId: string;
    secondaryWeaponId?: string;
    armorId: string;
  }>;
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
  descriptionPrompts: SuggestedDescriptionPrompt[];
  backgroundQuestions: string[];
  connectionPrompts: SuggestedConnectionPrompt[];
  domainCardCount: number;
  subclassOverrides?: SuggestedClassReferenceOverride[];
};

const PDF_SOURCE = "Reference Data/Character-Sheets-and-Guides-Daggerheart-May212025.pdf";

const commonInventory = ["a torch", "50 feet of rope", "basic supplies", "a handful of gold"];

const defaultDescriptionPrompts: SuggestedDescriptionPrompt[] = [
  { id: "clothes", label: "Clothes that are...", options: ["Casual", "Intricate", "Loose", "Padded", "Royal", "Tactical", "Weathered"] },
  { id: "eyes", label: "Eyes like...", options: ["Bright", "Clouded", "Gold-flecked", "Kind", "Piercing", "Tired", "Watchful"] },
  { id: "body", label: "Body that's...", options: ["Broad", "Compact", "Graceful", "Scarred", "Tall", "Wiry", "Weathered"] },
  { id: "skin", label: "Skin the color of...", options: ["Ash", "Bronze", "Clay", "Deep earth", "Honey", "Moonlight", "Warm bark"] },
];

const defaultBackgroundQuestions = [
  "Who from your community did you fail to protect, and why do you still think of them?",
  "You've been tasked with protecting something important and delivering it somewhere dangerous. What is it, and where does it need to go?",
];

const defaultConnectionPrompts: SuggestedConnectionPrompt[] = [
  { id: "connection-1", prompt: "How did I save your life the first time we met?" },
  { id: "connection-2", prompt: "What small gift did you give me that you notice I always carry with me?" },
];

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

function classReference(
  reference: Omit<
    SuggestedClassReference,
    "descriptionPrompts" | "backgroundQuestions" | "connectionPrompts" | "domainCardCount"
  > &
    Partial<Pick<SuggestedClassReference, "descriptionPrompts" | "backgroundQuestions" | "connectionPrompts" | "domainCardCount">>,
): SuggestedClassReference {
  return {
    ...reference,
    descriptionPrompts: reference.descriptionPrompts ?? defaultDescriptionPrompts,
    backgroundQuestions: reference.backgroundQuestions ?? defaultBackgroundQuestions,
    connectionPrompts: reference.connectionPrompts ?? defaultConnectionPrompts,
    domainCardCount: reference.domainCardCount ?? 2,
  };
}

export const suggestedClassReferences: SuggestedClassReference[] = [
  classReference({
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
  }),
  classReference({
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
  }),
  classReference({
    classId: "core_class_guardian",
    className: "Guardian",
    source: source(8),
    traits: { agility: 1, strength: 2, finesse: -1, instinct: 0, presence: 1, knowledge: 0 },
    equipment: {
      primaryWeaponId: "core_weapon_battleaxe",
      armorId: "core_armor_chainmail_armor",
    },
    inventory: inventory([{ label: "a totem from your mentor" }, { label: "a secret key" }]),
  }),
  classReference({
    classId: "core_class_ranger",
    className: "Ranger",
    source: source(11),
    traits: { agility: 2, strength: 0, finesse: 1, instinct: 1, presence: -1, knowledge: 0 },
    equipment: {
      primaryWeaponId: "core_weapon_shortbow",
      armorId: "core_armor_leather_armor",
    },
    inventory: inventory([{ label: "a trophy from your first kill" }, { label: "a seemingly broken compass" }]),
  }),
  classReference({
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
  }),
  classReference({
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
  }),
  classReference({
    classId: "core_class_sorcerer",
    className: "Sorcerer",
    source: source(17),
    traits: { agility: 0, strength: -1, finesse: 1, instinct: 2, presence: 1, knowledge: 0 },
    equipment: {
      primaryWeaponId: "core_weapon_dualstaff",
      armorId: "core_armor_gambeson_armor",
    },
    inventory: inventory([{ label: "a whispering orb" }, { label: "a family heirloom" }]),
  }),
  classReference({
    classId: "core_class_warrior",
    className: "Warrior",
    source: source(19),
    traits: { agility: 2, strength: 1, finesse: 0, instinct: 1, presence: -1, knowledge: 0 },
    equipment: {
      primaryWeaponId: "core_weapon_longsword",
      armorId: "core_armor_chainmail_armor",
    },
    inventory: inventory([{ label: "the drawing of a lover" }, { label: "a sharpening stone" }]),
  }),
  classReference({
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
  }),
  classReference({
    classId: "the_void_class_witch",
    className: "Witch",
    source: { pdf: "Reference Data/Witch-v1.5-The-Void.pdf", pdfPage: 2 },
    traits: { agility: 0, strength: -1, finesse: 0, instinct: 2, presence: 1, knowledge: 1 },
    equipment: {
      primaryWeaponId: "core_weapon_dualstaff",
      armorId: "core_armor_gambeson_armor",
    },
    inventory: inventory([{ label: "a handcrafted besom" }, { label: "a pouch of animal bones you found in the wild" }]),
    backgroundQuestions: [
      "What omen first taught you that your craft was real?",
      "Who fears your magic, and what did you do to earn that fear?",
    ],
    connectionPrompts: [
      { id: "connection-1", prompt: "Why do you come to me for advice?" },
      { id: "connection-2", prompt: "What charm did I craft for you, and why do you still keep it close?" },
    ],
  }),
  classReference({
    classId: "the_void_class_assassin",
    className: "Assassin",
    source: { pdf: "Reference Data/Assassin-v1.5-The-Void2.pdf", pdfPage: 2 },
    traits: { agility: 2, strength: -1, finesse: 1, instinct: 0, presence: 0, knowledge: 1 },
    equipment: {
      primaryWeaponId: "core_weapon_broadsword",
      secondaryWeaponId: "core_weapon_shortsword",
      armorId: "core_armor_leather_armor",
    },
    inventory: inventory([{ label: "a list of names with several marked off" }, { label: "a mortar and pestle inscribed with a mysterious insignia" }]),
    backgroundQuestions: [
      "Who was the first name you crossed off your list, and why?",
      "What line will you never cross, even for a contract?",
    ],
    connectionPrompts: [
      { id: "connection-1", prompt: "What secret about myself did I tell you, and how did it change your view of me?" },
      { id: "connection-2", prompt: "When did you realize I was not just a weapon?" },
    ],
  }),
  classReference({
    classId: "the_void_class_warlock",
    className: "Warlock",
    source: { pdf: "Reference Data/Warlock-v1.5-The-Void.pdf", pdfPage: 2 },
    traits: { agility: 1, strength: -1, finesse: 0, instinct: 1, presence: 2, knowledge: 0 },
    equipment: {
      primaryWeaponId: "core_weapon_scepter",
      armorId: "core_armor_leather_armor",
    },
    inventory: inventory([{ label: "a carving that symbolizes your patron" }, { label: "a ring you can't remove" }]),
    backgroundQuestions: [
      "What did you give your patron that you can never fully reclaim?",
      "What does your patron want you to become?",
    ],
    connectionPrompts: [
      { id: "connection-1", prompt: "What promise did my patron make to you through me?" },
      { id: "connection-2", prompt: "What did you witness when I first called on my patron?" },
    ],
  }),
  classReference({
    classId: "the_void_class_brawler",
    className: "Brawler",
    source: { pdf: "Reference Data/Brawler-v1.5-The-Void.pdf", pdfPage: 2 },
    traits: { agility: 1, strength: 1, finesse: 0, instinct: 2, presence: 0, knowledge: -1 },
    equipment: {
      primaryWeaponId: "core_weapon_quarterstaff",
      armorId: "core_armor_leather_armor",
    },
    inventory: inventory([{ label: "hand wraps from a mentor" }, { label: "a book about your secret hobby" }]),
    backgroundQuestions: [
      "Who taught you to keep getting back up?",
      "What fight do you regret winning?",
    ],
    connectionPrompts: [
      { id: "connection-1", prompt: "When did I see you fight without a weapon and know you would survive?" },
      { id: "connection-2", prompt: "What secret hobby did I discover, and why do I keep it quiet?" },
    ],
  }),
  classReference({
    classId: "the_void_class_bloodhunter",
    className: "Blood Hunter",
    source: { pdf: "Reference Data/Bloodhunter-v1.5-The-Void.pdf", pdfPage: 2 },
    traits: { agility: 2, strength: -1, finesse: 1, instinct: 1, presence: 0, knowledge: 0 },
    equipment: {
      primaryWeaponId: "core_weapon_longsword",
      armorId: "core_armor_leather_armor",
    },
    inventory: inventory([{ label: "a steel needle" }, { label: "a vial holding a foe's blood" }]),
    backgroundQuestions: [
      "What creature taught you that evil can wear a familiar face?",
      "What price has hemocraft already taken from you?",
    ],
    connectionPrompts: [
      { id: "connection-1", prompt: "How does my determination to rid the Mortal Realms of evildoers align with your beliefs?" },
      { id: "connection-2", prompt: "What did you ask me not to become?" },
    ],
    subclassOverrides: [
      {
        subclassId: "the_void_subclass_order_of_the_lycan",
        label: "Order of the Lycan",
        traits: { agility: 1, strength: 2, finesse: -1, instinct: 1, presence: 0, knowledge: 0 },
        equipment: {
          primaryWeaponId: "core_weapon_battleaxe",
          armorId: "core_armor_leather_armor",
        },
      },
    ],
  }),
];
