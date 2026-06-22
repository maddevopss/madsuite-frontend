import { memo } from "react";
import { Modal, Button, Badge } from "../../components/ui";
import { formatDate, formatMoney } from "../../utils/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "./invoiceStatus";

function ViewInvoiceModal({ show, invoice, onClose, onDownloadPDF, onPreviewPDF, onCopyPortalLink, onPay, onMakeRecurring }) {
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

          <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <Button variant="secondary" onClick={onClose} style={{ marginRight: 'auto' }}>
              Fermer
            </Button>
            <Button variant="secondary" onClick={() => onDownloadPDF(invoice.id)}>
              Download PDF
            </Button>
            {onMakeRecurring && (
              <Button variant="secondary" onClick={() => onMakeRecurring(invoice)}>
                Rendre récurrente
              </Button>
            )}
            {['draft', 'sent'].includes(invoice.status) && onPay && (
              <Button variant="secondary" style={{ backgroundColor: '#f8fafc', color: '#635BFF', borderColor: '#e2e8f0' }} onClick={() => onPay(invoice.id)}>
                PAY NOW (Stripe)
              </Button>
            )}
            <Button variant="primary" onClick={() => onCopyPortalLink(invoice.id)}>
              SEND INVOICE
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default memo(ViewInvoiceModal);
