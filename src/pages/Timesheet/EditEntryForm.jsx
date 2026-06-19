import { Button, Input, Select } from "../../components/ui";

export default function EditEntryForm({ projets = [], editForm, setEditForm, onSubmit, onCancel }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <label>Description</label>

      <Input
        type="text"
        value={editForm.description || editForm.note || ""}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            description: e.target.value,
          })
        }
        placeholder="Description"
      />

      <label>Projet</label>

      <Select
        value={editForm.projet_id || ""}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            projet_id: e.target.value,
          })
        }
        required>
        <option value="">Sélectionner</option>

        {projets.map((p) => (
          <option key={p.id} value={p.id}>
            {p.client || p.client_nom || "Client inconnu"} · {p.projet || p.nom || "Projet sans nom"}
          </option>
        ))}
      </Select>

      <label>Début</label>

      <Input
        type="datetime-local"
        value={editForm.start_time || ""}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            start_time: e.target.value,
          })
        }
      />

      <label>Fin</label>

      <Input
        type="datetime-local"
        value={editForm.end_time || ""}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            end_time: e.target.value,
          })
        }
      />

      <div className="modal-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>

        <Button type="submit" variant="primary">
          Sauvegarder
        </Button>
      </div>
    </form>
  );
}
