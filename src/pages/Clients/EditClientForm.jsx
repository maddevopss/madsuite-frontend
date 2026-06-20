import { memo } from "react";
import { Button, Input } from "../../components/ui";

function EditClientForm({ client, editForm, setEditForm, onSubmit, onCancel }) {
  if (!client) return null;

  const updateField = (key, value) => {
    setEditForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      <Input
        placeholder="Nom du client"
        value={editForm.nom || ""}
        onChange={(e) => updateField("nom", e.target.value)}
        required
      />
      
      <Input
        placeholder="Personne ressource"
        value={editForm.contact_name || ""}
        onChange={(e) => updateField("contact_name", e.target.value)}
      />

      <div className="form-row" style={{ display: "flex", gap: "1rem" }}>
        <Input
          type="email"
          placeholder="Email"
          value={editForm.email || ""}
          onChange={(e) => updateField("email", e.target.value)}
        />
        <Input
          placeholder="Téléphone"
          value={editForm.phone || ""}
          onChange={(e) => updateField("phone", e.target.value)}
        />
      </div>

      <Input
        placeholder="Adresse complète"
        value={editForm.adresse || ""}
        onChange={(e) => updateField("adresse", e.target.value)}
      />
      
      <Input
        placeholder="Notes"
        value={editForm.notes || ""}
        onChange={(e) => updateField("notes", e.target.value)}
      />

      <Input
        type="number"
        placeholder="Taux horaire"
        value={editForm.hourly_rate_defaut || ""}
        onChange={(e) => updateField("hourly_rate_defaut", e.target.value)}
      />

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

export default memo(EditClientForm);
