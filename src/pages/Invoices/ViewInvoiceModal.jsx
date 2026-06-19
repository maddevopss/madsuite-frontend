import { memo } from "react";
import { Modal, Button, Badge } from "../../components/ui";
import { formatDate, formatMoney } from "../../utils/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "./invoiceStatus";

function ViewInvoiceModal({ show, invoice, onClose, onDownloadPDF }) {
  return (
    <Modal show={show} title={`Facture ${invoice?.invoice_number || ""}`} onClose={onClose}>
      {invoice && (
        <div className="view-invoice">
          <div className="view-invoice-heading">
            <div>
              <span className="view-invoice-label">Client</span>
              <strong>{invoice.client_nom || "—"}</strong>
            </div>
            <div>
              <Badge variant={STATUS_COLORS[invoice.status] || "default"}>{STATUS_LABELS[invoice.status]}</Badge>
            </div>
          </div>

          <div className="view-invoice-meta">
            <div>
              <span>Émise le</span>
              <strong>{invoice.issue_date ? formatDate(invoice.issue_date) : "—"}</strong>
            </div>
            <div>
              <span>Échéance</span>
              <strong>{invoice.due_date ? formatDate(invoice.due_date) : "—"}</strong>
            </div>
            <div>
              <span>Sous-total</span>
              <strong>{formatMoney(invoice.subtotal)}</strong>
            </div>
            <div>
              <span>Taxes</span>
              <strong>{formatMoney(invoice.tax_total)}</strong>
            </div>
            <div className="view-invoice-total">
              <span>Total</span>
              <strong>{formatMoney(invoice.total)}</strong>
            </div>
          </div>

          {invoice.notes && (
            <div className="view-invoice-notes">
              <strong>Notes</strong>
              <p>{invoice.notes}</p>
            </div>
          )}

          {invoice.items?.length > 0 ? (
            <div className="view-invoice-table-wrap">
              <table className="view-invoice-table">
                <thead>
                  <tr>
                    <th>Projet</th>
                    <th>Description</th>
                    <th>Qté (h)</th>
                    <th>Taux</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.projet_nom || "—"}</td>
                      <td>{item.description || "—"}</td>
                      <td>{Number(item.quantity || 0).toFixed(2)}</td>
                      <td>{formatMoney(item.unit_rate)}</td>
                      <td>{formatMoney(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="view-invoice-no-items">Aucune ligne de facturation.</p>
          )}

          <div className="form-actions">
            <Button variant="secondary" onClick={onClose}>
              Fermer
            </Button>
            <Button variant="primary" onClick={() => onDownloadPDF(invoice.id)}>
              Télécharger PDF
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default memo(ViewInvoiceModal);
