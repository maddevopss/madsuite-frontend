export default function InnovationRuleManager({
  rules,
  ruleForm,
  editingRuleId,
  savingRule,
  onFieldChange,
  onSaveRule,
  onResetRuleForm,
  onEditRule,
  onToggleRule,
  onDeleteRule,
}) {
  return (
    <div className="innovation-card innovation-card-wide">
      <h2>Règles d'activité configurables</h2>
      <p className="innovation-muted">
        Ces règles permettent à l'admin d'enseigner à MADSuite comment classifier les apps et titres de fenêtres.
      </p>

      <form className="innovation-rule-form" onSubmit={onSaveRule}>
        <label>
          App pattern
          <input
            value={ruleForm.app_pattern}
            onChange={(event) => onFieldChange("app_pattern", event.target.value)}
            placeholder="Ex: Code, Chrome, Excel"
          />
        </label>

        <label>
          Titre contient
          <input
            value={ruleForm.title_pattern || ""}
            onChange={(event) => onFieldChange("title_pattern", event.target.value)}
            placeholder="Ex: MADSuite, localhost, client X"
          />
        </label>

        <label>
          Catégorie
          <input
            value={ruleForm.category}
            onChange={(event) => onFieldChange("category", event.target.value)}
            placeholder="Ex: Développement"
          />
        </label>

        <label>
          Tag
          <input
            value={ruleForm.tag || ""}
            onChange={(event) => onFieldChange("tag", event.target.value)}
            placeholder="Ex: dev, admin, meeting"
          />
        </label>

        <label>
          Confiance
          <input
            type="number"
            min="0"
            max="100"
            value={ruleForm.confidence}
            onChange={(event) => onFieldChange("confidence", event.target.value)}
          />
        </label>

        <label>
          Priorité
          <input
            type="number"
            min="0"
            max="1000"
            value={ruleForm.priority}
            onChange={(event) => onFieldChange("priority", event.target.value)}
          />
        </label>

        <label className="innovation-check">
          <input
            type="checkbox"
            checked={ruleForm.is_productive}
            onChange={(event) => onFieldChange("is_productive", event.target.checked)}
          />
          Productif
        </label>

        <label className="innovation-check">
          <input
            type="checkbox"
            checked={ruleForm.active}
            onChange={(event) => onFieldChange("active", event.target.checked)}
          />
          Active
        </label>

        <div className="innovation-actions">
          <button type="submit" disabled={savingRule}>
            {editingRuleId ? "Mettre à jour" : "Créer la règle"}
          </button>

          {editingRuleId && (
            <button type="button" onClick={onResetRuleForm}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="innovation-rule-list">
        {rules.length === 0 ? (
          <p>Aucune règle configurée.</p>
        ) : (
          rules.map((rule) => (
            <div className="innovation-rule-row" key={rule.id}>
              <div>
                <strong>{rule.app_pattern}</strong>
                <span>{rule.title_pattern || "Tous les titres"}</span>
              </div>

              <div>
                <span>{rule.category}</span>
                <small>
                  {rule.tag || "Sans tag"} · {rule.confidence}% · priorité {rule.priority}
                </small>
              </div>

              <div className="innovation-rule-status">
                <span className={rule.active ? "innovation-pill active" : "innovation-pill inactive"}>
                  {rule.active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="innovation-row-actions">
                <button type="button" onClick={() => onEditRule(rule.id)}>
                  Modifier
                </button>
                <button type="button" onClick={() => onToggleRule(rule.id)}>
                  {rule.active ? "Désactiver" : "Activer"}
                </button>
                <button type="button" onClick={() => onDeleteRule(rule.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
