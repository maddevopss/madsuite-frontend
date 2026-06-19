import { Modal, Button, StatusBadge } from "../../components/ui";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function ViewEstimateModal({ show, estimate, onClose, onConvert, onUpdateStatus, onDownload }) {
  if (!estimate) return null;

  return (
    <Modal show={show} onClose={onClose} title={`Soumission ${estimate.estimate_number}`} size="large">
      <div className="view-estimate-content">
        <div className="invoice-details-grid">
          <div className="detail-group">
            <span className="label">Client:</span>
            <span className="value">{estimate.client_nom}</span>
          </div>
          <div className="detail-group">
            <span className="label">Statut:</span>
            <span className="value">
              <StatusBadge status={estimate.status} />
            </span>
          </div>
          <div className="detail-group">
            <span className="label">Date d'émission:</span>
            <span className="value">{formatDate(estimate.issue_date)}</span>
          </div>
          <div className="detail-group">
            <span className="label">Valide jusqu'au:</span>
            <span className="value">{formatDate(estimate.valid_until) || "-"}</span>
          </div>
        </div>

        {estimate.notes && (
          <div className="detail-group full-width" style={{ marginTop: "1rem" }}>
            <span className="label">Notes:</span>
            <div className="value notes-box">{estimate.notes}</div>
          </div>
        )}

        <h4 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Items</h4>
        <div className="table-responsive">
          <table className="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="align-right">Qté</th>
                <th className="align-right">Taux</th>
                <th className="align-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {estimate.items && estimate.items.length > 0 ? (
                estimate.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td className="align-right">{item.quantity}</td>
                    <td className="align-right">{formatCurrency(item.unit_rate)}</td>
                    <td className="align-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-row">Aucun item</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="align-right"><strong>Sous-total:</strong></td>
                <td className="align-right"><strong>{formatCurrency(estimate.subtotal)}</strong></td>
              </tr>
              <tr>
                <td colSpan="3" className="align-right">Taxes:</td>
                <td className="align-right">{formatCurrency(estimate.tax_total)}</td>
              </tr>
              <tr className="total-row">
                <td colSpan="3" className="align-right"><strong>Total:</strong></td>
                <td className="align-right"><strong>{formatCurrency(estimate.total)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="modal-footer" style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {estimate.status === "draft" && onUpdateStatus && (
            <Button variant="secondary" onClick={() => onUpdateStatus(estimate.id, "sent")}>
              Marquer comme envoyée
            </Button>
          )}
          {estimate.status === "sent" && onUpdateStatus && (
            <>
              <Button variant="primary" onClick={() => onUpdateStatus(estimate.id, "accepted")}>
                Accepter
              </Button>
              <Button variant="danger" onClick={() => onUpdateStatus(estimate.id, "rejected")}>
                Refuser
              </Button>
            </>
          )}
        </div>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button variant="secondary" onClick={onClose}>Fermer</Button>
          {onDownload && (
            <Button variant="secondary" onClick={() => onDownload(estimate.id, estimate.estimate_number)}>
              Télécharger PDF
            </Button>
          )}
          {estimate.status === "accepted" && onConvert && (
            <Button variant="primary" onClick={() => { onConvert(estimate.id); onClose(); }}>
              Convertir en facture
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
