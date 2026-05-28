import { Sparkles } from "lucide-react";
import type { SuggestedClassPreview } from "../lib/suggestedBuilds";

type SuggestionPreviewCardProps = {
  preview: SuggestedClassPreview;
  onApply?: () => void;
};

function changedCount(preview: SuggestedClassPreview) {
  return (
    preview.traits.filter((item) => item.changed).length +
    preview.equipment.filter((item) => item.changed).length +
    preview.status.filter((item) => item.changed).length +
    (preview.inventory.changed ? 1 : 0)
  );
}

export function SuggestionPreviewCard({ preview, onApply }: SuggestionPreviewCardProps) {
  if (!preview.reference) {
    return null;
  }

  const title = preview.reference.variantLabel
    ? `${preview.reference.className} - ${preview.reference.variantLabel}`
    : preview.reference.className;
  const traitChanges = preview.traits.filter((item) => item.changed);
  const equipmentChanges = preview.equipment.filter((item) => item.changed);
  const statusChanges = preview.status.filter((item) => item.changed);

  return (
    <section className="suggestion-preview-card" aria-label="Suggestion preview">
      <div className="selection-section__header">
        <div>
          <h3>Suggestion preview</h3>
          <p className="status-line">
            {title} source p.{preview.reference.source.pdfPage}
          </p>
        </div>
        <button type="button" className="button" onClick={onApply} disabled={!preview.hasChanges || !onApply}>
          <Sparkles size={16} aria-hidden="true" />
          Apply suggestions
        </button>
      </div>

      {preview.hasChanges ? (
        <p className="status-line">{changedCount(preview)} suggested updates found.</p>
      ) : (
        <p className="status-line">Already matches suggestions.</p>
      )}

      {equipmentChanges.length ? (
        <div className="suggestion-preview-grid" aria-label="Suggested equipment changes">
          {equipmentChanges.map((item) => (
            <div key={item.slot} className="suggestion-preview-row">
              <span>{item.label}</span>
              <strong>
                {item.currentName} -&gt; {item.suggestedName}
              </strong>
            </div>
          ))}
        </div>
      ) : null}

      {traitChanges.length ? (
        <div className="suggestion-preview-grid" aria-label="Suggested trait changes">
          {traitChanges.map((item) => (
            <div key={item.key} className="suggestion-preview-row">
              <span>{item.label}</span>
              <strong>
                {item.current >= 0 ? `+${item.current}` : item.current} -&gt;{" "}
                {item.suggested >= 0 ? `+${item.suggested}` : item.suggested}
              </strong>
            </div>
          ))}
        </div>
      ) : null}

      {statusChanges.length ? (
        <div className="suggestion-preview-grid" aria-label="Suggested reference stat changes">
          {statusChanges.map((item) => (
            <div key={item.field} className="suggestion-preview-row">
              <span>{item.label}</span>
              <strong>
                {item.current ?? "None"} -&gt; {item.suggested ?? "None"}
              </strong>
            </div>
          ))}
        </div>
      ) : null}

      {preview.inventory.changed ? <p className="status-line">Suggested inventory note block will be refreshed.</p> : null}

      {preview.warnings.length ? (
        <div className="wizard-warning-list">
          {preview.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
