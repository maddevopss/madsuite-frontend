import { memo } from "react";
import { Modal, Button, Select, Input } from "../../components/ui";
import { formatMoney } from "../../utils/formatters";
import { useCreateInvoiceModal } from "../../hooks/useCreateInvoiceModal";

function CreateInvoiceModal({ show, clients, loading, initialClientId, onClose, onCreate }) {
  const { state, actions } = useCreateInvoiceModal({ show, initialClientId, onCreate });

  return (
    <Modal show={show} title="Nouvelle facture" onClose={onClose}>
      <div className="create-invoice-form">
        <div className="form-group">
          <label>Client</label>
          <Select value={state.selectedClient} onChange={(event) => actions.handleClientChange(event.target.value)}>
            <option value="">— Sélectionner un client —</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nom}
              </option>
            ))}
          </Select>
        </div>

        {state.selectedClient && state.unbilledEntries.length > 0 && (
          <>
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label>Entrées de temps non facturées</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button type="button" variant="secondary" size="small" onClick={actions.handleCleanDescriptions} disabled={state.aiLoading || state.selectedEntries.length === 0}>
                    {state.aiLoading ? "🪄 Nettoyage..." : "🪄 Reformuler les descriptions"}
                  </Button>
                  <Button type="button" variant="secondary" size="small" onClick={actions.toggleAllEntries}>
                    {state.selectedEntries.length === state.unbilledEntries.length ? "Tout désélectionner" : "Tout sélectionner"}
                  </Button>
                </div>
              </div>
              <div className="entries-list" style={{ marginTop: "10px" }}>
                {state.unbilledEntries.map((row) => {
                  const hours = Number(row.hours || 0);
                  const rate = Number(row.hourly_rate_used || 0);
                  const amount = Number(row.amount || hours * rate);
                  const isSelected = state.selectedEntries.some((entry) => entry.id === row.id);

                  return (
                    <div key={row.id} className={`entry-row ${isSelected ? "selected" : ""}`} style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px", padding: "10px" }}>
                      <div style={{ display: "flex", width: "100%", alignItems: "center", gap: "10px" }} onClick={() => actions.toggleEntry(row)}>
                        <input type="checkbox" checked={isSelected} readOnly />
                        <span style={{ flex: 1 }}>
                          <strong>{row.projet_nom}</strong> — {hours.toFixed(2)}h × {formatMoney(rate)} = {formatMoney(amount)}
                        </span>
                      </div>
                      {isSelected && (
                        <div style={{ width: "100%", paddingLeft: "25px" }}>
                          <Input 
                            value={state.customDescriptions[row.id] !== undefined ? state.customDescriptions[row.id] : (row.description || "")}
                            onChange={(e) => actions.handleCustomDescChange(row.id, e.target.value)}
                            placeholder="Description de la prestation..."
                            style={{ width: "100%", fontSize: "0.9rem" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {state.selectedClient && state.unbilledExpenses.length > 0 && (
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label>Dépenses non facturées</label>
                  <Button type="button" variant="secondary" size="small" onClick={actions.toggleAllExpenses}>
                    {state.selectedExpenses.length === state.unbilledExpenses.length ? "Tout désélectionner" : "Tout sélectionner"}
                  </Button>
                </div>
                <div className="entries-list" style={{ marginTop: "10px" }}>
                  {state.unbilledExpenses.map((row) => {
                    const amount = Number(row.amount || 0);
                    const isSelected = state.selectedExpenses.some((exp) => exp.id === row.id);

                    return (
                      <div key={`exp-${row.id}`} className={`entry-row ${isSelected ? "selected" : ""}`} onClick={() => actions.toggleExpense(row)} style={{ padding: "10px" }}>
                        <div style={{ display: "flex", width: "100%", alignItems: "center", gap: "10px" }}>
                          <input type="checkbox" checked={isSelected} readOnly />
                          <span style={{ flex: 1 }}>
                            <strong>{row.projet_nom || "Dépense"}</strong> — {row.description || "Sans description"} : {formatMoney(amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(state.selectedEntries.length > 0 || state.selectedExpenses.length > 0) && (
              <div className="invoice-preview-card" style={{ padding: "15px", background: "var(--color-bg-tertiary)", borderRadius: "8px", marginBottom: "15px" }}>
                <h4 style={{ margin: "0 0 10px 0" }}>Aperçu de la facture</h4>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span>Sous-total:</span> <strong>{formatMoney(state.subtotal)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span>Taxes ({state.taxRate}%):</span> <strong>{formatMoney(state.taxTotal)}</strong>
                </div>
                <hr style={{ border: "0", borderTop: "1px solid var(--color-border)", margin: "10px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
                  <span>Total à facturer:</span> <strong>{formatMoney(state.total)}</strong>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Taux de taxe (%)</label>
                <Input type="number" value={state.taxRate} onChange={(event) => actions.setTaxRate(event.target.value)} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Date d'émission</label>
                <Input type="date" value={state.issueDate} onChange={(event) => actions.setIssueDate(event.target.value)} />
              </div>
              <div className="form-group">
                <label>Date d'échéance</label>
                <Input type="date" value={state.dueDate} onChange={(event) => actions.setDueDate(event.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea value={state.notes} onChange={(event) => actions.setNotes(event.target.value)} placeholder="Notes optionnelles..." rows={3} />
            </div>
          </>
        )}

        {state.selectedClient && state.unbilledEntries.length === 0 && <p>Aucune entrée non facturée pour ce client.</p>}

        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={actions.handleCreate} disabled={state.selectedEntries.length === 0 || loading}>
            Créer la facture ({state.selectedEntries.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default memo(CreateInvoiceModal);
