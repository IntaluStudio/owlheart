# Mechanics Gap Analysis — 2026-05-24

Source: `Additional-Sheets-Daggerheart-May212025.pdf` + `daggerheart-data-main` (core + the_void)  
Compared against: `feature-mechanics-index-2026-05-24.md`

This report lists everything with a gameplay mechanic keyword (add, reroll, advantage, bonus, tracker, roll-hook, conditional) that is **not yet in the index**. Items are grouped by source file and tagged with suggested automation confidence.

---

## 1. Core Mechanics from the PDF (Rulebook-Level)

These aren't entity entries — they're system rules confirmed by the PDF that the index doesn't model yet. Flagging them so you can decide whether the index should have a `## Core Rules` section.

| Mechanic | Summary | Notes |
| --- | --- | --- |
| Advantage / Disadvantage | Advantage adds a d6 to the roll; Disadvantage subtracts a d6. Multi-source advantage: only the highest d6 counts. | Confirmed on p3 Quick Reference. Used by many features already indexed. |
| Help an Ally | Spend a Hope, roll d6 advantage die added to ally's roll. | Also confirmed p3. Currently referenced only in class descriptions. |
| Group Action | Leader makes action roll, others make reaction rolls. Leader gains +1 per success and -1 per failure. | Not modeled anywhere in index. |
| Tag Team Roll | Spend 3 Hope each, both roll, choose one result for both. On Hope: all PCs gain Hope. On Fear: GM gains Fear per PC. Both damage rolls add together on success. | Core mechanic; currently only referenced as a `roll-hook` on individual card entries. |
| Critical Success Damage | Start with max possible value on damage dice, then roll and add that to it. | Important for damage display. Not called out in index. |
| Conditions | Vulnerable (adv against), Restrained (can't move), Hidden (disadv against), Direct Damage (armor slots can't reduce). | Index tracks which entries *apply* these conditions inconsistently. |
| Short Rest / Long Rest | Short: 2 moves, GM gains 1d4 Fear. Long: 2 moves, GM gains (# of PCs + 1d4) Fear + can advance countdown. | Not in index. Relevant to rest-triggered abilities. |

---

## 2. Multiclass Sheet Features (PDF, pp 8–17)

Confirmed class features from the multiclass sheets not yet in the index.

| Source | Entry | Hook | Automation note |
| --- | --- | --- | --- |
| SRD Core | `core_class_wizard:feature:strange-patterns` — Strange Patterns | Choose a number 1–12; when you roll it on a Duality Die, gain a Hope or clear a Stress. Change the number on long rest. | `roll-hook`; number is a player choice. |
| SRD Core | `core_class_warrior:feature:attack-of-opportunity` — Attack of Opportunity | Reaction roll when adversary leaves Melee range. On success: stop movement, deal damage, or move with them. Two effects on crit. | `roll-hook`; triggered by adversary movement. |
| SRD Core | `core_class_rogue:feature:cloaked` — Cloaked | Hidden condition upgraded: remain unseen if stationary when adversary would spot you. Ends on attack or line-of-sight move. | `conditional`; extends Hidden tracking. |
| SRD Core | `core_class_rogue:feature:sneak-attack` — Sneak Attack | Cloaked or ally within Melee of target: add d6s equal to tier to damage roll. | `roll-hook`; situational damage bonus. |
| SRD Core | `core_class_guardian:feature:unstoppable` — Unstoppable | Once per long rest: gain Unstoppable Die (d6 at level 5). After each damage roll dealing 1+ HP, increment die. Add current die value to damage rolls. Reduce physical damage severity by one threshold. Can't be Restrained or Vulnerable. | `tracker`; die value is a live resource. |
| SRD Core | `core_class_druid:feature:beastform` — Beastform | Mark Stress to transform into a Beastform creature of your tier or lower. Can't use weapons or cast new domain spells. Gain Beastform features, Evasion bonus, and attack trait. Armor stays active. Drop out at last HP. | `conditional`; complex transform state. |
| SRD Core | `core_class_sorcerer:feature:channel-raw-power` — Channel Raw Power | Once per long rest: vault a domain card to either gain Hope equal to card level OR add damage bonus equal to TWICE the card level. | `choice`; **PDF wording differs from index** — index says "bonus to damage roll equal to twice the level." Confirm which is live. |

---

## 3. Void Ancestries (All Missing)

| Source | Entry | Hook | Automation note |
| --- | --- | --- | --- |
| Void Playtest | `the_void_ancestry_earthkin` — Stoneskin | Permanent +1 Armor Score AND +1 to all Damage Thresholds. | `safe-static`; two bonuses from one feature. |
| Void Playtest | `the_void_ancestry_earthkin` — Immoveable | Can't be lifted or moved against will while feet touch ground. | `conditional`; narrative/scene state. |
| Void Playtest | `the_void_ancestry_skykin` — Eye of the Storm | Spend 2 Hope: +1 Evasion until next Severe damage or used again. | `roll-hook`; temporary Evasion modifier. |
| Void Playtest | `the_void_ancestry_tidekin` — Lifespring | Once per rest, mark 2 Stress to clear 1 HP on self or ally (requires water nearby). | `conditional`; resource and scene requirement. |
| Void Playtest | `the_void_ancestry_emberkin` — Ignition | Mark Stress: primary weapon gains +1d6 damage until end of scene. | `roll-hook`; damage-roll reminder. |
| Void Playtest | `the_void_ancestry_aetheris` — Hallowed Aura | Once per rest: change an ally's within-Close Fear roll into a Hope roll. | `roll-hook`; outcome manipulation for ally. |
| Void Playtest | `the_void_ancestry_gnome` — Nimble Fingers | On a Finesse Roll, spend 2 Hope to reroll Hope Die. | `roll-hook`; trait-specific reroll. |
| Void Playtest | `the_void_ancestry_gnome` — True Sight | Advantage on rolls to see through illusions. | `conditional`; situation-specific advantage. |

---

## 4. Void Communities (All Missing)

| Source | Entry | Hook | Automation note |
| --- | --- | --- | --- |
| Void Playtest | `the_void_community_duneborne` — Oasis | During a short rest, reroll a die used for a downtime action. | `roll-hook`; rest-time reroll. |
| Void Playtest | `the_void_community_hearthborne` — Close-Knit | Once per long rest, spend any number of Hope to give an ally the same amount. | `tracker`; Hope transfer. |
| Void Playtest | `the_void_community_freeborne` — Unbound | Once per session, change an action roll with Fear to a roll with Hope. | `roll-hook`; outcome conversion, once per session. |
| Void Playtest | `the_void_community_reborne` — Found Family | Spend Hope to use an ally's community ability; that ally gains a Hope. | `choice`; depends on ally's community. |
| Void Playtest | `the_void_community_frostborne` — Hardy | Once per rest, Help an Ally through difficult terrain without spending a Hope. | `conditional`; removes Hope cost. |
| Void Playtest | `the_void_community_warborne` — Brave Face | Once per session, when an attack would cause you to mark a Stress, spend a Hope instead. | `roll-hook`; incoming stress mitigation. |

---

## 5. Void Classes — Unindexed Features

| Source | Entry | Hook | Automation note |
| --- | --- | --- | --- |
| Void Playtest | `the_void_class_witch:feature:hex` — Hex | Mark Stress to Hex a creature (when they cause HP marks to you or a Close ally). Action and damage rolls against Hexed creature gain bonus equal to tier. Ends when GM spends Fear equal to Spellcast trait or you Hex another. | `conditional`; tier-based bonus, target-state tracking. |
| Void Playtest | `the_void_class_witch:feature:commune` — Commune | Once per long rest, roll d6s equal to Spellcast trait; choose one result for divination detail level. | `choice`; no direct roll bonus, but establishes a tracker. |
| Void Playtest | `the_void_class_assassin:feature:get-in-get-out` — Get In & Get Out | Spend a Hope for GM to reveal quick or inconspicuous path. Next roll capitalizing on it has advantage. | `conditional`; situational advantage grant. |
| Void Playtest | `the_void_class_warlock:feature:warlock-patron` — Warlock Patron | Before an action roll related to patron's spheres of influence, spend a Favor to add the sphere's value. Spheres gain +1 per tier. | `tracker`; Favor spend + sphere value bonus. |
| Void Playtest | `the_void_class_brawler:feature:i-am-the-weapon` — I Am the Weapon | While no weapons equipped: +1 Evasion; unarmed strike is Melee, chosen trait, d8+d6 physical using Proficiency. | `conditional`; equipment-state dependent. |
| Void Playtest | `the_void_class_brawler:feature:combo-strikes` — Combo Strikes | After damage roll, mark Stress to start a Combo: roll Combo Die repeatedly, totaling all results until a lower result stops the chain. Total adds to damage. Combo Die starts d4, can be upgraded on level-up. | `roll-hook`; complex chained roll mechanic. |
| Void Playtest | `the_void_class_brawler:hope:staggering-strike` — Staggering Strike | Spend 3 Hope on successful attack: target is temporarily Staggered (disadvantage on attack rolls) and marks a Stress. | `roll-hook`; applies new Stagger condition. |

---

## 6. Void Subclasses — Unindexed Features

### Executioners Guild (Assassin)

| Entry | Hook | Automation note |
| --- | --- | --- |
| `foundation:first-strike` — First Strike | First successful attack in a scene deals double damage. | `conditional`; scene-first-attack state. |
| `foundation:ambush` — Ambush | Marked for Death bonus dice upgrade: d4 → d6. | `conditional`; modifies existing feature. |
| `specialization:death-strike` — Death Strike | Severe damage hit: mark Stress to force target to mark an additional HP. | `roll-hook`; threshold-trigger. |
| `specialization:scorpions-poise` — Scorpion's Poise | +2 Evasion against attacks from a Marked for Death creature. | `conditional`; target-state Evasion bonus. |
| `mastery:true-strike` — True Strike | Once per long rest, fail an attack: spend Hope to make it a success. | `roll-hook`; outcome conversion. |
| `mastery:backstab` — Backstab | Marked for Death bonus dice upgrade: d6 → d8. | `conditional`; modifies existing feature. |

### Juggernaut (Brawler)

| Entry | Hook | Automation note |
| --- | --- | --- |
| `foundation:powerhouse` — Powerhouse | Unarmed damage d8 → d10. Also: mark Stress to target two creatures with a single attack. | `conditional`; upgrade + multi-target. |
| `foundation:overwhelm` — Overwhelm | On successful attack, spend Hope: force target to mark Stress OR throw them to Close range. | `roll-hook`; choice of effect. |
| `specialization:eye-for-an-eye` — Eye for an Eye | When you mark 2+ HP from a Melee attack, attacker makes Reaction Roll (13). Failure: once per rest, they mark same HP. | `roll-hook`; triggered counterattack. |
| `mastery:pummeljoy` — Pummeljoy | Crit success on Melee attack: gain +1 Hope, clear +1 Stress, +1 Proficiency for that attack. | `roll-hook`; crit bonus bundle. |
| `mastery:not-done-yet` — Not Done Yet | Mark 2+ HP from an attack: gain a Hope or clear a Stress. | `roll-hook`; damage-taken reaction. |

### Martial Artist (Brawler)

| Entry | Hook | Automation note |
| --- | --- | --- |
| `specialization:keen-defenses` — Keen Defenses | Spend a Focus token: give an incoming attack roll disadvantage. | `tracker`; defensive Focus spend. |
| `specialization:spirit-blast` — Spirit Blast | Spend Focus: Instinct Roll, deal d20+3 magic damage. Spend additional Focus to make target temporarily Vulnerable. | `tracker`; roll-hook. |
| `mastery:limit-breaker` — Limit Breaker | Once per rest, perform an impossible physical feat without rolling. Gain a Hope and clear a Stress. | `conditional`; no roll, narrative + resource. |

### Pact of the Endless (Warlock)

| Entry | Hook | Automation note |
| --- | --- | --- |
| `foundation:patrons-mantle` — Patron's Mantle | Mark Stress to activate aura. While active: spend 2 Favor instead of marking Armor Slot. Also: +tier bonus to intimidation rolls. | `conditional`; Favor-as-armor-substitute. |
| `foundation:deadly-devotion` — Deadly Devotion | Successful attack: spend Favor for +1 Evasion until hit or rest. | `tracker`; temporary Evasion buff. |
| `specialization:draining-invocation` — Draining Invocation | Attacker targets you or a Very Close ally: spend Favor to force attacker to use d12 for the roll. Attacker marks Stress; you can clear Stress. | `tracker`; defensive roll manipulation. |
| `mastery:dark-aegis` — Dark Aegis | Once per long rest: would mark HP — spend Favor instead. | `tracker`; HP-absorption via Favor. |
| `mastery:draining-bane` — Draining Bane | Spend 2 Favor to Drain a creature (d12 for attack rolls). They mark Stress; you clear Stress. | `tracker`; upgrade of Draining Invocation. |

### Pact of the Wrathful (Warlock) — Additional Unindexed

| Entry | Hook | Automation note |
| --- | --- | --- |
| `specialization:menacing-reach` — Menacing Reach | When imbuing weapon, mark extra Stress to increase weapon range by one step. | `conditional`; modifies Favored Weapon activation. |

### Hedge (Witch)

| Entry | Hook | Automation note |
| --- | --- | --- |
| `foundation:herbal-remedies` — Herbal Remedies | When ally clears HP or Stress via consumable, increase amount cleared by 1. | `conditional`; consumable amplifier. |
| `foundation:tethered-talisman` — Tethered Talisman | Once per rest: imbue item. Holder takes damage: expend talisman to reduce HP marks by 1. | `tracker`; single-use damage mitigation. |

### Moon (Witch) — Additional Unindexed

| Entry | Hook | Automation note |
| --- | --- | --- |
| `foundation:nights-glamour` — Night's Glamour | Mark Stress for Glamour (lasts until HP mark, attack, or rest). While Glamoured: disguise self or gain advantage on Presence Rolls leveraging appearance. | `conditional`; roll-hook for Presence. |
| `specialization:moonbeam` — Moonbeam | Once per session: +1 bonus to Spellcast Rolls + advantage on rolls to see through illusions for all in moonlight (Close area). | `conditional`; scene-area bonus. |
| `specialization:ire-of-pale-light` — Ire of Pale Light | When a Hexed creature within Far range fails an attack roll, they must mark a Stress. | `conditional`; Hex state + fail hook. |

---

## 7. Void Domain Cards — Unindexed

| Source | Entry | Hook | Automation note |
| --- | --- | --- | --- |
| Void Playtest | `the_void_domain_card_hideous_retribution` — Hideous Retribution | Reaction when ally in Close takes damage: Spellcast Reaction Roll; on success, mark Stress to deal d6 magic damage. | `roll-hook`; reaction attack. |
| Void Playtest | `the_void_domain_card_shared_trauma` — Shared Trauma | Once per rest: mark HP on willing creature in Melee to clear equal HP on another willing creature in Melee. | `conditional`; HP transfer. |
| Void Playtest | `the_void_domain_card_voice_of_dread` — Voice of Dread | Spellcast Roll: target marks Stress and becomes temporarily Vulnerable. | `roll-hook`; applies Vulnerable. |
| Void Playtest | `the_void_domain_card_chains_of_affliction` — Chains of Affliction | Mark 2 Stress: Chain a target in Close. When Chained creature deals damage, their target reduces HP marks by 1. One Chain at a time. | `conditional`; target-state damage reduction. |
| Void Playtest | `the_void_domain_card_summon_horror` — Summon Horror | Success: spend Hope to deal d10 magic damage; target must Reaction Roll (12) or mark 1d4 Stress. | `roll-hook`; dual attack + stress roll. |
| Void Playtest | `the_void_domain_card_spectral_mist` — Spectral Mist | Mark Stress: self and Close targets become incorporeal (immune to physical damage, can pass through solids). Ends on action roll or passing through a solid object. | `conditional`; form/immunity state. |
| Void Playtest | `the_void_domain_card_dire_strike` — Dire Strike | After successful attack: spend 2 Hope, GM loses 1 Fear per HP the target marked. | `tracker`; GM Fear drain. |
| Void Playtest | `the_void_domain_card_jump_scare` — Jump Scare | When dealing magic damage: mark Stress to teleport to Melee of target. Target becomes Vulnerable until they mark HP. | `roll-hook`; teleport + condition. |
| Void Playtest | `the_void_domain_card_darkfire` — Darkfire | Spellcast Roll vs all adversaries in Close. Spend Hope per success; failures take d8+6 magic damage (half on their success). | `roll-hook`; AoE with Hope cost. |
| Void Playtest | `the_void_domain_card_wall_of_hunger` — Wall of Hunger | Spellcast Roll (13): necrotic wall in a line within Far. Creatures entering mark 2 Stress, then Reaction Roll (16) or Restrained. | `conditional`; scene hazard + Restrain. |
| Void Playtest | `the_void_domain_card_damnation` — Damnation | Spellcast Roll: on success, mark any number of Stress to roll equal number of d20s for magic damage. If target defeated, nearby adversaries mark Stress. | `roll-hook`; Stress-scaled damage roll. |
| Void Playtest | `the_void_domain_card_savor_the_anguish` — Savor the Anguish | When adversary in Close marks Stress or takes Severe damage: spend Hope to clear a Stress or force GM to lose a Fear. | `roll-hook`; reactive resource management. |
| Void Playtest | `the_void_domain_card_invoke_torment` — Invoke Torment | Targets with all Stress marked take double damage from your attacks. Defeat such a target: clear a Stress. | `conditional`; target-state damage multiplier. |

---

## 8. Core Armors — Unindexed Mechanics

These are the armors with active mechanical effects beyond base thresholds and score. Base-only armors (Gambeson, Leather, Chainmail, Full Plate and their tier variants) are omitted.

| Source | Entry | Hook | Automation note |
| --- | --- | --- | --- |
| SRD Core | `core_armor_elundrian_chain_armor` | Reduce incoming magic damage by Armor Score before applying to thresholds. | `conditional`; magic damage mitigation. |
| SRD Core | `core_armor_harrowbone_armor` | Before marking last Armor Slot, roll d6. On 6: reduce severity without marking. | `roll-hook`; probabilistic armor save. |
| SRD Core | `core_armor_irontree_breastplate_armor` | On marking last Armor Slot: +2 damage thresholds until at least 1 slot is cleared. | `conditional`; last-slot threshold surge. |
| SRD Core | `core_armor_runetan_floating_armor` | Mark an Armor Slot to give an incoming attack roll disadvantage. | `roll-hook`; proactive slot spend. |
| SRD Core | `core_armor_tyris_soft_armor` | +2 bonus to rolls made to move silently. | `safe-static`; situational skill bonus. |
| SRD Core | `core_armor_rosewild_armor` | When spending a Hope, can mark an Armor Slot instead. | `roll-hook`; Hope-to-slot substitution. |
| SRD Core | `core_armor_bellamoi_fine_armor` | Permanent +1 to Presence. | `safe-static`. |
| SRD Core | `core_armor_dragonscale_armor` | Once per short rest: would mark last HP, mark Stress instead. | `conditional`; death-adjacent mitigation. |
| SRD Core | `core_armor_spiked_plate_armor` | On successful Melee attack against a target: add d4 to damage roll. | `roll-hook`; damage addition. |
| SRD Core | `core_armor_channeling_armor` | +1 bonus to Spellcast Rolls. | `safe-static`. |
| SRD Core | `core_armor_emberwoven_armor` | Adversary attacking within Melee range marks a Stress. | `conditional`; melee counterpassive. |
| SRD Core | `core_armor_full_fortified_armor` | Marking an Armor Slot reduces severity by TWO thresholds instead of one. | `conditional`; enhanced armor slot value. |
| SRD Core | `core_armor_dunamis_silkchain` | Mark Armor Slot + roll d4: add result as bonus to Evasion against that attack. | `roll-hook`; reactive Evasion boost. |
| SRD Core | `core_armor_savior_chainmail` | -1 to all character traits and Evasion. | `safe-static` (penalty). |
| SRD Core | `core_armor_runes_of_fortification` | Each time you mark an Armor Slot, also mark a Stress. | `conditional` (penalty). |

---

## 9. Core Consumables — Unindexed Mechanics

Consumables are entirely absent from the index. Here are the ones with active gameplay mechanics (excludes straightforward HP/Stress clears).

| Source | Entry | Hook | Automation note |
| --- | --- | --- | --- |
| SRD Core | Trait Potions (Stride/Bolster/Control/Attune/Charm/Enlighten) | +1 to next roll of that trait. | `safe-static`; single-use one-roll bonus. |
| SRD Core | Major Trait Potions (6 variants) | +1 to that trait until next rest. | `conditional`; temporary trait boost. |
| SRD Core | `core_consumable_grindletooth_venom` + Improved + Redthorn variants | Add d6/d8/d12 to next physical damage roll. | `roll-hook`; consumable damage add. |
| SRD Core | `core_consumable_mythic_dust` | Add d12 to next magic damage roll. | `roll-hook`. |
| SRD Core | `core_consumable_vial_of_darksmoke` | When attacked: roll d6s equal to Agility, add highest result to Evasion against that attack. | `roll-hook`; reactive Evasion. |
| SRD Core | `core_consumable_armor_stitcher` | Spend any number of Hope to clear that many Armor Slots. | `tracker`; Hope-to-slot. |
| SRD Core | `core_consumable_hopehold_flare` | Allies in Close roll d6 when spending Hope. On 6: effect happens without spending it. Lasts until end of scene. | `roll-hook`; scene-wide Hope economy effect. |
| SRD Core | `core_consumable_shrinking_potion` | Halve size: +2 Agility, -1 Proficiency until rest or dropped. | `conditional`; form modifier. |
| SRD Core | `core_consumable_growing_potion` | Double size: +2 Strength, +1 Proficiency until rest or dropped. | `conditional`; form modifier. |
| SRD Core | `core_consumable_blinding_orb` | All targets in Close become Vulnerable until they mark HP. | `conditional`; applies Vulnerable, area. |
| SRD Core | `core_consumable_mirror_of_marigold` | Spend Hope when taking damage to negate it entirely. One use (mirror shatters). | `roll-hook`; single-use full damage negate. |
| SRD Core | `core_consumable_snap_powder` | Mark a Stress and clear a HP simultaneously. | `conditional`; paired cost/benefit. |
| SRD Core | `core_consumable_potion_of_stability` | Take one additional downtime move. | `conditional`; rest enhancement. |

---

## 10. Core Weapons — Unindexed Mechanics

Only weapons with unindexed mechanical effects. Straightforward +X attack or damage are noted briefly; complex hooks get full entries.

| Source | Entry | Hook | Automation note |
| --- | --- | --- | --- |
| SRD Core | `core_weapon_knuckle_blades` / `core_weapon_yutari_bloodbow` / `core_weapon_talon_blades` | On max value on any damage die: roll an additional damage die. | `roll-hook`; damage cascade. |
| SRD Core | `core_weapon_greatsword` and tier variants | On successful attack: roll additional damage die and discard lowest result. Also: -1 Evasion. | `roll-hook`; replaces one die with best of two. |
| SRD Core | `core_weapon_meridian_cutlass` | No other creatures in Close range of target: advantage on attack roll against them. | `conditional`; situational advantage. |
| SRD Core | `core_weapon_parrying_dagger` | When attacked: roll this weapon's damage dice. Attacker's damage dice matching your dice are discarded from their roll. | `roll-hook`; reactive damage reduction. |
| SRD Core | `core_weapon_buckler` | Mark an Armor Slot: gain Evasion bonus equal to remaining available Armor Slots against that attack. | `roll-hook`; slot-count-dependent Evasion. |
| SRD Core | `core_weapon_braveshield` | When you mark an Armor Slot, it protects you and all allies in Melee of you from the same attack. | `conditional`; area armor slot effect. |
| SRD Core | `core_weapon_primer_shard` | Successful attack: next attack against same target automatically succeeds. | `conditional`; auto-success on following attack. |
| SRD Core | `core_weapon_hammer_of_wrath` | Before an attack roll: mark Stress to use a d20 as the damage die. | `roll-hook`; Stress-for-damage-die swap. |
| SRD Core | `core_weapon_ricochet_axes` | Mark 1+ Stress to hit that many targets with a single attack roll. | `roll-hook`; Stress-scaled multi-target. |
| SRD Core | `core_weapon_firestaff` | Roll a 6 on any damage die: target must mark a Stress. | `roll-hook`; damage die trigger. |
| SRD Core | `core_weapon_curved_dagger` | Roll a 1 on any damage die: it deals 8 damage instead. | `roll-hook`; low-roll replacement. |
| SRD Core | `core_weapon_hammer_of_exota` | Successful attack in Melee: all other adversaries in Very Close must succeed Reaction Roll (14) or take half damage. | `roll-hook`; AoE splash. |
| SRD Core | `core_weapon_urok_broadsword` | Successful attack dealing Severe damage: target must mark an additional HP. | `roll-hook`; threshold-trigger bonus. |
| SRD Core | `core_weapon_spiked_shield` | +1 Armor Score + adds primary weapon damage bonus within Melee. | `safe-static`; dual bonus. |
| SRD Core | `core_weapon_powered_gauntlet` | Mark Stress for +1 Proficiency on a primary weapon attack. | `roll-hook`. |
| SRD Core | `core_weapon_siphoning_gauntlets` | Successful attack: roll d6. On 6: clear a Hit Point or clear a Stress. | `roll-hook`; probabilistic healing. |
| SRD Core | `core_weapon_midas_scythe` | Spend a handful of gold for +1 Proficiency on a damage roll. | `tracker`; gold-as-resource. |
| SRD Core | `core_weapon_fusion_gloves` | Damage bonus equal to level (scales with tier). | `safe-static`; level-scaling. |
| SRD Core | `core_weapon_flickerfly_blade` | Damage bonus equal to Agility. | `safe-static`; trait-scaling. |
| SRD Core | `core_weapon_broadsword` and tier variants | +1 to attack rolls. | `safe-static`. |

---

## Priority Tiers for the Next Index Update

**High — add these first** (most likely to affect auto-fill calculations):

1. Void Ancestries — all 6, especially `earthkin` (safe-static dual bonus) and `aetheris` (ally Hope/Fear swap).
2. Void Communities — all 6. Several reroll/outcome hooks are currently untracked.
3. Core class features: `cloaked`, `sneak-attack`, `unstoppable`, `beastform`, `strange-patterns`, `attack-of-opportunity`.
4. Special armor mechanics — especially `runetan_floating_armor`, `full_fortified_armor`, `rosewild_armor`, `dragonscale_armor`.

**Medium — next pass:**

5. All unindexed void subclass features (Executioners Guild, Juggernaut, Martial Artist, Pact of the Endless, additional Wrathful/Hedge/Moon entries).
6. Unindexed Void Domain Cards (13 listed above).
7. Consumables with active mechanics (armor_stitcher, hopehold_flare, darksmoke_vial, mirror_of_marigold, blinding_orb).

**Low — flag for later:**

8. Weapon mechanical variants (mostly `roll-hook`, low auto-fill priority).
9. Core rules section (advantage/disadvantage, group action, downtime) — useful documentation but not entity-level.
