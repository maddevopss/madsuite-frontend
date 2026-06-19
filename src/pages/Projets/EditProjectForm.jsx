import { memo } from "react";
import { Button, Input, Select } from "../../components/ui";

const presetColors = ["#1884df", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

function EditProjectForm({ project, clients = [], editForm, setEditForm, onSubmit, onCancel }) {
  if (!project) return null;

  const updateField = (key, value) => {
    setEditForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const currentColor = editForm.couleur || "#1884df";
  const isCustomColor = !presetColors.includes(currentColor);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="edit-project-form" onSubmit={handleSubmit} noValidate>
      <Input
        placeholder="Nom du projet"
        value={editForm.nom || ""}
        onChange={(e) => updateField("nom", e.target.value)}
        required
      />

      <Select value={editForm.client_id || ""} onChange={(e) => updateField("client_id", e.target.value)} required>
        <option value="">Sélectionner un client</option>

        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nom || c.client_nom || "Client sans nom"}
          </option>
        ))}
      </Select>

      <Input
        placeholder="Description"
        value={editForm.description || ""}
        onChange={(e) => updateField("description", e.target.value)}
      />

      <Input type="date" value={editForm.date_fin || ""} onChange={(e) => updateField("date_fin", e.target.value)} />

      <Input
        type="number"
        placeholder="Budget global (obsolète)"
        value={editForm.budget || ""}
        onChange={(e) => updateField("budget", e.target.value)}
      />

      <div style={{ display: "flex", gap: "1rem" }}>
        <Input
          type="number"
          placeholder="Budget en Heures"
          value={editForm.budget_hours || ""}
          onChange={(e) => updateField("budget_hours", e.target.value)}
        />
        <Input
          type="number"
          placeholder="Budget en Montant ($)"
          value={editForm.budget_amount || ""}
          onChange={(e) => updateField("budget_amount", e.target.value)}
        />
      </div>

      <Input
        type="number"
        placeholder="Taux horaire"
        value={editForm.taux_horaire || ""}
        onChange={(e) => updateField("taux_horaire", e.target.value)}
      />

      <Select value={editForm.status || "actif"} onChange={(e) => updateField("status", e.target.value)}>
        <option value="actif">Actif</option>
        <option value="pause">Pause</option>
        <option value="termine">Terminé</option>
        <option value="archive">Archivé</option>
      </Select>

      <div style={{ display: "flex", gap: "1rem" }}>
        <Input
          type="number"
          placeholder="Incrément facturation (min)"
          value={editForm.billing_increment || ""}
          onChange={(e) => updateField("billing_increment", Number(e.target.value))}
        />
        <Select value={editForm.billing_rounding_type || "exact"} onChange={(e) => updateField("billing_rounding_type", e.target.value)}>
          <option value="exact">Temps exact</option>
          <option value="nearest">Arrondi au plus proche</option>
          <option value="up">Arrondi au supérieur</option>
        </Select>
      </div>

      <div className="color-presets">
        {presetColors.map((color) => (
          <button
            key={color}
            type="button"
            className={`color-preset ${currentColor === color ? "color-preset--active" : ""}`}
            style={{ backgroundColor: color }}
            onClick={() => updateField("couleur", color)}
          />
        ))}

        {isCustomColor && (
          <div className="color-custom">
            <div className="color-preset color-preset--active" style={{ backgroundColor: currentColor }} />

            <span>Perso</span>
          </div>
        )}
      </div>

      <div className="color-picker-wrapper" style={{ borderColor: currentColor }}>
        <label className="color-picker-card" style={{ borderColor: currentColor }}>
          <div className="color-picker-preview">
            <div className="color-picker-dot" style={{ backgroundColor: currentColor }} />

            <div>
              <strong>Personnalisation</strong>
              <p>{currentColor}</p>
            </div>
          </div>

          <input
            type="color"
            value={currentColor}
            onChange={(e) => updateField("couleur", e.target.value)}
            className="color-picker-input"
          />
        </label>
      </div>

      <div className="modal-actions">
        <Button type="submit" variant="primary">
          Sauvegarder
        </Button>

        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

export default memo(EditProjectForm);
