import { memo } from "react";
import { Modal, Button, Select } from "../../components/ui";

function EditInvoiceModal({
  show,
  status,
  notes,
  loading,
  onStatusChange,
  onNotesChange,
  onClose,
  onSave,
}) {
  return (
    <Modal show={show} title="Modifier la facture" onClose={onClose}>
      <div className="edit-invoice-form">
        <div className="form-group">
          <label>Statut</label>
          <Select value={status} onChange={(event) => onStatusChange(event.target.value)}>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyée</option>
            <option value="paid">Payée</option>
            <option value="void">Annulée</option>
          </Select>
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea value={notes} onChange={(event) => onNotesChange(event.target.value)} rows={3} />
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={onSave} disabled={loading}>
            Enregistrer
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default memo(EditInvoiceModal);
