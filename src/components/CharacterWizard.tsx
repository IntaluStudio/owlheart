import { ChevronLeft, ChevronRight, Save, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { SuggestionPreviewCard } from "./SuggestionPreviewCard";
import { getAvailableDomainCardsForBuild } from "../lib/buildFiltering";
import { buildDerivations } from "../lib/buildDerivations";
import {
  WIZARD_DOMAIN_CARD_LIMIT,
  WIZARD_STEPS,
  applyWizardClassSelection,
  applyWizardSubclassSelection,
  createWizardDraft,
  getWizardAvailableClasses,
  getWizardSubclasses,
  setWizardEquipment,
  toggleWizardEquipment,
  validateWizardBuild,
} from "../lib/characterWizard";
import { getContentByType } from "../lib/contentIndex";
import { createLocalId } from "../lib/importExport";
import { applySuggestedClassReference, previewSuggestedClassReference } from "../lib/suggestedBuilds";
import { TRAIT_KEYS, type CharacterBuild, type CharacterDescription, type CharacterExperience, type ContentEntry, type TraitKey } from "../lib/types";

type CharacterWizardProps = {
  entries: ContentEntry[];
  onFinish: (build: CharacterBuild) => void;
  onCancel?: () => void;
  initialDraft?: CharacterBuild;
};

const TRAIT_LABELS: Record<TraitKey, string> = {
  agility: "Agility",
  strength: "Strength",
  finesse: "Finesse",
  instinct: "Instinct",
  presence: "Presence",
  knowledge: "Knowledge",
};

function getStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function equipmentType(entry: ContentEntry) {
  return typeof entry.system?.equipmentType === "string" ? entry.system.equipmentType : undefined;
}

function equipmentTier(entry: ContentEntry) {
  return typeof entry.system?.tier === "number" ? entry.system.tier : 1;
}

function isPrimaryWeapon(entry: ContentEntry) {
  return equipmentType(entry) === "weapon" && entry.tags.some((tag) => tag === "primary" || tag.startsWith("primary-"));
}

function isSecondaryWeapon(entry: ContentEntry) {
  return equipmentType(entry) === "weapon" && entry.tags.includes("secondary");
}

function isArmor(entry: ContentEntry) {
  return equipmentType(entry) === "armor" || entry.tags.includes("armor");
}

function isConsumable(entry: ContentEntry) {
  return equipmentType(entry) === "consumable";
}

function selectedLabel(entries: ContentEntry[], id: string | undefined) {
  return entries.find((entry) => entry.id === id)?.name ?? "None selected";
}

function entrySummary(entry: ContentEntry) {
  const text = entry.text || entry.description || "";
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function toggleId(list: string[], id: string, max?: number) {
  if (list.includes(id)) {
    return list.filter((value) => value !== id);
  }

  if (max !== undefined && list.length >= max) {
    return [...list.slice(1), id];
  }

  return [...list, id];
}

function modifierLabel(value: number) {
  return value >= 0 ? `+${value}` : String(value);
}

function emptyExperience(build: CharacterBuild): CharacterExperience {
  return {
    id: createLocalId("experience", `${build.name}-wizard-experience`),
    name: `Experience ${build.experiences.length + 1}`,
    modifier: 2,
  };
}

export function CharacterWizard({ entries, onFinish, onCancel, initialDraft }: CharacterWizardProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [draft, setDraft] = useState<CharacterBuild>(() => initialDraft ?? createWizardDraft());
  const activeStep = WIZARD_STEPS[activeStepIndex];
  const suggestionPreview = useMemo(() => previewSuggestedClassReference(draft, entries), [draft, entries]);
  const reference = suggestionPreview.reference;
  const validationErrors = useMemo(() => validateWizardBuild(draft, entries), [draft, entries]);
  const classes = useMemo(() => getWizardAvailableClasses(entries), [entries]);
  const subclasses = useMemo(() => getWizardSubclasses(entries, draft.classId), [draft.classId, entries]);
  const ancestries = useMemo(() => getContentByType(entries, "ancestry"), [entries]);
  const communities = useMemo(() => getContentByType(entries, "community"), [entries]);
  const derivation = useMemo(() => buildDerivations(draft, entries), [draft, entries]);
  const tierOneEquipment = useMemo(
    () => getContentByType(entries, "item").filter((entry) => equipmentTier(entry) <= 1),
    [entries],
  );
  const primaryWeapons = useMemo(() => tierOneEquipment.filter(isPrimaryWeapon), [tierOneEquipment]);
  const secondaryWeapons = useMemo(() => tierOneEquipment.filter(isSecondaryWeapon), [tierOneEquipment]);
  const armor = useMemo(() => tierOneEquipment.filter(isArmor), [tierOneEquipment]);
  const consumables = useMemo(() => tierOneEquipment.filter(isConsumable), [tierOneEquipment]);
  const availableCards = useMemo(
    () => getAvailableDomainCardsForBuild(entries, draft).filter((entry) => (entry.level ?? 1) <= 1),
    [draft, entries],
  );

  const patchDraft = (patch: Partial<CharacterBuild>) => setDraft((current) => ({ ...current, ...patch }));

  const updateTrait = (trait: TraitKey, value: number) => {
    setDraft((current) => ({
      ...current,
      traits: {
        ...current.traits,
        [trait]: value,
      },
    }));
  };

  const updateDescription = (field: keyof CharacterDescription, value: string) => {
    setDraft((current) => ({
      ...current,
      description: {
        ...current.description,
        [field]: value,
      },
    }));
  };

  const updateExperience = (experienceId: string, patch: Partial<CharacterExperience>) => {
    setDraft((current) => ({
      ...current,
      experiences: current.experiences.map((experience) =>
        experience.id === experienceId ? { ...experience, ...patch } : experience,
      ),
    }));
  };

  const goNext = () => setActiveStepIndex((index) => Math.min(WIZARD_STEPS.length - 1, index + 1));
  const goBack = () => setActiveStepIndex((index) => Math.max(0, index - 1));

  const saveBuild = () => {
    if (validationErrors.length) {
      return;
    }

    onFinish({
      ...draft,
      name: draft.name.trim(),
      pronouns: draft.pronouns?.trim(),
    });
  };

  const renderChoiceButton = (
    entry: ContentEntry,
    selected: boolean,
    onClick: () => void,
    meta?: string,
  ) => (
    <button key={entry.id} type="button" className={selected ? "wizard-choice wizard-choice--selected" : "wizard-choice"} onClick={onClick}>
      <strong>{entry.name}</strong>
      <span>{meta ?? entry.source}</span>
      <small>{entrySummary(entry)}</small>
    </button>
  );

  const stepContent = () => {
    switch (activeStep.id) {
      case "class":
        return (
          <>
            <div className="wizard-reference-card">
              <span>Class source</span>
              <strong>{reference ? `${reference.className} sheet defaults` : "Choose a class to load sheet defaults"}</strong>
              <p>{reference ? `${reference.source.pdf} p.${reference.source.pdfPage}` : "Suggested traits, weapons, armor, inventory, and prompts load from structured sheet data."}</p>
            </div>
            {suggestionPreview.reference ? (
              <SuggestionPreviewCard
                preview={suggestionPreview}
                onApply={() => setDraft((current) => applySuggestedClassReference(current, entries))}
              />
            ) : null}
            <div className="wizard-choice-grid">
              {classes.map((entry) =>
                renderChoiceButton(
                  entry,
                  draft.classId === entry.id,
                  () => setDraft((current) => applyWizardClassSelection(current, entries, entry.id)),
                  getStringArray(entry.system?.domainIds ?? entry.domains).join(" & "),
                ),
              )}
              {classes.length === 0 ? <p className="empty-state wizard-empty-state">No classes available.</p> : null}
            </div>
            <label>
              <span>Subclass</span>
              <select
                value={draft.subclassId ?? ""}
                onChange={(event) => setDraft((current) => applyWizardSubclassSelection(current, entries, event.currentTarget.value))}
              >
                <option value="">None selected</option>
                {subclasses.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        );
      case "ancestry":
        return (
          <div className="wizard-choice-grid">
            {ancestries.map((entry) => renderChoiceButton(entry, draft.ancestryId === entry.id, () => patchDraft({ ancestryId: entry.id })))}
            {ancestries.length === 0 ? <p className="empty-state wizard-empty-state">No ancestries available.</p> : null}
          </div>
        );
      case "community":
        return (
          <div className="wizard-choice-grid">
            {communities.map((entry) => renderChoiceButton(entry, draft.communityId === entry.id, () => patchDraft({ communityId: entry.id })))}
            {communities.length === 0 ? <p className="empty-state wizard-empty-state">No communities available.</p> : null}
          </div>
        );
      case "traits":
        return (
          <>
            <div className="wizard-trait-grid">
              {TRAIT_KEYS.map((trait) => (
                <label key={trait} className="wizard-trait">
                  <span>{TRAIT_LABELS[trait]}</span>
                  <strong>{modifierLabel(draft.traits[trait])}</strong>
                  <input type="number" min={-1} max={2} value={draft.traits[trait]} onChange={(event) => updateTrait(trait, Number(event.currentTarget.value))} />
                </label>
              ))}
            </div>
            <button
              type="button"
              className="button"
              disabled={!reference}
              onClick={() => reference && patchDraft({ traits: reference.traits })}
            >
              <Sparkles size={16} aria-hidden="true" />
              Reset to suggested class traits
            </button>
          </>
        );
      case "weapons":
        return (
          <>
            <h3 className="wizard-section-title">Primary weapon</h3>
            <div className="wizard-choice-grid wizard-choice-grid--compact">
              {primaryWeapons.map((entry) =>
                renderChoiceButton(entry, draft.selectedEquipment.includes(entry.id), () => {
                  const withoutPrimary = draft.selectedEquipment.filter((id) => !primaryWeapons.some((weapon) => weapon.id === id));
                  setDraft(setWizardEquipment(draft, entries, [...withoutPrimary, entry.id]));
                }),
              )}
              {primaryWeapons.length === 0 ? <p className="empty-state wizard-empty-state">No primary weapons available.</p> : null}
            </div>
            <h3 className="wizard-section-title">Secondary weapon</h3>
            <div className="wizard-choice-grid wizard-choice-grid--compact">
              {secondaryWeapons.map((entry) =>
                renderChoiceButton(entry, draft.selectedEquipment.includes(entry.id), () => {
                  const withoutSecondary = draft.selectedEquipment.filter((id) => !secondaryWeapons.some((weapon) => weapon.id === id));
                  setDraft(setWizardEquipment(draft, entries, draft.selectedEquipment.includes(entry.id) ? withoutSecondary : [...withoutSecondary, entry.id]));
                }),
              )}
              {secondaryWeapons.length === 0 ? <p className="empty-state wizard-empty-state">No secondary weapons available.</p> : null}
            </div>
          </>
        );
      case "armor":
        return (
          <>
            <div className="wizard-stat-row">
              <div>
                <span>Armor</span>
                <strong>{draft.status.armorScore}</strong>
              </div>
              <div>
                <span>Evasion</span>
                <strong>{draft.status.evasion}</strong>
              </div>
              <div>
                <span>Major</span>
                <strong>{draft.status.majorThreshold}</strong>
              </div>
              <div>
                <span>Severe</span>
                <strong>{draft.status.severeThreshold}</strong>
              </div>
            </div>
            <div className="wizard-choice-grid wizard-choice-grid--compact">
              {armor.map((entry) =>
                renderChoiceButton(entry, draft.selectedEquipment.includes(entry.id), () => {
                  const withoutArmor = draft.selectedEquipment.filter((id) => !armor.some((armorEntry) => armorEntry.id === id));
                  setDraft(setWizardEquipment(draft, entries, [...withoutArmor, entry.id]));
                }),
              )}
              {armor.length === 0 ? <p className="empty-state wizard-empty-state">No armor available.</p> : null}
            </div>
          </>
        );
      case "inventory":
        return (
          <>
            <div className="wizard-pill-row">
              {(reference?.inventory.always ?? []).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            {reference?.inventory.choices.map((choice) => (
              <div key={choice.id} className="wizard-choice-block">
                <h3 className="wizard-section-title">{choice.label}</h3>
                <div className="wizard-pill-row">
                  {choice.options.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      className={option.contentId && draft.selectedEquipment.includes(option.contentId) ? "wizard-pill wizard-pill--selected" : "wizard-pill"}
                      onClick={() => {
                        if (option.contentId) {
                          setDraft((current) => toggleWizardEquipment(current, entries, option.contentId as string));
                        }
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="wizard-choice-grid wizard-choice-grid--compact">
              {consumables.slice(0, 8).map((entry) =>
                renderChoiceButton(entry, draft.selectedEquipment.includes(entry.id), () =>
                  setDraft((current) => toggleWizardEquipment(current, entries, entry.id)),
                ),
              )}
              {consumables.length === 0 ? <p className="empty-state wizard-empty-state">No consumables available.</p> : null}
            </div>
          </>
        );
      case "description":
        return (
          <>
            {reference?.descriptionPrompts.map((prompt) => (
              <label key={prompt.id}>
                <span>{prompt.label}</span>
                <input
                  value={String(draft.description?.[prompt.id] ?? "")}
                  onChange={(event) => updateDescription(prompt.id, event.currentTarget.value)}
                  placeholder="Choose one or write your own"
                />
                <div className="wizard-pill-row">
                  {prompt.options.map((option) => (
                    <button key={option} type="button" className="wizard-pill" onClick={() => updateDescription(prompt.id, option)}>
                      {option}
                    </button>
                  ))}
                </div>
              </label>
            ))}
            <label>
              <span>Additional description</span>
              <textarea value={draft.description?.notes ?? ""} onChange={(event) => updateDescription("notes", event.currentTarget.value)} rows={3} />
            </label>
          </>
        );
      case "experiences":
        return (
          <>
            <div className="experience-editor">
              {draft.experiences.map((experience) => (
                <div key={experience.id} className="experience-editor__row">
                  <label>
                    <span>Name</span>
                    <input value={experience.name} onChange={(event) => updateExperience(experience.id, { name: event.currentTarget.value })} />
                  </label>
                  <label>
                    <span>Modifier</span>
                    <input type="number" value={experience.modifier} onChange={(event) => updateExperience(experience.id, { modifier: Number(event.currentTarget.value) })} />
                  </label>
                </div>
              ))}
            </div>
            <button type="button" className="button" onClick={() => patchDraft({ experiences: [...draft.experiences, emptyExperience(draft)] })}>
              Add experience
            </button>
          </>
        );
      case "domains":
        return (
          <>
            <div className="wizard-count-row">
              <strong>
                {draft.selectedDomainCards.length} / {WIZARD_DOMAIN_CARD_LIMIT}
              </strong>
              <span>{WIZARD_DOMAIN_CARD_LIMIT} starting domain cards</span>
            </div>
            <div className="wizard-choice-grid wizard-choice-grid--compact">
              {availableCards.map((entry) =>
                renderChoiceButton(
                  entry,
                  draft.selectedDomainCards.includes(entry.id),
                  () => patchDraft({ selectedDomainCards: toggleId(draft.selectedDomainCards, entry.id, WIZARD_DOMAIN_CARD_LIMIT) }),
                  `${entry.domain ?? "Domain"} L${entry.level ?? 1}`,
                ),
              )}
              {availableCards.length === 0 ? (
                <p className="empty-state wizard-empty-state">No starting domain cards available for this class.</p>
              ) : null}
            </div>
          </>
        );
      case "questions":
        return (
          <>
            {draft.backgroundAnswers?.map((answer) => (
              <label key={answer.id}>
                <span>{answer.prompt}</span>
                <textarea
                  value={answer.answer}
                  rows={3}
                  onChange={(event) =>
                    patchDraft({
                      backgroundAnswers: draft.backgroundAnswers?.map((item) =>
                        item.id === answer.id ? { ...item, answer: event.currentTarget.value } : item,
                      ),
                    })
                  }
                />
              </label>
            ))}
            {draft.connections?.map((connection) => (
              <div key={connection.id} className="wizard-connection">
                <label>
                  <span>{connection.prompt}</span>
                  <input
                    value={connection.name}
                    onChange={(event) =>
                      patchDraft({
                        connections: draft.connections?.map((item) =>
                          item.id === connection.id ? { ...item, name: event.currentTarget.value } : item,
                        ),
                      })
                    }
                    placeholder="Name of connection"
                  />
                </label>
                <textarea
                  value={connection.answer}
                  rows={3}
                  onChange={(event) =>
                    patchDraft({
                      connections: draft.connections?.map((item) =>
                        item.id === connection.id ? { ...item, answer: event.currentTarget.value } : item,
                      ),
                    })
                  }
                  placeholder="Describe your answer"
                />
              </div>
            ))}
          </>
        );
      case "name":
        return (
          <div className="form-grid">
            <label>
              <span>Name</span>
              <input value={draft.name} onChange={(event) => patchDraft({ name: event.currentTarget.value })} />
            </label>
            <label>
              <span>Pronouns</span>
              <input value={draft.pronouns ?? ""} onChange={(event) => patchDraft({ pronouns: event.currentTarget.value })} placeholder="Enter pronouns" />
            </label>
          </div>
        );
      case "review":
        return (
          <>
            <div className="wizard-review-grid">
              <div>
                <span>Class</span>
                <strong>{selectedLabel(entries, draft.classId)}</strong>
              </div>
              <div>
                <span>Ancestry</span>
                <strong>{selectedLabel(entries, draft.ancestryId)}</strong>
              </div>
              <div>
                <span>Community</span>
                <strong>{selectedLabel(entries, draft.communityId)}</strong>
              </div>
              <div>
                <span>Domain cards</span>
                <strong>{draft.selectedDomainCards.length} / {WIZARD_DOMAIN_CARD_LIMIT}</strong>
              </div>
              <div>
                <span>Primary weapon</span>
                <strong>{derivation.primaryWeapons.map((entry) => entry.name).join(", ") || "None"}</strong>
              </div>
              <div>
                <span>Armor</span>
                <strong>{derivation.armor?.name ?? "None"}</strong>
              </div>
            </div>
            {validationErrors.length ? (
              <div className="wizard-warning-list">
                {validationErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            ) : (
              <p className="status-line">Ready to save to Quick Reference.</p>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <section className="character-wizard" aria-label="Wizard Builder">
      <header className="wizard-header">
        <span>{activeStep.number}</span>
        <h2>{activeStep.title}</h2>
        <p>Wizard Builder</p>
      </header>

      <nav className="wizard-step-nav" aria-label="Wizard steps">
        {WIZARD_STEPS.map((step, index) => (
          <button
            key={step.id}
            type="button"
            title={step.title}
            className={index === activeStepIndex ? "wizard-step-tab wizard-step-tab--active" : "wizard-step-tab"}
            onClick={() => setActiveStepIndex(index)}
          >
            <span>{step.number}</span>
            {step.shortLabel}
          </button>
        ))}
      </nav>

      <div className="wizard-body">{stepContent()}</div>

      <footer className="wizard-footer">
        <div>
          {validationErrors.length ? (
            <span>{validationErrors[0]}</span>
          ) : (
            <span>{WIZARD_DOMAIN_CARD_LIMIT} starting domain cards selected and required fields complete.</span>
          )}
          <small>{WIZARD_DOMAIN_CARD_LIMIT} starting domain cards required.</small>
        </div>
        <div className="wizard-footer__actions">
          {onCancel ? (
            <button type="button" className="button" onClick={onCancel}>
              <X size={16} aria-hidden="true" />
              Cancel
            </button>
          ) : null}
          <button type="button" className="button" onClick={goBack} disabled={activeStepIndex === 0}>
            <ChevronLeft size={16} aria-hidden="true" />
            Back
          </button>
          {activeStep.id === "review" ? (
            <button type="button" className="button button--primary" disabled={validationErrors.length > 0} onClick={saveBuild}>
              <Save size={16} aria-hidden="true" />
              Save character
            </button>
          ) : (
            <button type="button" className="button button--primary" onClick={goNext}>
              Next
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
