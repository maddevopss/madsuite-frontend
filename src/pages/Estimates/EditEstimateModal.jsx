import { Modal, Button, Select, Input, Textarea } from "../../components/ui";

export default function EditEstimateModal({ show, status, issueDate, validUntil, notes, loading, onStatusChange, onIssueDateChange, onValidUntilChange, onNotesChange, onClose, onSave }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <Modal show={show} onClose={onClose} title="Modifier la soumission">
      <form onSubmit={handleSubmit}>
        <div className="form-group-row">
          <Select label="Statut" value={status} onChange={(e) => onStatusChange(e.target.value)} required>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyée</option>
            <option value="accepted">Acceptée</option>
            <option value="rejected">Refusée</option>
          </Select>
        </div>
        
        <div className="form-group-row">
          <Input type="date" label="Date d'émission" value={issueDate} onChange={(e) => onIssueDateChange(e.target.value)} required />
          <Input type="date" label="Valide jusqu'au" value={validUntil} onChange={(e) => onValidUntilChange(e.target.value)} />
        </div>

        <Textarea label="Notes" value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={4} />

        <div className="modal-actions" style={{ marginTop: "2rem" }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
