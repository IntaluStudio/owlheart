# Mechanics Index — Missing Entries Flag
# 2026-05-24

Compared `feature-mechanics-index-2026-05-24.md` against all data files and PDF.
74 entries flagged across 5 categories. Each entry shows `[roll moment]` and suggested automation tag.

Roll moments:
- `roll:before` — player activates before dice hit the table
- `roll:after`  — player reacts after seeing the result
- `roll:damage` — fires during/after the damage roll specifically
- `conditional`  — state-based, no specific roll moment
- `safe-static`  — applies at character creation, no roll involvement

---

## REROLL (4 missing)

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:after` | `core_class_wizard:feature:strange-patterns` | Strange Patterns | Choose a number 1–12. When you roll it on a Duality Die, gain Hope or clear Stress. Change on long rest. |
| `roll:after` | `the_void_ancestry_gnome:feature:nimble-fingers` | Gnome — Nimble Fingers | On a Finesse Roll, spend 2 Hope to reroll Hope Die. |
| `roll:after` | `the_void_subclass_executioners_guild:mastery:true-strike` | True Strike | Once per long rest: fail attack → spend Hope to make it succeed. |
| `roll:after` | `the_void_community_duneborne:feature:oasis` | Duneborne — Oasis | During short rest: reroll one die used for a downtime action. |

---

## ADDITION (42 missing)

Entries that add dice, flat bonuses, extra damage, or extra attacks to a roll.

### Core Classes (missing features)

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:after` | `core_class_warrior:feature:attack-of-opportunity` | Attack of Opportunity | Adversary leaves Melee → reaction roll. On success: stop them, deal primary weapon damage, or move with them. Two effects on crit. |
| `roll:damage` | `core_class_rogue:feature:sneak-attack` | Sneak Attack | Cloaked or ally in Melee of target: add d6s equal to tier to damage roll. |
| `roll:damage` | `core_class_guardian:feature:unstoppable` | Unstoppable | Unstoppable Die (d6 at lvl 5) increments each damage roll that deals 1+ HP. Add current value to damage. Reduce physical damage severity by one threshold. Can't be Restrained or Vulnerable. `tracker` |
| `roll:before` | `core_class_druid:feature:beastform` | Beastform | Mark Stress to transform. Gain Beastform attack trait, Evasion bonus, and features. Armor stays active. `conditional` |

### Void Ancestries (all missing)

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `safe-static` | `the_void_ancestry_earthkin:feature:stoneskin` | Earthkin — Stoneskin | Permanent +1 Armor Score AND +1 to all damage thresholds. |
| `roll:before` | `the_void_ancestry_skykin:feature:eye-of-the-storm` | Skykin — Eye of the Storm | Spend 2 Hope: +1 Evasion until next Severe damage or used again. |
| `roll:damage` | `the_void_ancestry_emberkin:feature:ignition` | Emberkin — Ignition | Mark Stress: primary weapon gains +1d6 damage until end of scene. |

### Void Classes (unindexed features)

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:before` | `the_void_class_witch:feature:hex` | Witch — Hex | Mark Stress to Hex a creature (when they cause HP marks). Action and damage rolls vs Hexed gain +tier bonus. |
| `roll:before` | `the_void_class_warlock:feature:warlock-patron` | Warlock Patron | Before a roll related to patron's spheres of influence, spend Favor to add sphere value. |
| `roll:damage` | `the_void_class_brawler:feature:combo-strikes` | Combo Strikes | Mark Stress: chain Combo Die rolls, adding all results until a lower result stops the chain. Total adds to damage. |

### Void Subclasses (unindexed features)

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:damage` | `the_void_subclass_executioners_guild:foundation:first-strike` | First Strike | First successful attack in a scene: double the damage. |
| `conditional` | `the_void_subclass_executioners_guild:foundation:ambush` | Ambush | Marked for Death damage dice: d4 → d6. |
| `conditional` | `the_void_subclass_executioners_guild:mastery:backstab` | Backstab | Marked for Death damage dice: d6 → d8. |
| `roll:after` | `the_void_subclass_juggernaut:foundation:overwhelm` | Overwhelm | Successful attack + spend Hope: force target to mark Stress OR throw them to Close range. |
| `roll:after` | `the_void_subclass_juggernaut:mastery:pummeljoy` | Pummeljoy | Crit success in Melee: +1 Hope, clear Stress, +1 Proficiency for that attack. |
| `roll:before` | `the_void_subclass_martial_artist:specialization:spirit-blast` | Spirit Blast | Spend Focus: Instinct Roll vs Close adversary, d20+3 magic damage. Extra Focus → target Vulnerable. |
| `roll:after` | `the_void_subclass_pact_of_the_endless:foundation:deadly-devotion` | Deadly Devotion | Successful attack + spend Favor: +1 Evasion until HP marked or rest. |
| `roll:before` | `the_void_subclass_hedge:mastery:circle-of-power` | Circle of Power *(bonus detail)* | While active: +4 damage thresholds, +2 attack rolls, +1 Evasion. Already indexed as `tracker` but bonus values not listed. |

### Void Domain Cards (missing)

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:after` | `the_void_domain_card_hideous_retribution` | Hideous Retribution | Ally in Close takes damage → Spellcast Reaction Roll; mark Stress to deal d6 magic damage. |
| `roll:damage` | `the_void_domain_card_damnation` | Damnation | Spellcast success: mark any number of Stress to roll equal number of d20s for magic damage. |
| `roll:after` | `the_void_domain_card_dark_army` *(defensive half)* | Dark Army — damage reduction | Spend token to reduce incoming damage by 1d8. Offensive half is indexed; defensive half is not. |

### Core Armors (all missing from index)

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `safe-static` | `core_armor_bellamoi_fine_armor` | Bellamoi Fine Armor | Permanent +1 Presence. |
| `safe-static` | `core_armor_channeling_armor` | Channeling Armor | Permanent +1 to Spellcast Rolls. |
| `roll:after` | `core_armor_elundrian_chain_armor` | Elundrian Chain Armor | Reduce incoming magic damage by Armor Score before applying to thresholds. |
| `conditional` | `core_armor_irontree_breastplate_armor` | Irontree Breastplate | Mark last Armor Slot: +2 damage thresholds until 1+ slot is cleared. |
| `roll:after` | `core_armor_full_fortified_armor` | Full Fortified Armor | Marking an Armor Slot reduces severity by TWO thresholds instead of one. |
| `roll:after` | `core_armor_dunamis_silkchain` | Dunamis Silkchain | Mark Armor Slot + roll d4: add result to Evasion against that incoming attack. |
| `roll:damage` | `core_armor_spiked_plate_armor` | Spiked Plate Armor | Successful Melee attack: add d4 to damage roll. |

### Core Weapons (missing)

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:damage` | `core_weapon_knuckle_blades` | Knuckle Blades / Talon Blades / Yutari Bloodbow | Roll max value on any damage die → roll an additional damage die. |
| `roll:damage` | `core_weapon_greatsword` | Greatsword and tier variants | Successful attack: roll additional damage die, discard lowest. |
| `roll:before` | `core_weapon_hammer_of_wrath` | Hammer of Wrath | Before attack: mark Stress to use d20 as the damage die. |
| `roll:before` | `core_weapon_ricochet_axes` | Ricochet Axes | Mark 1+ Stress to hit that many targets with a single attack roll. |
| `roll:damage` | `core_weapon_flickerfly_blade` | Flickerfly Blade | Damage bonus equal to Agility. |
| `roll:damage` | `core_weapon_fusion_gloves` | Fusion Gloves | Damage bonus equal to level. |
| `roll:before` | `core_weapon_powered_gauntlet` | Powered Gauntlet | Mark Stress: +1 Proficiency on a primary weapon attack. |
| `roll:before` | `core_weapon_midas_scythe` | Midas Scythe | Spend a handful of gold: +1 Proficiency on a damage roll. |
| `roll:damage` | `core_weapon_siphoning_gauntlets` | Siphoning Gauntlets | Successful attack: roll d6. On 6: clear a Hit Point or Stress. |
| `roll:damage` | `core_weapon_hammer_of_exota` | Hammer of Exota | Successful Melee attack: all other adversaries in Very Close must Reaction Roll (14) or take half damage. |
| `roll:damage` | `core_weapon_urok_broadsword` | Urok Broadsword | Successful Severe damage: target marks an additional Hit Point. |
| `roll:after` | `core_weapon_braveshield` | Braveshield | Mark Armor Slot: also protects all allies in Melee taking the same attack. |

### Core Consumables (missing)

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:before` | `core_consumable_hopehold_flare` | Hopehold Flare | Scene-wide: allies in Close roll d6 when spending Hope. On 6: effect happens without spending it. |
| `roll:after` | `core_consumable_vial_of_darksmoke` | Vial of Darksmoke | When attacked: roll d6s equal to Agility, add highest to Evasion against that attack. |

---

## ADVANTAGE / DISADVANTAGE (20 missing)

Entries that grant advantage, disadvantage, or equivalent (forced die downgrade, auto-success, conditional Evasion).

### Void Ancestries

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:before` | `the_void_ancestry_aetheris:feature:divine-countenance` | Aetheris — Divine Countenance | Advantage on rolls to command or persuade. |
| `roll:after` | `the_void_ancestry_aetheris:feature:hallowed-aura` | Aetheris — Hallowed Aura | Once per rest: change an ally's Fear roll within Close to Hope. |

### Void Classes

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:before` | `the_void_class_assassin:feature:get-in-get-out` | Get In & Get Out | Spend Hope for GM-provided path. Next roll using that path has advantage. |
| `roll:after` | `the_void_class_brawler:hope:staggering-strike` | Staggering Strike | Spend 3 Hope on successful attack: target is Staggered (disadvantage on attack rolls) and marks Stress. |

### Void Subclasses

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:before` | `the_void_subclass_juggernaut:foundation:powerhouse` | Powerhouse | Mark Stress to target two creatures with one attack roll. |
| `conditional` | `the_void_subclass_executioners_guild:specialization:scorpions-poise` | Scorpion's Poise | +2 Evasion against attacks from a Marked for Death creature. |
| `roll:before` | `the_void_subclass_martial_artist:specialization:keen-defenses` | Keen Defenses | Spend Focus: give an incoming attack roll disadvantage. |
| `roll:before` | `the_void_subclass_pact_of_the_endless:specialization:draining-invocation` | Draining Invocation | Spend Favor: attacker targeting you or Very Close ally uses d12 instead of d20. Attacker marks Stress. |
| `roll:before` | `the_void_subclass_pact_of_the_endless:mastery:draining-bane` | Draining Bane | Spend 2 Favor: Drain a creature (d12 for their attack rolls). They mark Stress; you clear Stress. |
| `roll:before` | `the_void_subclass_moon:foundation:nights-glamour` | Night's Glamour | Mark Stress for Glamour. While active: advantage on Presence Rolls using appearance. |
| `roll:before` | `the_void_subclass_moon:specialization:moonbeam` | Moonbeam | Once per session: +1 Spellcast Rolls + advantage on illusion rolls for all in moonlight area. |

### Void Communities

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:after` | `the_void_community_freeborne:feature:unbound` | Freeborne — Unbound | Once per session: change a Fear action roll to Hope. |
| `roll:after` | `the_void_community_warborne:feature:brave-face` | Warborne — Brave Face | Once per session: attack would cause Stress mark → spend Hope instead. |

### Core Armors

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:before` | `core_armor_runetan_floating_armor` | Runetan Floating Armor | Mark Armor Slot: give an incoming attack roll disadvantage. |

### Core Weapons

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:before` | `core_weapon_meridian_cutlass` | Meridian Cutlass | No other creatures in Close of target: advantage on attack roll against them. |
| `roll:after` | `core_weapon_parrying_dagger` | Parrying Dagger | When attacked: roll this weapon's dice. Attacker's dice matching yours are discarded from their roll. |
| `roll:after` | `core_weapon_buckler` | Buckler | Mark Armor Slot: Evasion bonus equal to remaining available Armor Slots against that attack. |
| `roll:after` | `core_weapon_primer_shard` | Primer Shard | Successful attack: next attack against same target automatically succeeds. |

### Core Consumables

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:before` | `core_consumable_blinding_orb` | Blinding Orb | All targets in Close become Vulnerable until they mark HP. |
| `roll:after` | `core_consumable_mirror_of_marigold` | Mirror of Marigold | Spend Hope when taking damage: negate it entirely. One use. |

---

## HOPE / FEAR HOOKS (6 missing)

Entries that respond to Hope/Fear outcomes but aren't in the Hope/Fear Hooks section.

| Roll Moment | Entry ID | Name | What it does |
| --- | --- | --- | --- |
| `roll:after` | `the_void_domain_card_savor_the_anguish` | Savor the Anguish | Adversary in Close marks Stress or takes Severe damage: spend Hope to clear Stress OR force GM to lose Fear. |
| `roll:after` | `the_void_domain_card_dire_strike` | Dire Strike | After successful attack: spend 2 Hope. GM loses 1 Fear per HP target marked. |
| `conditional` | `the_void_domain_card_invoke_torment` | Invoke Torment | Targets with all Stress marked take double damage. Defeat such a target: clear Stress. |
| `roll:after` | `the_void_subclass_juggernaut:mastery:not-done-yet` | Not Done Yet | When you mark 2+ HP from an attack: gain Hope or clear Stress. |
| `conditional` | `the_void_subclass_martial_artist:mastery:limit-breaker` | Limit Breaker | Once per rest: perform impossible feat without rolling. Gain Hope and clear Stress. |
| `conditional` | `the_void_subclass_hedge:foundation:herbal-remedies` | Herbal Remedies | Consumable clears HP or Stress: increase amount cleared by 1. |

---

## SAFE-STATIC (2 missing from Additions section)

| Entry ID | Name | What it does |
| --- | --- | --- |
| `core_armor_savior_chainmail` | Savior Chainmail | -1 to all character traits and Evasion. |
| `core_armor_tyris_soft_armor` | Tyris Soft Armor | +2 to rolls made to move silently. |

---

## Summary Count

| Category | Missing |
| --- | --- |
| Reroll | 4 |
| Addition | 42 |
| Advantage / Disadvantage | 20 |
| Hope / Fear Hooks | 6 |
| Safe-Static | 2 |
| **Total** | **74** |

### Whole source files with zero index coverage
- All core armors (named/special variants only — base tiers fine to skip)
- All core consumables
- All Void ancestries
- All Void communities
- Void class features beyond what's already indexed (Hex, Commune, Get In & Get Out, Warlock Patron, I Am the Weapon, Combo Strikes, Staggering Strike)
