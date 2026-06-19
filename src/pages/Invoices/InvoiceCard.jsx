import { memo, useState } from "react";
import { Button, Badge } from "../../components/ui";
import { formatDate, formatMoney } from "../../utils/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "./invoiceStatus";
import api from "../../api/api";

function InvoiceCard({ invoice, onView, onDownloadPDF, onEdit, onDelete }) {
  const [copying, setCopying] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setCopying(true);
    try {
      const res = await api.get(`/invoices/${invoice.id}/portal-link`);
      const { portalUrl } = res.data?.data || res.data || {};
      if (portalUrl) {
        await navigator.clipboard.writeText(portalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error("Erreur partage facture", err);
    } finally {
      setCopying(false);
    }
  };

  const handleSend = async () => {
    if (invoice.status !== "draft") return; // déjà envoyée
    setSending(true);
    try {
      const res = await api.post(`/invoices/${invoice.id}/send`);
      const { portalUrl } = res.data?.data || res.data || {};
      if (portalUrl) {
        await navigator.clipboard.writeText(portalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        // Reload parent
        onEdit && onEdit({ ...invoice, status: "sent" });
      }
    } catch (err) {
      console.error("Erreur envoi facture", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="invoice-card">
      <div className="invoice-card-header">
        <strong>{invoice.invoice_number}</strong>
        <Badge variant={STATUS_COLORS[invoice.status] || "default"}>{STATUS_LABELS[invoice.status] || invoice.status}</Badge>
      </div>
      <div className="invoice-card-body">
        <p>
          <strong>Client:</strong> {invoice.client_nom || "—"}
        </p>
        <p>
          <strong>Date:</strong> {invoice.issue_date ? formatDate(invoice.issue_date) : "—"}
        </p>
        <p>
          <strong>Échéance:</strong> {invoice.due_date ? formatDate(invoice.due_date) : "—"}
        </p>
        <p>
          <strong>Total:</strong> {formatMoney(invoice.total)}
        </p>
        <p>
          <strong>Entrées:</strong> {invoice.entries_count || 0}
        </p>
      </div>
      <div className="invoice-card-actions">
        <Button variant="secondary" size="sm" onClick={() => onView(invoice.id)}>
          Voir
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onDownloadPDF(invoice.id)}>
          PDF
        </Button>

        {/* Envoi + Partage du lien magique */}
        {invoice.status === "draft" ? (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={sending}
            title="Marquer comme envoyée et copier le lien portail"
          >
            {sending ? "…" : "📤 Envoyer"}
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            disabled={copying}
            title="Copier le lien du portail client"
            style={copied ? { background: "#ecfdf5", color: "#059669", borderColor: "#6ee7b7" } : {}}
          >
            {copied ? "✓ Copié !" : copying ? "…" : "🔗 Partager"}
          </Button>
        )}

        <Button variant="secondary" size="sm" onClick={() => onEdit(invoice)}>
          Modifier
        </Button>
        {invoice.status === "draft" && (
          <Button variant="danger" size="sm" onClick={() => onDelete(invoice.id)}>
            Supprimer
          </Button>
        )}
      </div>
    </div>
  );
}

export default memo(InvoiceCard);
