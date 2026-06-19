export default function InnovationContextTester({
  testAppName,
  testWindowTitle,
  suggestion,
  classification,
  patternKeyword,
  patternWeight,
  projectSuggestions = [],
  savingPattern,
  onAppNameChange,
  onWindowTitleChange,
  onClassifyContext,
  onSuggestProject,
  onProjectFeedback,
  onPatternKeywordChange,
  onPatternWeightChange,
  onCreateProjectPattern,
}) {
  function handlePatternSubmit(event) {
    event.preventDefault();
    onCreateProjectPattern();
  }

  return (
    <div className="innovation-card">
      <h2>Tester la classification</h2>

      <input value={testAppName} onChange={(event) => onAppNameChange(event.target.value)} placeholder="Nom de l'application" />

      <input
        value={testWindowTitle}
        onChange={(event) => onWindowTitleChange(event.target.value)}
        placeholder="Titre de fenêtre"
      />

      <div className="innovation-actions">
        <button type="button" onClick={onClassifyContext}>
          Classifier
        </button>
        <button type="button" onClick={onSuggestProject}>
          Suggérer projet
        </button>
      </div>

      {suggestion && (
        <div className="innovation-project-pattern">
          <div className="innovation-result">
            Projet suggéré : <strong>{suggestion.nom}</strong>
            <br />
            Confiance : {suggestion.confidence} %
          </div>

          <div className="innovation-actions">
            <button type="button" onClick={() => onProjectFeedback("confirmed")}>
              Accepter
            </button>
            <button type="button" onClick={() => onProjectFeedback("rejected")}>
              Refuser
            </button>
          </div>

          {projectSuggestions.length > 1 && (
            <div className="innovation-suggestion-list">
              <strong>Autres choix possibles</strong>
              {projectSuggestions
                .filter((project) => project.id !== suggestion.id)
                .map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    className="innovation-suggestion-choice"
                    onClick={() => onProjectFeedback("corrected", project)}>
                    {project.nom} ({project.confidence}%)
                  </button>
                ))}
            </div>
          )}

          <form className="innovation-pattern-form" onSubmit={handlePatternSubmit}>
            <label>
              Pattern projet (keyword)
              <input
                value={patternKeyword}
                onChange={(event) => onPatternKeywordChange(event.target.value)}
                placeholder="Ex: clientX, projet-foo"
              />
            </label>

            <label>
              Poids
              <input
                type="number"
                min="0"
                max="10"
                value={patternWeight}
                onChange={(event) => onPatternWeightChange(event.target.value)}
              />
            </label>

            <button type="submit" disabled={savingPattern}>
              {savingPattern ? "Création..." : "Créer le pattern"}
            </button>
          </form>
        </div>
      )}

      {classification && (
        <div className="innovation-result">
          Catégorie : <strong>{classification.category || "Non classé"}</strong>
          <br />
          Tag : {classification.tag || "Aucun"}
          <br />
          Confiance : {classification.confidence ?? 0}%
          <br />
          Source : {classification.source || "n/a"}
        </div>
      )}
    </div>
  );
}
