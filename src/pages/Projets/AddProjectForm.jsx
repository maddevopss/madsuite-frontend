import { memo } from "react";
import { Button, Input, Select } from "../../components/ui";

const emptyForm = {
  client_id: "",
  nom: "",
  description: "",
  date_fin: "",
  budget: "",
  budget_hours: "",
  budget_amount: "",
  taux_horaire: "",
  status: "actif",
  couleur: "",
  billing_increment: 1,
  billing_rounding_type: "exact",
};

const COLORS = ["#1884df", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

function AddProjectForm({ clients = [], form = emptyForm, setForm, onSubmit, onCancel }) {
  const safeForm = form || emptyForm;

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...(prev || emptyForm),
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="project-form" onSubmit={handleSubmit} noValidate>
      <Input
        placeholder="Nom du projet"
        value={safeForm.nom || ""}
        onChange={(e) => updateField("nom", e.target.value)}
        required
      />

      <Select value={safeForm.client_id || ""} onChange={(e) => updateField("client_id", e.target.value)} required>
        <option value="">Sélectionner un client</option>

        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nom || c.client_nom || "Client sans nom"}
          </option>
        ))}
      </Select>

      <Input
        placeholder="Description"
        value={safeForm.description || ""}
        onChange={(e) => updateField("description", e.target.value)}
      />

      <Input type="date" value={safeForm.date_fin || ""} onChange={(e) => updateField("date_fin", e.target.value)} />

      <Input
        type="number"
        placeholder="Budget global (obsolète, gardé pour rétrocompatibilité)"
        value={safeForm.budget || ""}
        onChange={(e) => updateField("budget", e.target.value)}
      />

      <div style={{ display: "flex", gap: "1rem" }}>
        <Input
          type="number"
          placeholder="Budget en Heures"
          value={safeForm.budget_hours || ""}
          onChange={(e) => updateField("budget_hours", e.target.value)}
        />
        <Input
          type="number"
          placeholder="Budget en Montant ($)"
          value={safeForm.budget_amount || ""}
          onChange={(e) => updateField("budget_amount", e.target.value)}
        />
      </div>

      <Input
        type="number"
        placeholder="Taux horaire"
        value={safeForm.taux_horaire || ""}
        onChange={(e) => updateField("taux_horaire", e.target.value)}
      />

      <Select value={safeForm.status || "actif"} onChange={(e) => updateField("status", e.target.value)}>
        <option value="actif">Actif</option>
        <option value="pause">Pause</option>
        <option value="termine">Terminé</option>
        <option value="archive">Archivé</option>
      </Select>

      <div style={{ display: "flex", gap: "1rem" }}>
        <Input
          type="number"
          placeholder="Incrément facturation (min)"
          value={safeForm.billing_increment || ""}
          onChange={(e) => updateField("billing_increment", Number(e.target.value))}
        />
        <Select value={safeForm.billing_rounding_type || "exact"} onChange={(e) => updateField("billing_rounding_type", e.target.value)}>
          <option value="exact">Temps exact</option>
          <option value="nearest">Arrondi au plus proche</option>
          <option value="up">Arrondi au supérieur</option>
        </Select>
      </div>

      <div className="color-presets">
        {COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`color-preset ${safeForm.couleur === color ? "color-preset--active" : ""}`}
            style={{ backgroundColor: color }}
            onClick={() => updateField("couleur", color)}
          />
        ))}
      </div>

      <Input type="color" value={safeForm.couleur || "#1884df"} onChange={(e) => updateField("couleur", e.target.value)} />

      <div className="modal-actions">
        <Button type="submit" variant="primary">
          Ajouter
        </Button>

        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

export default memo(AddProjectForm);
