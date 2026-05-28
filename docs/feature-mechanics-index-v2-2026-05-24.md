# Feature Mechanics Index v2 - 2026-05-24

This revised index merges:
- `feature-mechanics-index-2026-05-24.md`
- `mechanics-index-gaps-2026-05-24.md`
- `mechanics-gap-analysis-2026-05-24.md`

Scope:
- Current app data from `public/data/srd-core.json`.
- Current Void playtest app data from `src/data/voidPlaytest`.
- Broader reference data from `Reference Data/daggerheart-data-main/core` and `Reference Data/daggerheart-data-main/the_void`.
- Mechanics confirmed from `Reference Data/Additional-Sheets-Daggerheart-May212025.pdf`.

This is a mechanics catalog for cleanup and future automation planning. It is not an instruction to silently auto-apply every effect.

## Automation Labels

| Label | Meaning |
| --- | --- |
| `safe-static` | Deterministic once the source is selected. |
| `conditional` | Depends on equipment, domain count, scene state, target state, rest timing, or another live condition. |
| `choice` | Player must choose one or more options before the effect can be applied. |
| `tracker` | Suggests a token/resource tracker. |
| `roll-hook` | Should be exposed near a roll result, attack, damage roll, or defense prompt. |
| `reference-only` | Core rule or system mechanic, not a selectable content entry. |

Roll moments:
- `roll:before`: activated before dice are rolled.
- `roll:after`: activated after a roll result is known.
- `roll:damage`: activated during or after a damage roll.
- `conditional`: state-based, with no single roll timing.
- `safe-static`: applies at character creation or when a source is equipped/selected.

## Core Rules

These are rule-level mechanics from the additional sheets PDF and SRD data. They should exist in the index even when they are not content entries.

| Mechanic | Roll moment | Hook | Automation note |
| --- | --- | --- | --- |
| Advantage / Disadvantage | `roll:before` | Advantage adds a d6; disadvantage subtracts a d6. If multiple advantage dice apply, use only the highest. | `reference-only`; roll UI should support one effective advantage/disadvantage die. |
| Help an Ally | `roll:before` | Spend Hope and roll d6 advantage die for ally's roll. | `reference-only`; ally roll support. |
| Group Action | `roll:after` | Leader rolls action; others roll reactions. Leader gets +1 per success and -1 per failure. | `reference-only`; multi-character roll support. |
| Tag Team Roll | `roll:after` | Both PCs spend 3 Hope, both roll, choose one result; Hope gives all PCs Hope, Fear gives GM Fear per PC; successful attacks add both damage rolls. | `reference-only`; already referenced by some card hooks. |
| Critical Success Damage | `roll:damage` | Start with max possible damage dice value, then roll and add damage dice again. | `reference-only`; damage display support. |
| Conditions | `conditional` | Vulnerable, Restrained, Hidden, Direct Damage, and other named states modify roll/armor rules. | `reference-only`; condition tracker needed before many hooks can automate. |
| Short Rest / Long Rest | `conditional` | Rest moves reset or advance many mechanics; GM Fear changes on rest. | `reference-only`; rest reset support. |

## Additions and Persistent Bonuses

Includes static slots, traits, thresholds, armor score, Experience bonuses, and long-lived bonuses.

| Source | Entry | Roll moment | Hook | Automation note |
| --- | --- | --- | --- | --- |
| SRD Core | `core_ancestry_clank` - Clank | `safe-static` | Purposeful: choose an Experience and gain permanent +1 to it. | `choice`; needs selected Experience. |
| SRD Core | `core_ancestry_giant` - Giant | `safe-static` | Endurance: +1 Hit Point slot at character creation. | `safe-static`; max HP +1. |
| SRD Core | `core_ancestry_human` - Human | `safe-static` | High Stamina: +1 Stress slot at character creation. | `safe-static`; already in `calculationHints`. |
| SRD Core | `core_ancestry_simiah` - Simiah | `safe-static` | Nimble: permanent +1 Evasion at character creation. | `safe-static`; candidate static hint. |
| SRD Core | `core_domain_card_armorer` - Armorer | `conditional` | While wearing armor, +1 Armor Score. | `conditional`; already in `calculationHints`. |
| SRD Core | `core_domain_card_blade_touched` - Blade-Touched | `conditional` | With 4+ Blade cards: +2 attack rolls, +4 Severe threshold. | `conditional`; Severe already in `calculationHints`; attack bonus remains manual. |
| SRD Core | `core_domain_card_bone_touched` - Bone-Touched | `conditional` | With 4+ Bone cards: +1 Agility and defensive Hope spend. | `conditional`; trait and roll-hook support needed. |
| SRD Core | `core_domain_card_fortified_armor` - Fortified Armor | `conditional` | While wearing armor, +2 damage thresholds. | `conditional`; already in `calculationHints`. |
| SRD Core | `core_domain_card_master_of_the_craft` - Master of the Craft | `safe-static` | Permanent +2 to two Experiences or +3 to one Experience. | `choice`; needs selected Experience(s). |
| SRD Core | `core_domain_card_splendor_touched` - Splendor-Touched | `conditional` | With 4+ Splendor cards: +3 Severe threshold. | `conditional`; already in `calculationHints`. |
| SRD Core | `core_domain_card_valor_touched` - Valor-Touched | `conditional` | With 4+ Valor cards: +1 Armor Score. | `conditional`; already in `calculationHints`. |
| SRD Core | `core_domain_card_vitality` - Vitality | `safe-static` | Permanently choose two: +1 Stress slot, +1 HP slot, +2 thresholds. | `choice`; intentionally manual until choices are recorded. |
| SRD Core | `core_subclass_school_of_war:foundation:battlemage` - Battlemage | `safe-static` | +1 Hit Point slot. | `safe-static`; already in `calculationHints`. |
| SRD Core | `core_subclass_stalwart:foundation:unwavering` - Unwavering | `safe-static` | Permanent +1 damage thresholds. | `safe-static`; already in `calculationHints`. |
| SRD Core | `core_subclass_stalwart:specialization:unrelenting` - Unrelenting | `safe-static` | Permanent +2 damage thresholds. | `safe-static`; already in `calculationHints`. |
| SRD Core | `core_subclass_stalwart:mastery:undaunted` - Undaunted | `safe-static` | Permanent +3 damage thresholds. | `safe-static`; already in `calculationHints`. |
| SRD Core | `core_subclass_vengeance:foundation:at-ease` - At Ease | `safe-static` | +1 Stress slot. | `safe-static`; already in `calculationHints`. |
| SRD Core | `core_subclass_nightwalker:mastery:fleeting-shadow` - Fleeting Shadow | `safe-static` | Permanent +1 Evasion. | `safe-static`; already in `calculationHints`. |
| SRD Core | `core_subclass_winged_sentinel:mastery:ascendant` - Ascendant | `safe-static` | Permanent +4 Severe threshold. | `safe-static`; already in `calculationHints`. |
| Void Playtest | `the_void_ancestry_earthkin:feature:stoneskin` - Stoneskin | `safe-static` | +1 Armor Score and +1 to all damage thresholds. | `safe-static`; high-priority Void ancestry hint. |
| Void Playtest | `the_void_ancestry_skykin:feature:eye-of-the-storm` - Eye of the Storm | `roll:before` | Spend 2 Hope: +1 Evasion until next Severe damage or reuse. | `conditional`; temporary buff. |
| Void Playtest | `the_void_ancestry_emberkin:feature:ignition` - Ignition | `roll:damage` | Mark Stress: primary weapon gains +1d6 damage until scene end. | `roll-hook`; scene buff. |
| Void Playtest | `the_void_class_brawler:feature:i-am-the-weapon` - I Am the Weapon | `conditional` | No equipped weapons: +1 Evasion and unarmed strike profile. | `conditional`; equipment-state dependent. |
| Void Playtest | `the_void_subclass_juggernaut:specialization:rugged` - Rugged | `safe-static` | Permanent +3 Severe damage threshold. | `safe-static`; candidate Void threshold hint. |
| Void Playtest | `the_void_subclass_hedge:mastery:circle-of-power` - Circle of Power | `roll:before` | While active: +4 thresholds, +2 attack rolls, +1 Evasion. | `tracker`; token aura with explicit bonus details. |
| Void Playtest | `the_void_subclass_moon:specialization:moonbeam` - Moonbeam | `conditional` | Moonlight grants +1 Spellcast Rolls and advantage on illusion checks. | `conditional`; scene area. |
| Void Playtest | `the_void_subclass_moon:mastery:lunar-phases` - Lunar Phases | `conditional` | Phase options include +2 damage rolls, +2 thresholds, or +1 Evasion. | `choice`; depends on phase. |

## Core Armor Mechanics

Base armor thresholds/scores are not repeated here. This table tracks named/special armor mechanics and penalties.

| Entry | Roll moment | Hook | Automation note |
| --- | --- | --- | --- |
| `core_armor_bellamoi_fine_armor` - Bellamoi Fine Armor | `safe-static` | +1 Presence. | `safe-static`; equipment-derived trait bonus. |
| `core_armor_channeling_armor` - Channeling Armor | `safe-static` | +1 Spellcast Rolls. | `conditional`; applies to Spellcast Rolls only. |
| `core_armor_elundrian_chain_armor` - Elundrian Chain Armor | `roll:after` | Reduce incoming magic damage by Armor Score before thresholds. | `roll-hook`; damage intake. |
| `core_armor_harrowbone_armor` - Harrowbone Armor | `roll:after` | Before marking last Armor Slot, roll d6; on 6 reduce severity without marking. | `roll-hook`; probabilistic mitigation. |
| `core_armor_irontree_breastplate_armor` - Irontree Breastplate Armor | `conditional` | Mark last Armor Slot: +2 thresholds until at least one slot is cleared. | `conditional`; tracker state. |
| `core_armor_runetan_floating_armor` - Runetan Floating Armor | `roll:before` | Mark Armor Slot to give incoming attack disadvantage. | `roll-hook`; defensive prompt. |
| `core_armor_tyris_soft_armor` - Tyris Soft Armor | `conditional` | +2 rolls to move silently. | `conditional`; situational roll reminder. |
| `core_armor_rosewild_armor` - Rosewild Armor | `roll:after` | When spending Hope, can mark Armor Slot instead. | `roll-hook`; resource substitution. |
| `core_armor_dragonscale_armor` - Dragonscale Armor | `conditional` | Once per short rest, when last HP would be marked, mark Stress instead. | `conditional`; death-adjacent mitigation. |
| `core_armor_spiked_plate_armor` - Spiked Plate Armor | `roll:damage` | Successful Melee attack adds d4 to damage. | `roll-hook`; damage addition. |
| `core_armor_emberwoven_armor` - Emberwoven Armor | `conditional` | Adversary attacking within Melee marks Stress. | `conditional`; melee counterpassive. |
| `core_armor_full_fortified_armor` - Full Fortified Armor | `roll:after` | Marking Armor Slot reduces severity by two thresholds. | `roll-hook`; modified armor slot behavior. |
| `core_armor_dunamis_silkchain` - Dunamis Silkchain | `roll:after` | Mark Armor Slot, roll d4, add result to Evasion against incoming attack. | `roll-hook`; reactive Evasion. |
| `core_armor_savior_chainmail` - Savior Chainmail | `safe-static` | -1 to all character traits and Evasion. | `safe-static`; penalty. |
| `core_armor_runes_of_fortification` - Runes of Fortification | `conditional` | Each time you mark Armor Slot, also mark Stress. | `conditional`; penalty reminder. |

## Reroll and Result-Change Abilities

| Source | Entry | Roll moment | Hook | Automation note |
| --- | --- | --- | --- | --- |
| SRD Core | `core_ancestry_faerie` - Faerie | `roll:after` | Spend 3 Hope to reroll Duality Dice for ally in Close. | `roll-hook`; ally/context dependent. |
| SRD Core | `core_ancestry_goblin` - Goblin | `roll:after` | Once per rest, mark Stress to force adversary attack reroll. | `roll-hook`; defensive reminder. |
| SRD Core | `core_ancestry_halfling` - Halfling | `roll:after` | Hope Die result 1 can be rerolled. | `roll-hook`; direct roll result hook. |
| SRD Core | `core_ancestry_human` - Human | `roll:after` | Failed roll using Experience can mark Stress to reroll. | `roll-hook`; requires Experience usage. |
| SRD Core | `core_ancestry_infernis` - Infernis | `roll:after` | Roll with Fear can become Hope by marking 2 Stress. | `roll-hook`; outcome conversion. |
| SRD Core | `core_ancestry_katari` - Katari | `roll:after` | Agility Roll can spend 2 Hope to reroll Hope Die. | `roll-hook`; trait-specific. |
| SRD Core | `core_class_ranger:feature:rangers-focus` - Ranger's Focus | `roll:after` | End focus to reroll Duality Dice against focus target. | `roll-hook`; target-state dependent. |
| SRD Core | `core_class_sorcerer:hope:volatile-magic` - Volatile Magic | `roll:damage` | Spend 3 Hope to reroll magic damage dice. | `roll-hook`. |
| SRD Core | `core_class_wizard:feature:strange-patterns` - Strange Patterns | `roll:after` | Chosen 1-12 result on Duality Die gives Hope or clears Stress. | `roll-hook`; player-chosen number. |
| SRD Core | `core_class_wizard:hope:not-this-time` - Not This Time | `roll:after` | Spend 3 Hope to force adversary attack or damage reroll. | `roll-hook`. |
| SRD Core | `core_domain_card_arcana_touched` - Arcana-Touched | `roll:after` | Once per rest, switch Hope and Fear Dice. | `roll-hook`; outcome manipulation. |
| SRD Core | `core_domain_card_bone_touched` - Bone-Touched | `roll:after` | Spend 3 Hope to cause successful attack against you to fail. | `roll-hook`; defensive result change. |
| SRD Core | `core_domain_card_endless_charisma` - Endless Charisma | `roll:after` | Spend Hope to reroll Hope or Fear Die on social action roll. | `roll-hook`. |
| SRD Core | `core_domain_card_forager` - Forager | `conditional` | Luck charm option rerolls any die. | `choice`; generated consumable option. |
| SRD Core | `core_domain_card_not_good_enough` - Not Good Enough | `roll:damage` | Reroll 1s or 2s on damage dice. | `roll-hook`. |
| SRD Core | `core_domain_card_reassurance` - Reassurance | `roll:after` | Ally can reroll dice. | `roll-hook`; ally target. |
| SRD Core | `core_domain_card_stealth_expertise` - Stealth Expertise | `roll:after` | Convert Fear to Hope on stealth movement rolls. | `roll-hook`; situation-specific. |
| SRD Core | `core_domain_card_support_tank` - Support Tank | `roll:after` | Spend 2 Hope to let ally reroll Hope or Fear Die. | `roll-hook`. |
| SRD Core | `core_subclass_call_of_the_slayer:specialization:weapon-specialist` - Weapon Specialist | `roll:after` | Reroll 1s on Slayer Dice once per long rest. | `roll-hook`; resource-specific. |
| SRD Core | `core_weapon_axe_of_fortunis` - Axe of Fortunis | `roll:after` | Failed attack can mark Stress to reroll. | `roll-hook`; equipment-dependent. |
| Void Playtest | `the_void_ancestry_aetheris:feature:hallowed-aura` - Hallowed Aura | `roll:after` | Once per rest, change ally's Close Fear roll to Hope. | `roll-hook`; ally outcome conversion. |
| Void Playtest | `the_void_ancestry_gnome:feature:nimble-fingers` - Nimble Fingers | `roll:after` | Finesse Roll can spend 2 Hope to reroll Hope Die. | `roll-hook`; trait-specific. |
| Void Playtest | `the_void_community_duneborne:feature:oasis` - Oasis | `roll:after` | During short rest, reroll a die used for downtime action. | `roll-hook`; rest-time. |
| Void Playtest | `the_void_community_freeborne:feature:unbound` - Unbound | `roll:after` | Once per session, change Fear action roll to Hope. | `roll-hook`; outcome conversion. |
| Void Playtest | `the_void_class_witch:hope:witchs-charm` - Witch's Charm | `roll:after` | Spend 3 Hope to change failure to success with Fear. | `roll-hook`; outcome conversion. |
| Void Playtest | `the_void_subclass_executioners_guild:mastery:true-strike` - True Strike | `roll:after` | Once per long rest, failed attack can spend Hope to succeed. | `roll-hook`; outcome conversion. |
| Void Playtest | `the_void_subclass_pact_of_the_wrathful:foundation:herald-of-death` - Herald of Death | `roll:after` | Spend Favor to reroll failed attack; mark Stress if it fails again. | `roll-hook`; requires Favor tracker. |
| Void Playtest | `the_void_subclass_pact_of_the_wrathful:mastery:fearsome-attack` - Fearsome Attack | `roll:damage` | Spend Favor to reroll damage dice repeatedly. | `roll-hook`; requires Favor tracker. |

## Trackers and Resource Pools

| Source | Entry | Roll moment | Hook | Automation note |
| --- | --- | --- | --- | --- |
| SRD Core | `core_class_bard:feature:rally` - Rally | `conditional` | Once per session, grant Rally Dice; spend on action/reaction/damage/clear rolls. | `tracker`; already in `calculationHints`. |
| SRD Core | `core_class_guardian:feature:unstoppable` - Unstoppable | `roll:damage` | Unstoppable Die increments after damage rolls that mark HP; add value to damage; reduce physical severity. | `tracker`; live die value. |
| SRD Core | `core_class_seraph:feature:prayer-dice` - Prayer Dice | `conditional` | Roll Prayer Dice at session start; spend dice for roll, healing, or damage mitigation. | `tracker`; already in `calculationHints`. |
| SRD Core | `core_community_seaborne` - Seaborne | `roll:after` | Roll with Fear places Tide token; spend tokens for +1 each on action roll. | `tracker`; roll-result resource. |
| SRD Core | `core_domain_card_fane_of_the_wilds` - Fane of the Wilds | `roll:before` | Tokens equal Sage cards; spend after Spellcast Roll for +1 each. | `tracker`. |
| SRD Core | `core_domain_card_flight` - Flight | `conditional` | Place tokens equal Agility; spend on action rolls while flying. | `tracker`; flight duration. |
| SRD Core | `core_domain_card_inspirational_words` - Inspirational Words | `conditional` | Tokens equal Presence; spend token to give ally benefits. | `tracker`. |
| SRD Core | `core_domain_card_invisibility` - Invisibility | `conditional` | Tokens equal Spellcast trait; spend when invisible target acts. | `tracker`; duration. |
| SRD Core | `core_domain_card_never_upstaged` - Never Upstaged | `roll:damage` | Store tokens equal HP marked; next successful attack gains +5 damage per token. | `tracker`; attack spender. |
| SRD Core | `core_domain_card_restoration` - Restoration | `conditional` | Tokens equal Spellcast trait; spend to clear HP or Stress. | `tracker`. |
| SRD Core | `core_domain_card_spellcharge` - Spellcharge | `roll:before` | Store magic-damage tokens; spend tokens to add d6s to Spellcast Roll. | `tracker`. |
| SRD Core | `core_domain_card_strategic_approach` - Strategic Approach | `roll:before` | Tokens equal Knowledge; spend token to add Knowledge to first Close-range attack. | `tracker`. |
| SRD Core | `core_domain_card_thorn_skin` - Thorn Skin | `roll:after` | Tokens equal Spellcast trait; spend when damaged to roll d6s. | `tracker`. |
| SRD Core | `core_domain_card_twilight_toll` - Twilight Toll | `roll:damage` | Place target tokens; spend tokens to add d12s to damage. | `tracker`; target-specific. |
| SRD Core | `core_domain_card_unleash_chaos` - Unleash Chaos | `roll:before` | Tokens equal Spellcast trait; spend on Spellcast Roll. | `tracker`. |
| SRD Core | `core_subclass_call_of_the_slayer:foundation:slayer` - Slayer | `roll:after` | On roll with Hope, store Slayer Die instead of gaining Hope. | `tracker`; roll-result choice. |
| Void Playtest | `the_void_class_warlock:feature:favor` - Favor | `conditional` | Start with 3 Favor; rest tithe gains Favor equal Presence. | `tracker`; already in `calculationHints`. |
| Void Playtest | `the_void_class_warlock:hope:patrons-boon` - Patron's Boon | `conditional` | Spend 3 Hope to gain 1d4 Favor. | `tracker`; modifies Favor. |
| Void Playtest | `the_void_community_hearthborne:feature:close-knit` - Close-Knit | `conditional` | Once per long rest, spend Hope to give ally same Hope. | `tracker`; Hope transfer. |
| Void Playtest | `the_void_community_reborne:feature:found-family` - Found Family | `conditional` | Spend Hope to use ally's community ability; ally gains Hope. | `choice`; ally-dependent. |
| Void Playtest | `the_void_subclass_poisoners_guild:foundation:toxic-concoctions` - Toxic Concoctions | `conditional` | Mark Stress to add 1d4+1 poison tokens. | `tracker`. |
| Void Playtest | `the_void_subclass_poisoners_guild:foundation:envenomate` - Envenomate | `roll:after` | Spend poison token on successful weapon attack. | `tracker`; attack spender. |
| Void Playtest | `the_void_subclass_poisoners_guild:mastery:twin-fang` - Twin Fang | `roll:after` | Spend additional poison token for second poison effect. | `tracker`. |
| Void Playtest | `the_void_subclass_martial_artist:foundation:focus` - Focus | `conditional` | Rest roll creates Focus tokens; spend Focus for stances. | `tracker`. |
| Void Playtest | `the_void_subclass_hedge:specialization:walk-between-worlds` - Walk Between Worlds | `conditional` | Tokens equal Spellcast trait; remove as spirits answer. | `tracker`; utility. |
| Void Playtest | `the_void_subclass_hedge:foundation:tethered-talisman` - Tethered Talisman | `conditional` | Once per rest, imbue item; holder can reduce HP marks by 1. | `tracker`; single-use mitigation. |
| Void Playtest | `the_void_domain_card_umbral_veil` - Umbral Veil | `roll:after` | Roll with Fear, spend Hope to create defensive tokens. | `tracker`; roll-result hook. |
| Void Playtest | `the_void_domain_card_dark_army` - Dark Army | `roll:damage` | 8 fiend tokens; spend for +1d8 damage or -1d8 incoming damage. | `tracker`; attack/defense spender. |

## Attack, Damage, and Defense Roll Hooks

| Source | Entry | Roll moment | Hook | Automation note |
| --- | --- | --- | --- | --- |
| SRD Core | `core_class_druid:feature:beastform` - Beastform | `roll:before` | Mark Stress to transform; gain Beastform attack trait, Evasion bonus, and features. | `conditional`; complex transform state. |
| SRD Core | `core_class_rogue:feature:cloaked` - Cloaked | `conditional` | Enhanced Hidden behavior while stationary; ends on attack or line-of-sight move. | `conditional`; condition tracking. |
| SRD Core | `core_class_rogue:feature:sneak-attack` - Sneak Attack | `roll:damage` | Cloaked or ally in Melee of target: add d6s equal tier. | `roll-hook`; situational damage. |
| SRD Core | `core_class_sorcerer:feature:channel-raw-power` - Channel Raw Power | `roll:damage` | Once per long rest, vault card to gain Hope equal level or add damage equal twice level. | `choice`; PDF wording confirms choice. |
| SRD Core | `core_class_warrior:feature:attack-of-opportunity` - Attack of Opportunity | `roll:after` | Reaction when adversary leaves Melee; success stops, damages, or follows; crit chooses two. | `roll-hook`; adversary movement trigger. |
| SRD Core | `core_class_warrior:feature:combat-training` - Combat Training | `roll:damage` | Physical damage gains bonus equal to level. | `roll-hook`; damage reminder. |
| SRD Core | `core_class_warrior:hope:no-mercy` - No Mercy | `roll:before` | Spend 3 Hope for +1 attack rolls until next rest. | `conditional`; temporary modifier. |
| SRD Core | `core_domain_card_body_basher` - Body Basher | `roll:damage` | Successful Melee weapon attack gains damage bonus equal Strength. | `roll-hook`. |
| SRD Core | `core_domain_card_boost` - Boost | `roll:before` | Advantage on attack and add d10 to damage. | `roll-hook`. |
| SRD Core | `core_domain_card_conjured_steeds` - Conjured Steeds | `conditional` | Riders gain -2 attack rolls and +2 damage rolls. | `conditional`; mounted state. |
| SRD Core | `core_domain_card_cruel_precision` - Cruel Precision | `roll:damage` | Successful weapon attack gains damage bonus equal Finesse or Agility. | `choice`; trait choice. |
| SRD Core | `core_domain_card_deft_maneuvers` - Deft Maneuvers | `roll:before` | Sprint into Melee and immediately attack for +1 attack. | `conditional`; movement-dependent. |
| SRD Core | `core_domain_card_forceful_push` - Forceful Push | `roll:damage` | Success with Hope adds d6 damage. | `roll-hook`. |
| SRD Core | `core_domain_card_forest_sprites` - Forest Sprites | `conditional` | Allies gain +3 attack rolls against enemies near sprite. | `conditional`; scene-position dependent. |
| SRD Core | `core_domain_card_frenzy` - Frenzy | `conditional` | +10 damage rolls and +8 Severe threshold while Frenzied. | `conditional`; form state. |
| SRD Core | `core_domain_card_midnight_touched` - Midnight-Touched | `roll:damage` | Successful attack can mark Stress to add Fear Die to damage. | `roll-hook`. |
| SRD Core | `core_domain_card_natural_familiar` - Natural Familiar | `roll:damage` | If target is in familiar's Melee, add d6 damage. | `conditional`; position-dependent. |
| SRD Core | `core_domain_card_rage_up` - Rage Up | `roll:before` | Before attack, mark Stress for damage bonus equal twice Strength; can use twice. | `roll-hook`. |
| SRD Core | `core_subclass_syndicate:specialization:contacts-everywhere` - Contacts Everywhere | `roll:after` | Contact can add +3 to Hope/Fear Die or add 2d8 damage. | `choice`; contact effect. |
| SRD Core | `core_subclass_wordsmith:foundation:heart-of-a-poet` - Heart of a Poet | `roll:before` | Spend Hope to add d4 to certain social rolls. | `conditional`; social context. |
| Void Playtest | `the_void_class_assassin:feature:marked-for-death` - Marked for Death | `roll:damage` | Attacks against marked target gain +1d4 per tier. | `conditional`; target state. |
| Void Playtest | `the_void_class_assassin:feature:get-in-get-out` - Get In & Get Out | `roll:before` | Spend Hope for GM path; next roll using path has advantage. | `conditional`; narrative path. |
| Void Playtest | `the_void_class_brawler:feature:combo-strikes` - Combo Strikes | `roll:damage` | Mark Stress after damage roll; chain Combo Die until lower result stops. | `roll-hook`; complex chained damage. |
| Void Playtest | `the_void_class_brawler:hope:staggering-strike` - Staggering Strike | `roll:after` | Spend 3 Hope on successful attack; target is Staggered and marks Stress. | `roll-hook`; applies condition. |
| Void Playtest | `the_void_class_warlock:feature:warlock-patron` - Warlock Patron | `roll:before` | Spend Favor before related roll to add patron sphere value. | `tracker`; Favor spend plus sphere value. |
| Void Playtest | `the_void_class_witch:feature:hex` - Hex | `roll:before` | Mark Stress to Hex; action and damage rolls vs Hexed gain tier bonus. | `conditional`; target-state tracking. |
| Void Playtest | `the_void_subclass_executioners_guild:foundation:first-strike` - First Strike | `roll:damage` | First successful attack in a scene doubles damage. | `conditional`; scene-first attack. |
| Void Playtest | `the_void_subclass_executioners_guild:foundation:ambush` - Ambush | `conditional` | Marked for Death dice upgrade d4 to d6. | `conditional`; modifies class feature. |
| Void Playtest | `the_void_subclass_executioners_guild:specialization:death-strike` - Death Strike | `roll:damage` | Severe damage hit can mark Stress to force extra HP mark. | `roll-hook`; threshold trigger. |
| Void Playtest | `the_void_subclass_executioners_guild:specialization:scorpions-poise` - Scorpion's Poise | `roll:after` | +2 Evasion against attacks from Marked for Death creature. | `conditional`; target-state defense. |
| Void Playtest | `the_void_subclass_executioners_guild:mastery:backstab` - Backstab | `conditional` | Marked for Death dice upgrade d6 to d8. | `conditional`; modifies class feature. |
| Void Playtest | `the_void_subclass_juggernaut:foundation:powerhouse` - Powerhouse | `roll:before` | Unarmed d8 to d10; mark Stress to target two creatures with one attack. | `conditional`; upgrade plus multi-target. |
| Void Playtest | `the_void_subclass_juggernaut:foundation:overwhelm` - Overwhelm | `roll:after` | Successful attack plus Hope: target marks Stress or is thrown. | `choice`; attack result. |
| Void Playtest | `the_void_subclass_juggernaut:specialization:eye-for-an-eye` - Eye for an Eye | `roll:after` | Mark 2+ HP from Melee attack; attacker Reaction Roll or marks same HP once/rest. | `roll-hook`; counter trigger. |
| Void Playtest | `the_void_subclass_juggernaut:mastery:pummeljoy` - Pummeljoy | `roll:after` | Critical Melee attack: gain extra Hope, clear extra Stress, +1 Proficiency for attack. | `roll-hook`; crit bundle. |
| Void Playtest | `the_void_subclass_martial_artist:specialization:keen-defenses` - Keen Defenses | `roll:before` | Spend Focus to give incoming attack disadvantage. | `tracker`; defensive Focus spend. |
| Void Playtest | `the_void_subclass_martial_artist:specialization:spirit-blast` - Spirit Blast | `roll:before` | Spend Focus for Instinct Roll, d20+3 magic damage; extra Focus for Vulnerable. | `tracker`; attack option. |
| Void Playtest | `the_void_subclass_pact_of_the_endless:foundation:patrons-mantle` - Patron's Mantle | `conditional` | Aura lets you spend Favor instead of Armor Slot and adds intimidation bonus. | `conditional`; Favor substitution. |
| Void Playtest | `the_void_subclass_pact_of_the_endless:specialization:draining-invocation` - Draining Invocation | `roll:before` | Spend Favor to make attacker use d12 instead of d20; attacker marks Stress. | `tracker`; defensive roll manipulation. |
| Void Playtest | `the_void_subclass_pact_of_the_endless:mastery:draining-bane` - Draining Bane | `roll:before` | Spend 2 Favor to Drain creature; d12 attack rolls, target Stress, you clear Stress. | `tracker`; upgraded defensive control. |
| Void Playtest | `the_void_subclass_pact_of_the_wrathful:foundation:favored-weapon` - Favored Weapon | `roll:damage` | Spend Favor on successful imbued attack for +1d6 damage per Favor. | `tracker`; damage spender. |
| Void Playtest | `the_void_subclass_pact_of_the_wrathful:specialization:menacing-reach` - Menacing Reach | `conditional` | Mark extra Stress while imbuing weapon to increase range one step. | `conditional`; modifies Favored Weapon. |
| Void Playtest | `the_void_subclass_hedge:specialization:enhanced-hex` - Enhanced Hex | `roll:damage` | Attacks against Hexed creatures gain damage bonus equal Proficiency. | `conditional`; Hex state. |
| Void Playtest | `the_void_subclass_moon:foundation:nights-glamour` - Night's Glamour | `roll:before` | Glamour grants disguise or advantage on Presence Rolls using appearance. | `conditional`; form state. |
| Void Playtest | `the_void_subclass_order_of_the_lycan:foundation:control-the-beast` - Control the Beast | `roll:before` | Wolf Form bonus die applies to Agility and Strength Action Rolls. | `conditional`; form state. |
| Void Playtest | `the_void_domain_card_hideous_retribution` - Hideous Retribution | `roll:after` | Ally in Close takes damage; Spellcast Reaction Roll, mark Stress to deal d6 magic. | `roll-hook`; reaction. |
| Void Playtest | `the_void_domain_card_voice_of_dread` - Voice of Dread | `roll:after` | Spellcast success makes target mark Stress and Vulnerable. | `roll-hook`; applies condition. |
| Void Playtest | `the_void_domain_card_summon_horror` - Summon Horror | `roll:after` | Success plus Hope deals d10 magic; target Reaction Roll or marks 1d4 Stress. | `roll-hook`; dual effect. |
| Void Playtest | `the_void_domain_card_jump_scare` - Jump Scare | `roll:after` | Magic damage can mark Stress to teleport and make target Vulnerable. | `roll-hook`. |
| Void Playtest | `the_void_domain_card_darkfire` - Darkfire | `roll:after` | Area Spellcast; spend Hope per success; targets roll reaction for full/half damage. | `roll-hook`. |
| Void Playtest | `the_void_domain_card_damnation` - Damnation | `roll:damage` | On success, mark Stress to roll equal d20s for magic damage. | `roll-hook`; Stress-scaled damage. |

## Core Weapon Mechanics

| Entry | Roll moment | Hook | Automation note |
| --- | --- | --- | --- |
| `core_weapon_broadsword` and variants | `safe-static` | +1 attack rolls. | `safe-static`; weapon profile modifier. |
| `core_weapon_knuckle_blades` / `core_weapon_yutari_bloodbow` / `core_weapon_talon_blades` | `roll:damage` | Max value on damage die rolls another damage die. | `roll-hook`; damage cascade. |
| `core_weapon_greatsword` and variants | `roll:damage` | Successful attack rolls additional damage die and discards lowest; also -1 Evasion. | `roll-hook` plus `safe-static` penalty. |
| `core_weapon_meridian_cutlass` | `roll:before` | Advantage if no other creatures are Close to target. | `conditional`; positioning. |
| `core_weapon_parrying_dagger` | `roll:after` | When attacked, roll weapon dice; matching attacker dice are discarded. | `roll-hook`; reactive defense. |
| `core_weapon_buckler` | `roll:after` | Mark Armor Slot for Evasion bonus equal remaining available slots. | `roll-hook`; slot-count dependent. |
| `core_weapon_braveshield` | `roll:after` | Mark Armor Slot to protect self and all Melee allies from same attack. | `conditional`; area protection. |
| `core_weapon_primer_shard` | `roll:after` | Successful attack makes next attack against same target auto-succeed. | `conditional`; target-state follow-up. |
| `core_weapon_hammer_of_wrath` | `roll:before` | Mark Stress before attack to use d20 as damage die. | `roll-hook`. |
| `core_weapon_ricochet_axes` | `roll:before` | Mark Stress to hit that many targets with one attack roll. | `roll-hook`; Stress-scaled multi-target. |
| `core_weapon_firestaff` | `roll:damage` | Damage die result 6 makes target mark Stress. | `roll-hook`. |
| `core_weapon_curved_dagger` | `roll:damage` | Damage die result 1 deals 8 instead. | `roll-hook`. |
| `core_weapon_hammer_of_exota` | `roll:damage` | Successful Melee attack forces other nearby adversaries to react or take half damage. | `roll-hook`; AoE splash. |
| `core_weapon_urok_broadsword` | `roll:damage` | Severe damage makes target mark additional HP. | `roll-hook`; threshold trigger. |
| `core_weapon_spiked_shield` | `safe-static` | +1 Armor Score and adds primary weapon damage bonus in Melee. | `conditional`; equipment profile. |
| `core_weapon_powered_gauntlet` | `roll:before` | Mark Stress for +1 Proficiency on primary weapon attack. | `roll-hook`. |
| `core_weapon_siphoning_gauntlets` | `roll:after` | Successful attack roll d6; on 6 clear HP or Stress. | `roll-hook`. |
| `core_weapon_midas_scythe` | `roll:damage` | Spend handful of gold for +1 Proficiency on damage roll. | `tracker`; gold resource. |
| `core_weapon_fusion_gloves` | `roll:damage` | Damage bonus equal level. | `roll-hook`; level scaling. |
| `core_weapon_flickerfly_blade` | `roll:damage` | Damage bonus equal Agility. | `roll-hook`; trait scaling. |

## Core Consumables

Straightforward HP/Stress healing consumables are omitted unless they modify rolls, resources, or conditions.

| Entry | Roll moment | Hook | Automation note |
| --- | --- | --- | --- |
| Trait potions: Stride, Bolster, Control, Attune, Charm, Enlighten | `roll:before` | +1 to next roll of matching trait. | `roll-hook`; one-use. |
| Major trait potions | `conditional` | +1 to matching trait until next rest. | `conditional`; temporary trait buff. |
| `core_consumable_grindletooth_venom` / improved / Redthorn variants | `roll:damage` | Add d6/d8/d12 to next physical damage roll. | `roll-hook`; one-use damage. |
| `core_consumable_mythic_dust` | `roll:damage` | Add d12 to next magic damage roll. | `roll-hook`. |
| `core_consumable_vial_of_darksmoke` | `roll:after` | When attacked, roll d6s equal Agility and add highest to Evasion. | `roll-hook`; reactive defense. |
| `core_consumable_armor_stitcher` | `conditional` | Spend Hope to clear Armor Slots one-for-one. | `tracker`; Hope-to-slot. |
| `core_consumable_hopehold_flare` | `roll:after` | Allies in Close roll d6 when spending Hope; on 6 effect happens free. | `roll-hook`; scene-wide Hope economy. |
| `core_consumable_shrinking_potion` | `conditional` | +2 Agility, -1 Proficiency while small. | `conditional`; form modifier. |
| `core_consumable_growing_potion` | `conditional` | +2 Strength, +1 Proficiency while large. | `conditional`; form modifier. |
| `core_consumable_blinding_orb` | `roll:before` | Close targets become Vulnerable until HP marked. | `conditional`; area condition. |
| `core_consumable_mirror_of_marigold` | `roll:after` | Spend Hope when taking damage to negate it entirely; one use. | `roll-hook`. |
| `core_consumable_snap_powder` | `conditional` | Mark Stress and clear HP simultaneously. | `conditional`; paired cost/benefit. |
| `core_consumable_potion_of_stability` | `conditional` | Take one additional downtime move. | `conditional`; rest enhancement. |

## Hope and Fear Outcome Hooks

| Source | Entry | Roll moment | Hook | Automation note |
| --- | --- | --- | --- | --- |
| SRD Core | `core_ancestry_infernis` - Infernis | `roll:after` | Roll with Fear can become Hope by marking 2 Stress. | `roll-hook`. |
| SRD Core | `core_community_seaborne` - Seaborne | `roll:after` | Roll with Fear places Tide token. | `tracker`. |
| SRD Core | `core_domain_card_banish` - Banish | `roll:after` | When PCs roll with Fear, banished target rolls reaction at lower Difficulty. | `roll-hook`; card state. |
| SRD Core | `core_domain_card_battle_cry` - Battle Cry | `conditional` | Ally attack advantage lasts until ally failure with Fear. | `roll-hook`; scene duration. |
| SRD Core | `core_domain_card_eclipse` - Eclipse | `roll:after` | Ally succeeds with Hope in shadow: target marks Stress. | `roll-hook`; area state. |
| SRD Core | `core_domain_card_encore` - Encore | `roll:after` | Spellcast succeeds with Fear: place card in vault. | `roll-hook`; loadout change. |
| SRD Core | `core_domain_card_final_words` - Final Words | `roll:after` | Success with Hope answers more questions than success with Fear. | `roll-hook`; outcome text. |
| SRD Core | `core_domain_card_hold_the_line` - Hold the Line | `conditional` | Effect lasts until movement, failure with Fear, or GM spends Fear. | `roll-hook`; duration tracking. |
| SRD Core | `core_domain_card_natures_tongue` - Nature's Tongue | `roll:after` | Roll with Fear can limit knowledge or add cost. | `roll-hook`; narrative reminder. |
| SRD Core | `core_domain_card_second_wind` - Second Wind | `roll:after` | Success with Hope also clears ally HP/Stress. | `roll-hook`. |
| SRD Core | `core_domain_card_signature_move` - Signature Move | `roll:before` | Use d20 as Hope Die; on success clear Stress. | `roll-hook`. |
| SRD Core | `core_domain_card_tactician` - Tactician | `roll:before` | Tag Team Roll can use d20 as Hope Die. | `roll-hook`. |
| SRD Core | `core_domain_card_thought_delver` - Thought Delver | `roll:after` | Roll with Fear may reveal mind reading. | `roll-hook`; narrative reminder. |
| SRD Core | `core_subclass_call_of_the_brave:foundation:courage` - Courage | `roll:after` | Fail with Fear: gain Hope. | `roll-hook`. |
| SRD Core | `core_subclass_nightwalker:mastery:vanishing-act` - Vanishing Act | `conditional` | Cloaked until roll with Fear or next rest. | `roll-hook`; duration. |
| SRD Core | `core_subclass_school_of_war:foundation:face-your-fear` - Face Your Fear | `roll:damage` | Succeed with Fear on attack: extra 1d10 magic damage. | `roll-hook`. |
| SRD Core | `core_subclass_winged_sentinel:specialization:ethereal-visage` - Ethereal Visage | `roll:after` | Succeed with Hope on Presence Roll: remove GM Fear instead of gaining Hope. | `choice`. |
| Void Playtest | `the_void_subclass_order_of_the_ghost_slayer:foundation:shadowed-grit` - Shadowed Grit | `roll:after` | GM gains Fear from Duality Dice: mark Stress to gain Hope. | `roll-hook`. |
| Void Playtest | `the_void_subclass_juggernaut:mastery:not-done-yet` - Not Done Yet | `roll:after` | Mark 2+ HP from an attack: gain Hope or clear Stress. | `choice`; damage-taken trigger. |
| Void Playtest | `the_void_subclass_martial_artist:mastery:limit-breaker` - Limit Breaker | `conditional` | Once per rest, perform impossible feat without rolling; gain Hope and clear Stress. | `conditional`; narrative feature. |
| Void Playtest | `the_void_subclass_pact_of_the_wrathful:specialization:diminish-myfoes` - Diminish MyFoes | `roll:after` | Succeed with Hope on action roll: spend Hope to make target mark Stress. | `roll-hook`. |
| Void Playtest | `the_void_domain_card_blighting_strike` - Blighting Strike | `roll:damage` | Succeed with Fear upgrades damage die. | `roll-hook`. |
| Void Playtest | `the_void_domain_card_siphon_essence` - Siphon Essence | `roll:damage` | Success with Fear grants +1 Proficiency for attack. | `roll-hook`. |
| Void Playtest | `the_void_domain_card_terrify` - Terrify | `roll:after` | Success with Fear makes target Vulnerable. | `roll-hook`. |
| Void Playtest | `the_void_domain_card_dread_touched` - Dread-Touched | `roll:after` | Succeed with Fear can prevent GM gaining Fear; also action roll can add GM Fear tokens. | `roll-hook`; GM Fear pool. |
| Void Playtest | `the_void_domain_card_eldritch_flesh` - Eldritch Flesh | `roll:after` | Roll with Fear can spend Hope to clear Armor Slot. | `roll-hook`. |
| Void Playtest | `the_void_domain_card_dire_strike` - Dire Strike | `roll:after` | Successful attack plus 2 Hope drains GM Fear per HP target marked. | `roll-hook`; GM Fear drain. |
| Void Playtest | `the_void_domain_card_savor_the_anguish` - Savor the Anguish | `roll:after` | Adversary marks Stress or takes Severe damage: spend Hope to clear Stress or remove GM Fear. | `choice`; reactive resource. |
| Void Playtest | `the_void_domain_card_invoke_torment` - Invoke Torment | `conditional` | Targets with all Stress marked take double damage; defeating them clears Stress. | `conditional`; target-state damage. |

## Advantage, Disadvantage, and Condition Hooks

| Source | Entry | Roll moment | Hook | Automation note |
| --- | --- | --- | --- | --- |
| Void Playtest | `the_void_ancestry_aetheris:feature:divine-countenance` - Divine Countenance | `roll:before` | Advantage on rolls to command or persuade. | `conditional`; social-context. |
| Void Playtest | `the_void_ancestry_gnome:feature:true-sight` - True Sight | `roll:before` | Advantage on rolls to see through illusions. | `conditional`. |
| Void Playtest | `the_void_community_warborne:feature:brave-face` - Brave Face | `roll:after` | Once per session, attack-caused Stress mark can be replaced by Hope spend. | `roll-hook`. |
| Void Playtest | `the_void_community_frostborne:feature:hardy` - Hardy | `conditional` | Help an Ally through difficult terrain without spending Hope. | `conditional`; removes cost. |
| Void Playtest | `the_void_subclass_moon:specialization:ire-of-pale-light` - Ire of Pale Light | `roll:after` | Hexed creature within Far fails attack: it marks Stress. | `conditional`; Hex state. |
| Void Playtest | `the_void_domain_card_chains_of_affliction` - Chains of Affliction | `conditional` | Chained target reduces HP marks caused by its damage by one. | `conditional`; target state. |
| Void Playtest | `the_void_domain_card_shared_trauma` - Shared Trauma | `conditional` | Transfer HP marks between willing Melee creatures. | `conditional`; HP transfer. |
| Void Playtest | `the_void_domain_card_spectral_mist` - Spectral Mist | `conditional` | Creatures become incorporeal, pass through solids, immune to physical damage. | `conditional`; form state. |
| Void Playtest | `the_void_domain_card_wall_of_hunger` - Wall of Hunger | `conditional` | Hazard forces Stress and Reaction Roll or Restrained. | `conditional`; scene hazard. |
| Void Playtest | `the_void_subclass_hedge:foundation:herbal-remedies` - Herbal Remedies | `conditional` | Consumable HP/Stress clear increases by one. | `conditional`; consumable amplifier. |

## Follow-Up Priority

High priority for structured hints:
1. Add safe-static derivations for Giant HP, Simiah Evasion, Earthkin armor/thresholds, Rugged Severe threshold, and selected special equipment penalties/bonuses that are deterministic.
2. Add suggested token trackers for Seaborne Tide, Slayer Dice, Unstoppable Die, Poison tokens, Focus, Favor, Dark Army, Umbral Veil, and Spellcharge-style card tokens.
3. Add roll-result reminders for Human, Halfling, Infernis, Witch's Charm, Strange Patterns, Sneak Attack, and common Hope/Fear hooks.

Manual until more UI exists:
- Experience choices: Clank, Master of the Craft, Honing Relic.
- Multi-option permanent choices: Vitality.
- Scene/target states: Hex, Marked for Death, Chained, Cloaked, Beastform, Wolf Form, Glamour, Moonbeam, Fane/Wall hazards.
- Ally-dependent or GM-facing effects: Help an Ally, Tag Team Roll, Group Action, many reaction/defense hooks.
