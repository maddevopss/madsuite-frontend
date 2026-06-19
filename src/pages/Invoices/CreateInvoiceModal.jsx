import { memo, useCallback, useEffect, useState } from "react";
import { Modal, Button, Select, Input } from "../../components/ui";
import { getUnbilledInvoiceEntries } from "../../api/invoices.api";
import { formatMoney } from "../../utils/formatters";

function CreateInvoiceModal({ show, clients, loading, initialClientId, onClose, onCreate }) {
  const [selectedClient, setSelectedClient] = useState("");
  const [unbilledEntries, setUnbilledEntries] = useState([]);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [taxRate, setTaxRate] = useState("0");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleClientChange = useCallback(async (clientId) => {
    setSelectedClient(clientId);
    setSelectedEntries([]);

    if (!clientId) {
      setUnbilledEntries([]);
      return;
    }

    try {
      const entries = await getUnbilledInvoiceEntries(clientId);
      setUnbilledEntries(Array.isArray(entries) ? entries : []);
    } catch {
      setUnbilledEntries([]);
    }
  }, []);

  useEffect(() => {
    if (!show) return;

    const nextClientId = initialClientId ? String(initialClientId) : "";
    setSelectedClient(nextClientId);
    setUnbilledEntries([]);
    setSelectedEntries([]);
    setTaxRate("0");
    setIssueDate("");
    setDueDate("");
    setNotes("");

    if (nextClientId) {
      handleClientChange(nextClientId);
    }
  }, [handleClientChange, initialClientId, show]);

  const toggleEntry = useCallback((row) => {
    setSelectedEntries((prev) => {
      const exists = prev.find((entry) => entry.id === row.id);
      if (exists) return prev.filter((entry) => entry.id !== row.id);
      return [...prev, row];
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (!selectedClient || selectedEntries.length === 0) return;

    await onCreate({
      client_id: Number(selectedClient),
      time_entry_ids: selectedEntries.map((entry) => entry.id),
      tax_rate: Number(taxRate),
      issue_date: issueDate || undefined,
      due_date: dueDate || undefined,
      notes: notes || undefined,
    });
  }, [dueDate, issueDate, notes, onCreate, selectedClient, selectedEntries, taxRate]);

  return (
    <Modal show={show} title="Nouvelle facture" onClose={onClose}>
      <div className="create-invoice-form">
        <div className="form-group">
          <label>Client</label>
          <Select value={selectedClient} onChange={(event) => handleClientChange(event.target.value)}>
            <option value="">— Sélectionner un client —</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nom}
              </option>
            ))}
          </Select>
        </div>

        {selectedClient && unbilledEntries.length > 0 && (
          <>
            <div className="form-group">
              <label>Entrées de temps non facturées</label>
              <div className="entries-list">
                {unbilledEntries.map((row) => {
                  const hours = Number(row.hours || 0);
                  const rate = Number(row.hourly_rate_used || 0);
                  const amount = Number(row.amount || hours * rate);
                  const isSelected = selectedEntries.some((entry) => entry.id === row.id);

                  return (
                    <div key={row.id} className={`entry-row ${isSelected ? "selected" : ""}`} onClick={() => toggleEntry(row)}>
                      <input type="checkbox" checked={isSelected} readOnly />
                      <span>
                        {row.projet_nom} — {hours.toFixed(2)}h × {formatMoney(rate)} = {formatMoney(amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Taux de taxe (%)</label>
                <Input type="number" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Date d'émission</label>
                <Input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} />
              </div>
              <div className="form-group">
                <label>Date d'échéance</label>
                <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes optionnelles..." rows={3} />
            </div>
          </>
        )}

        {selectedClient && unbilledEntries.length === 0 && <p>Aucune entrée non facturée pour ce client.</p>}

        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={selectedEntries.length === 0 || loading}>
            Créer la facture ({selectedEntries.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default memo(CreateInvoiceModal);
