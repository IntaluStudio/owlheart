# Feature Mechanics Index - 2026-05-24

Scope:
- Current app data from `public/data/srd-core.json`.
- Current Void playtest data from `src/data/voidPlaytest/classes.json`, `src/data/voidPlaytest/subclasses.json`, and `src/data/voidPlaytest/domain-cards.json`.
- This is a documentation index for cleanup and later automation planning. It is not an instruction to auto-apply every effect.

## Index Rules

Automation confidence:
- `safe-static`: deterministic once the source is selected.
- `conditional`: depends on armor, domain count, scene state, rest timing, target state, or current roll context.
- `choice`: the player chooses one option from several; do not auto-apply without UI.
- `tracker`: suggests a token/resource tracker.
- `roll-hook`: should be exposed near roll results, not silently applied.

## Additions and Persistent Bonuses

These entries grant slots, experiences, status values, permanent bonuses, or long-lived bonuses.

| Source | Entry | Hook | Automation note |
| --- | --- | --- | --- |
| SRD Core | `core_ancestry_clank` - Clank | Purposeful: choose an Experience and gain permanent +1 to it. | `choice`; needs selected Experience. |
| SRD Core | `core_ancestry_giant` - Giant | Endurance: gain an additional Hit Point slot at character creation. | `safe-static`; max HP +1. |
| SRD Core | `core_ancestry_human` - Human | High Stamina: gain an additional Stress slot at character creation. | `safe-static`; max Stress +1. Already represented in `calculationHints`. |
| SRD Core | `core_ancestry_simiah` - Simiah | Nimble: permanent +1 Evasion at character creation. | `safe-static`; Evasion +1. |
| SRD Core | `core_domain_card_armorer` - Armorer | While wearing armor, gain +1 Armor Score. | `conditional`; selected armor required. Already represented in `calculationHints`. |
| SRD Core | `core_domain_card_blade_touched` - Blade-Touched | With 4+ Blade cards, +2 attack rolls and +4 Severe threshold. | `conditional`; domain-count requirement. Severe threshold already represented in `calculationHints`; attack bonus still manual. |
| SRD Core | `core_domain_card_bone_touched` - Bone-Touched | With 4+ Bone cards, +1 Agility. | `conditional`; trait bonus and reroll-prevention effect need explicit support. |
| SRD Core | `core_domain_card_fortified_armor` - Fortified Armor | While wearing armor, +2 damage thresholds. | `conditional`; selected armor required. Already represented in `calculationHints`. |
| SRD Core | `core_domain_card_master_of_the_craft` - Master of the Craft | Permanent +2 to two Experiences or +3 to one Experience. | `choice`; needs selected Experience(s). |
| SRD Core | `core_domain_card_splendor_touched` - Splendor-Touched | With 4+ Splendor cards, +3 Severe threshold. | `conditional`; domain-count requirement. Already represented in `calculationHints`. |
| SRD Core | `core_domain_card_valor_touched` - Valor-Touched | With 4+ Valor cards, +1 Armor Score. | `conditional`; domain-count requirement. Already represented in `calculationHints`. |
| SRD Core | `core_domain_card_vitality` - Vitality | Permanently gain two of: one Stress slot, one HP slot, +2 damage thresholds. | `choice`; intentionally not auto-derived until the app captures the chosen benefits. |
| SRD Core | `core_subclass_school_of_war:foundation:battlemage` - Battlemage | Gain an additional Hit Point slot. | `safe-static`; max HP +1. Already represented in `calculationHints`. |
| SRD Core | `core_subclass_stalwart:foundation:unwavering` - Unwavering | Permanent +1 damage thresholds. | `safe-static`; thresholds +1. Already represented in `calculationHints`. |
| SRD Core | `core_subclass_stalwart:specialization:unrelenting` - Unrelenting | Permanent +2 damage thresholds. | `safe-static`; thresholds +2. Already represented in `calculationHints`. |
| SRD Core | `core_subclass_stalwart:mastery:undaunted` - Undaunted | Permanent +3 damage thresholds. | `safe-static`; thresholds +3. Already represented in `calculationHints`. |
| SRD Core | `core_subclass_vengeance:foundation:at-ease` - At Ease | Gain an additional Stress slot. | `safe-static`; max Stress +1. Already represented in `calculationHints`. |
| SRD Core | `core_subclass_nightwalker:mastery:fleeting-shadow` - Fleeting Shadow | Permanent +1 Evasion. | `safe-static`; Evasion +1. Already represented in `calculationHints`. |
| SRD Core | `core_subclass_winged_sentinel:mastery:ascendant` - Ascendant | Permanent +4 Severe threshold. | `safe-static`; Severe threshold +4. Already represented in `calculationHints`. |
| Void Playtest | `the_void_subclass_juggernaut:specialization:rugged` - Rugged | Permanent +3 Severe damage threshold. | `safe-static`; candidate for Void threshold hint. |
| Void Playtest | `the_void_subclass_moon:mastery:lunar-phases` - Lunar Phases | Phase options include +2 damage rolls, +2 thresholds, or +1 Evasion. | `choice`; depends on selected/rolled phase. |

## Reroll and Result-Change Abilities

These entries reroll dice, force rerolls, switch Hope/Fear dice, or change the outcome of a roll.

| Source | Entry | Hook | Automation note |
| --- | --- | --- | --- |
| SRD Core | `core_ancestry_faerie` - Faerie | Spend 3 Hope to reroll Duality Dice for an ally within Close range. | `roll-hook`; ally/context dependent. |
| SRD Core | `core_ancestry_goblin` - Goblin | Once per rest, mark Stress to force an adversary to reroll an attack. | `roll-hook`; defensive reminder. |
| SRD Core | `core_ancestry_halfling` - Halfling | When Hope Die is 1, reroll it. | `roll-hook`; direct roll result hook. |
| SRD Core | `core_ancestry_human` - Human | When failing a roll that used an Experience, mark Stress to reroll. | `roll-hook`; requires knowing Experience usage. |
| SRD Core | `core_ancestry_infernis` - Infernis | When rolling with Fear, mark 2 Stress to change it to Hope. | `roll-hook`; outcome conversion. |
| SRD Core | `core_ancestry_katari` - Katari | On an Agility Roll, spend 2 Hope to reroll Hope Die. | `roll-hook`; trait-specific. |
| SRD Core | `core_class_ranger:feature:rangers-focus` - Ranger's Focus | End focus to reroll Duality Dice against focus target. | `roll-hook`; target-state dependent. |
| SRD Core | `core_class_sorcerer:hope:volatile-magic` - Volatile Magic | Spend 3 Hope to reroll damage dice on magic damage. | `roll-hook`; damage-roll hook. |
| SRD Core | `core_class_wizard:hope:not-this-time` - Not This Time | Spend 3 Hope to force adversary attack or damage reroll. | `roll-hook`; GM/adversary roll. |
| SRD Core | `core_domain_card_arcana_touched` - Arcana-Touched | Once per rest, switch Hope and Fear Dice. | `roll-hook`; outcome manipulation. |
| SRD Core | `core_domain_card_bone_touched` - Bone-Touched | Once per rest, spend 3 Hope to cause a successful attack against you to fail. | `roll-hook`; defensive result change. |
| SRD Core | `core_domain_card_endless_charisma` - Endless Charisma | Spend Hope to reroll Hope or Fear Die for social action rolls. | `roll-hook`; action intent dependent. |
| SRD Core | `core_domain_card_forager` - Forager | Luck charm option rerolls any die. | `choice`; generated consumable option. |
| SRD Core | `core_domain_card_not_good_enough` - Not Good Enough | Reroll 1s or 2s on damage dice. | `roll-hook`; damage dice hook. |
| SRD Core | `core_domain_card_reassurance` - Reassurance | Ally can reroll their dice. | `roll-hook`; ally target. |
| SRD Core | `core_domain_card_stealth_expertise` - Stealth Expertise | Convert Fear to Hope on stealth movement rolls. | `roll-hook`; situation-specific. |
| SRD Core | `core_domain_card_support_tank` - Support Tank | Spend 2 Hope to let an ally reroll Hope or Fear Die. | `roll-hook`; ally target. |
| SRD Core | `core_subclass_call_of_the_slayer:specialization:weapon-specialist` - Weapon Specialist | Reroll 1s on Slayer Dice once per long rest. | `roll-hook`; resource-specific. |
| SRD Core | `core_weapon_axe_of_fortunis` - Axe of Fortunis | On failed attack, mark Stress to reroll attack. | `roll-hook`; equipment-dependent. |
| Void Playtest | `the_void_class_witch:hope:witchs-charm` - Witch's Charm | Spend 3 Hope to change failure into success with Fear. | `roll-hook`; outcome conversion. |
| Void Playtest | `the_void_subclass_pact_of_the_wrathful:foundation:herald-of-death` - Herald of Death | Spend Favor to reroll failed attack; mark Stress if it fails again. | `roll-hook`; requires Favor tracker. |
| Void Playtest | `the_void_subclass_pact_of_the_wrathful:mastery:fearsome-attack` - Fearsome Attack | Spend Favor to reroll damage dice repeatedly. | `roll-hook`; requires Favor tracker. |

## Tokens, Resources, Attack Bonuses, and Damage Bonuses

These entries suggest token/resource trackers or attack/damage roll reminders.

| Source | Entry | Hook | Automation note |
| --- | --- | --- | --- |
| SRD Core | `core_class_bard:feature:rally` - Rally | Once per session, give Rally Dice; PCs spend them to add to action, reaction, damage, or clearing rolls. | `tracker`; already represented in `calculationHints`. |
| SRD Core | `core_class_seraph:feature:prayer-dice` - Prayer Dice | Roll Prayer Dice at session start; spend dice to reduce damage, clear HP/Stress, or improve rolls. | `tracker`; already represented in `calculationHints`. |
| SRD Core | `core_class_sorcerer:feature:channel-raw-power` - Channel Raw Power | Mark Stress to gain damage bonus on damaging spell. | `roll-hook`; damage-roll reminder. |
| SRD Core | `core_class_warrior:feature:combat-training` - Combat Training | Physical damage gains bonus equal to level. | `roll-hook`; damage-roll reminder. |
| SRD Core | `core_class_warrior:hope:no-mercy` - No Mercy | Spend 3 Hope for +1 attack rolls until next rest. | `conditional`; temporary attack modifier. |
| SRD Core | `core_community_seaborne` - Seaborne | Roll with Fear places Tide token; spend tokens for +1 per token on action rolls. | `tracker`; roll-result resource. |
| SRD Core | `core_domain_card_body_basher` - Body Basher | Successful Melee weapon attack gains damage bonus equal to Strength. | `roll-hook`. |
| SRD Core | `core_domain_card_boost` - Boost | Advantage on attack and add d10 to damage roll. | `roll-hook`. |
| SRD Core | `core_domain_card_cruel_precision` - Cruel Precision | Successful weapon attack gains damage bonus equal to Finesse or Agility. | `roll-hook`; trait choice. |
| SRD Core | `core_domain_card_deft_maneuvers` - Deft Maneuvers | Sprint into Melee and immediately attack for +1 attack roll. | `roll-hook`; movement-dependent. |
| SRD Core | `core_domain_card_fane_of_the_wilds` - Fane of the Wilds | Tokens equal Sage cards; spend after Spellcast Roll for +1 each. | `tracker`. |
| SRD Core | `core_domain_card_forceful_push` - Forceful Push | On success with Hope, add d6 to damage roll. | `roll-hook`; Hope outcome. |
| SRD Core | `core_domain_card_forest_sprites` - Forest Sprites | Allies gain +3 attack rolls against targets near sprite. | `conditional`; scene-position dependent. |
| SRD Core | `core_domain_card_inspirational_words` - Inspirational Words | Tokens equal Presence; spend token to give ally benefits. | `tracker`. |
| SRD Core | `core_domain_card_midnight_touched` - Midnight-Touched | Successful attack can mark Stress to add Fear Die to damage. | `roll-hook`; damage modifier. |
| SRD Core | `core_domain_card_natural_familiar` - Natural Familiar | If target is in familiar's Melee, add d6 to damage. | `roll-hook`; scene-position dependent. |
| SRD Core | `core_domain_card_never_upstaged` - Never Upstaged | Store HP-mark tokens; next successful attack gains +5 damage per token. | `tracker`; attack damage spender. |
| SRD Core | `core_domain_card_rage_up` - Rage Up | Before attack, mark Stress for damage bonus equal to twice Strength; twice per attack. | `roll-hook`; repeatable per attack. |
| SRD Core | `core_domain_card_spellcharge` - Spellcharge | Store tokens from magic damage; spend tokens to add d6s to Spellcast Roll. | `tracker`. |
| SRD Core | `core_domain_card_strategic_approach` - Strategic Approach | Tokens equal Knowledge; first Close-range attack can spend token to add Knowledge to attack. | `tracker`. |
| SRD Core | `core_domain_card_twilight_toll` - Twilight Toll | Place tokens on target; spend tokens to add d12s to damage. | `tracker`; target-specific. |
| SRD Core | `core_domain_card_unleash_chaos` - Unleash Chaos | Tokens equal Spellcast trait; spend any number on Spellcast Roll. | `tracker`; roll-spend mechanic. |
| SRD Core | `core_subclass_call_of_the_slayer:foundation:slayer` - Slayer | On roll with Hope, store d6 Slayer Dice instead of Hope; spend dice for attack/damage hooks. | `tracker`; roll-result resource. |
| SRD Core | `core_subclass_syndicate:specialization:contacts-everywhere` - Contacts Everywhere | Contact can add +3 to Hope/Fear Die or add 2d8 to next damage. | `roll-hook`; chosen contact effect. |
| SRD Core | `core_subclass_wordsmith:foundation:heart-of-a-poet` - Heart of a Poet | Spend Hope to add d4 to certain social rolls. | `roll-hook`; social-context dependent. |
| Void Playtest | `the_void_class_assassin:feature:marked-for-death` - Marked for Death | Attacks against marked target gain damage bonus +1d4 per tier. | `roll-hook`; target state. |
| Void Playtest | `the_void_class_warlock:feature:favor` - Favor | Start with 3 Favor; gain Favor during rest by tithing. | `tracker`; already represented in `calculationHints`. |
| Void Playtest | `the_void_class_warlock:hope:patrons-boon` - Patron's Boon | Spend 3 Hope to gain 1d4 Favor. | `tracker`; modifies Favor. |
| Void Playtest | `the_void_subclass_poisoners_guild:foundation:toxic-concoctions` - Toxic Concoctions | Mark Stress to add 1d4+1 poison tokens. | `tracker`. |
| Void Playtest | `the_void_subclass_poisoners_guild:foundation:envenomate` - Envenomate | Spend poison token on successful weapon attack. | `tracker`; attack spender. |
| Void Playtest | `the_void_subclass_poisoners_guild:mastery:venomancer` - Venomancer | Fear Leaf poison adds Fear Die result to damage. | `roll-hook`; poison choice. |
| Void Playtest | `the_void_subclass_poisoners_guild:mastery:twin-fang` - Twin Fang | Spend additional poison token for second poison effect. | `tracker`. |
| Void Playtest | `the_void_subclass_martial_artist:foundation:focus` - Focus | Rest roll creates Focus tokens; spend Focus for stances. | `tracker`. |
| Void Playtest | `the_void_subclass_pact_of_the_wrathful:foundation:favored-weapon` - Favored Weapon | Spend Favor on successful imbued attack for +1d6 damage per Favor. | `tracker`; damage spender. |
| Void Playtest | `the_void_subclass_hedge:specialization:walk-between-worlds` - Walk Between Worlds | Tokens equal Spellcast trait; spend as spirits answer questions. | `tracker`; non-roll utility. |
| Void Playtest | `the_void_subclass_hedge:mastery:circle-of-power` - Circle of Power | Tokens equal Spellcast trait; while active grants thresholds, attack rolls, and Evasion bonuses. | `tracker`; scene aura. |
| Void Playtest | `the_void_domain_card_umbral_veil` - Umbral Veil | Roll with Fear, spend Hope to place tokens; spend tokens for penalties to attacks against you. | `tracker`; defensive roll hook. |
| Void Playtest | `the_void_domain_card_dread_touched` - Dread-Touched | Add +1 to action roll for each GM Fear token. | `roll-hook`; depends on GM Fear pool. |
| Void Playtest | `the_void_domain_card_dark_army` - Dark Army | Place 8 fiend tokens; spend token for +1d8 damage or -1d8 incoming damage. | `tracker`; attack/defense spender. |
| Void Playtest | `the_void_domain_card_avatar_of_terror` - Avatar of Terror | Damage rolls gain +1d6 per GM Fear while transformed. | `roll-hook`; form and GM Fear dependent. |

## Hope/Fear Outcome Hooks

These entries specifically care about rolling with Hope, rolling with Fear, succeeding with Hope, succeeding with Fear, or the GM gaining Fear.

| Source | Entry | Hook | Automation note |
| --- | --- | --- | --- |
| SRD Core | `core_ancestry_infernis` - Infernis | Roll with Fear can be changed to Hope by marking 2 Stress. | `roll-hook`. |
| SRD Core | `core_community_seaborne` - Seaborne | Roll with Fear places a Tide token. | `tracker`; roll-result hook. |
| SRD Core | `core_domain_card_banish` - Banish | When PCs roll with Fear, banished target gets another reaction roll with lower Difficulty. | `roll-hook`; card-state dependent. |
| SRD Core | `core_domain_card_battle_cry` - Battle Cry | Ally attack advantage lasts until a failure with Fear. | `roll-hook`; scene-state duration. |
| SRD Core | `core_domain_card_eclipse` - Eclipse | Ally succeeds with Hope in shadow: target marks Stress. | `roll-hook`; area-state dependent. |
| SRD Core | `core_domain_card_encore` - Encore | Spellcast succeeds with Fear: place card in vault. | `roll-hook`; loadout change. |
| SRD Core | `core_domain_card_final_words` - Final Words | Success with Hope answers more questions than success with Fear. | `roll-hook`; outcome text. |
| SRD Core | `core_domain_card_forceful_push` - Forceful Push | Success with Hope adds d6 damage. | `roll-hook`. |
| SRD Core | `core_domain_card_hold_the_line` - Hold the Line | Effect lasts until movement, failure with Fear, or GM spends Fear. | `roll-hook`; duration tracking. |
| SRD Core | `core_domain_card_midnight_touched` - Midnight-Touched | Add Fear Die result to damage after successful attack. | `roll-hook`. |
| SRD Core | `core_domain_card_natures_tongue` - Nature's Tongue | Roll with Fear limits knowledge or adds cost. | `roll-hook`; narrative reminder. |
| SRD Core | `core_domain_card_second_wind` - Second Wind | Success with Hope also clears ally HP/Stress. | `roll-hook`. |
| SRD Core | `core_domain_card_signature_move` - Signature Move | Use d20 as Hope Die; on success clear Stress. | `roll-hook`. |
| SRD Core | `core_domain_card_stealth_expertise` - Stealth Expertise | Roll with Fear can be converted to Hope. | `roll-hook`. |
| SRD Core | `core_domain_card_tactician` - Tactician | Tag Team Roll can use d20 as Hope Die. | `roll-hook`. |
| SRD Core | `core_domain_card_thought_delver` - Thought Delver | Roll with Fear may reveal mind reading. | `roll-hook`; narrative reminder. |
| SRD Core | `core_subclass_call_of_the_brave:foundation:courage` - Courage | Fail with Fear: gain Hope. | `roll-hook`. |
| SRD Core | `core_subclass_call_of_the_slayer:foundation:slayer` - Slayer | Roll with Hope can store Slayer Die instead of gaining Hope. | `tracker`; roll-result choice. |
| SRD Core | `core_subclass_nightwalker:mastery:vanishing-act` - Vanishing Act | Cloaked until rolling with Fear or next rest. | `roll-hook`; duration tracking. |
| SRD Core | `core_subclass_school_of_war:foundation:face-your-fear` - Face Your Fear | Succeed with Fear on attack: extra 1d10 magic damage. | `roll-hook`. |
| SRD Core | `core_subclass_winged_sentinel:specialization:ethereal-visage` - Ethereal Visage | Succeed with Hope on Presence Roll: remove GM Fear instead of gaining Hope. | `roll-hook`; choice. |
| Void Playtest | `the_void_class_witch:hope:witchs-charm` - Witch's Charm | Failure can become success with Fear. | `roll-hook`. |
| Void Playtest | `the_void_subclass_order_of_the_ghost_slayer:foundation:shadowed-grit` - Shadowed Grit | GM gains Fear from Duality Dice: mark Stress to gain Hope. | `roll-hook`. |
| Void Playtest | `the_void_subclass_pact_of_the_wrathful:specialization:diminish-myfoes` - Diminish MyFoes | Succeed with Hope on action roll: spend Hope to make target mark Stress. | `roll-hook`. |
| Void Playtest | `the_void_domain_card_blighting_strike` - Blighting Strike | Succeed with Fear upgrades damage die. | `roll-hook`. |
| Void Playtest | `the_void_domain_card_siphon_essence` - Siphon Essence | Success with Fear grants +1 Proficiency for the attack. | `roll-hook`. |
| Void Playtest | `the_void_domain_card_umbral_veil` - Umbral Veil | Roll with Fear can create defensive tokens. | `tracker`; roll-result hook. |
| Void Playtest | `the_void_domain_card_terrify` - Terrify | Success with Fear makes target Vulnerable. | `roll-hook`. |
| Void Playtest | `the_void_domain_card_dread_touched` - Dread-Touched | Succeed with Fear can prevent GM gaining Fear. | `roll-hook`. |
| Void Playtest | `the_void_domain_card_eldritch_flesh` - Eldritch Flesh | Roll with Fear can clear Armor Slot by spending Hope. | `roll-hook`. |

## Immediate Follow-Up Candidates

Best candidates for structured hints:
- Add `safe-static` hints for `core_ancestry_giant`, `core_ancestry_simiah`, `the_void_subclass_juggernaut:specialization:rugged`, if the app should preview those derived values.
- Add token hints for `core_community_seaborne`, `core_subclass_call_of_the_slayer:foundation:slayer`, `the_void_subclass_poisoners_guild:foundation:toxic-concoctions`, `the_void_subclass_martial_artist:foundation:focus`, and `the_void_domain_card_dark_army`, if the tracker should suggest more feature resources.
- Keep choice-based entries like `core_domain_card_vitality`, `core_ancestry_clank`, and `core_domain_card_master_of_the_craft` manual until the character builder records the selected option.
