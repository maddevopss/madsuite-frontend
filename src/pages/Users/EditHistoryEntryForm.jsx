import { Button, Input, Select } from "../../components/ui/index";

export default function EditHistoryEntryForm({
  entry,
  editForm,
  setEditForm,
  editClientId,
  setEditClientId,
  clientsEdit,
  projetsEditFiltres,
  onSubmit,
  onCancel,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  if (!entry) return null;

  return (
    <form className="users-form" onSubmit={handleSubmit}>
      <label>Description</label>
      <Input
        type="text"
        value={editForm.description || ""}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            description: e.target.value,
          })
        }
      />

      <label>Client</label>
      <Select
        value={editClientId || ""}
        onChange={(e) => {
          setEditClientId(e.target.value);
          setEditForm({
            ...editForm,
            projet_id: "",
          });
        }}>
        <option value="">Sélectionner un client</option>

        {(clientsEdit || []).map((c) => (
          <option key={c.id} value={c.id}>
            {c.nom}
          </option>
        ))}
      </Select>

      <label>Projet</label>
      <Select
        value={editForm.projet_id || ""}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            projet_id: e.target.value,
          })
        }
        disabled={!editClientId}>
        <option value="">Sélectionner un projet</option>

        {(projetsEditFiltres || []).map((p) => (
          <option key={p.id} value={p.id}>
            {p.projet || p.nom}
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
