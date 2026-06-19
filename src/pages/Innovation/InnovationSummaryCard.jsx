import { useEffect, useState } from "react";

export default function InnovationSummaryCard({ summary, saving, onSave }) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setDraft(summary?.summary_text || "");
  }, [summary?.summary_text]);

  function handleSubmit(event) {
    event.preventDefault();
    onSave(draft);
  }

  return (
    <div className="innovation-card">
      <div className="innovation-card-title-row">
        <h2>Resume de journee</h2>
        {summary?.is_edited && <span className="innovation-pill active">modifie</span>}
      </div>

      {summary ? (
        <form className="innovation-summary-form" onSubmit={handleSubmit}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={12}
            placeholder="Resume de la journee"
          />

          <div className="innovation-actions">
            <button type="submit" disabled={saving || !draft.trim()}>
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            {summary.generated_summary_text && summary.generated_summary_text !== draft && (
              <button type="button" onClick={() => setDraft(summary.generated_summary_text)}>
                Revenir au genere
              </button>
            )}
          </div>
        </form>
      ) : (
        <p>Aucun resume disponible.</p>
      )}
    </div>
  );
}
