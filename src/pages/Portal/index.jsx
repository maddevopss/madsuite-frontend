import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import SignaturePad from "./SignaturePad";
import "./portal.css";

const API_BASE = import.meta.env.VITE_API_URL || "";

function formatMoney(value) {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(Number(value || 0));
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function StatusBadge({ status, type }) {
  const labels = {
    draft: "Brouillon", sent: "Envoyée", paid: "Payée ✓", void: "Annulée",
    accepted: "Acceptée ✓", rejected: "Refusée",
  };
  const cssClass = {
    draft: "status-draft", sent: "status-sent", paid: "status-paid", void: "status-void",
    accepted: "status-paid", rejected: "status-void",
  };
  return (
    <span className={`portal-status-badge ${cssClass[status] || "status-draft"}`}>
      {labels[status] || status}
    </span>
  );
}

export default function Portal() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [localStatus, setLocalStatus] = useState(null);

  const paymentResult = searchParams.get("payment"); // "success" | "cancelled"

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/portal/${token}`);
      if (!response.ok) throw new Error("Lien expiré ou invalide.");
      const result = await response.json();
      setData(result);
      setLocalStatus(result.document?.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Re-fetch if payment=success to get updated status
  useEffect(() => {
    if (paymentResult === "success" && data) {
      // Optimistic update
      setLocalStatus("paid");
      // Also re-fetch after short delay to confirm from server
      setTimeout(fetchData, 2000);
    }
  }, [paymentResult]); // eslint-disable-line

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      const body = { action };
      if (action === "accepted" && signatureData) {
        body.signature_data = signatureData;
      }

      const response = await fetch(`${API_BASE}/api/portal/${token}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Action impossible");
      }

      setLocalStatus(action);
      setShowSignature(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async () => {
    setPaymentLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/portal/${token}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      window.location.href = result.url;
    } catch (err) {
      alert(err.message || "Impossible d'initier le paiement.");
      setPaymentLoading(false);
    }
  };

  const handleSignatureConfirm = (dataUrl) => {
    setSignatureData(dataUrl);
    // Auto-submit after signature confirmed
    handleAction("accepted");
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="portal-loading">
        <div className="portal-spinner" />
        <p style={{ color: "#718096", fontSize: "0.9rem" }}>Chargement du document…</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="portal-page">
        <div className="portal-error">
          <div className="portal-error-icon">🔗</div>
          <h1 className="portal-error-title">Lien invalide ou expiré</h1>
          <p className="portal-error-msg">{error || "Ce document n'existe pas ou le lien a expiré."}</p>
        </div>
      </div>
    );
  }

  const isInvoice = data.type === "invoice";
  const doc = data.document;
  const status = localStatus || doc.status;
  const isPaid = status === "paid";
  const isAccepted = status === "accepted";
  const isRejected = status === "rejected";
  const canPay = isInvoice && !isPaid && data.hasStripeConnect;
  const overdue = isInvoice && !isPaid && isOverdue(doc.due_date);

  return (
    <div className="portal-page">

      {/* Payment result banner */}
      {paymentResult === "success" && (
        <div className="portal-payment-toast success">
          ✅ Paiement confirmé ! Votre facture est maintenant marquée comme payée.
        </div>
      )}
      {paymentResult === "cancelled" && (
        <div className="portal-payment-toast cancelled">
          ⚠️ Paiement annulé. Vous pouvez réessayer à tout moment.
        </div>
      )}

      {/* Top bar */}
      <div className="portal-header">
        <span className="portal-brand">
          {data.organisationName || "MADSuite"}
        </span>
        <span className="portal-powered">Propulsé par MADSuite</span>
      </div>

      <div className="portal-card">

        {/* Document header */}
        <div className="portal-card-header">
          <div>
            <div className="portal-doc-type">
              {isInvoice ? "Facture" : "Soumission"}
            </div>
            <div className="portal-doc-number">
              {doc.invoice_number || doc.estimate_number || `#${doc.id}`}
            </div>
            {doc.client_nom && (
              <div style={{ fontSize: "0.875rem", color: "#718096", marginTop: "0.25rem" }}>
                {doc.client_nom}
              </div>
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Amount hero */}
        <div className="portal-amount-section">
          <div className="portal-amount-label">Montant Total</div>
          <div className="portal-amount-value">{formatMoney(doc.total || doc.total_amount)}</div>
          {isInvoice && doc.due_date && (
            <div className={`portal-due-date${overdue ? " overdue" : ""}`}>
              {overdue ? "⚠️ Échéance dépassée le" : "À payer avant le"} {formatDate(doc.due_date)}
            </div>
          )}
          {isInvoice && doc.issue_date && (
            <div style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.25rem" }}>
              Émise le {formatDate(doc.issue_date)}
            </div>
          )}
        </div>

        {/* Paid banner */}
        {isPaid && (
          <div className="portal-paid-banner">
            <span style={{ fontSize: "1.5rem" }}>✅</span>
            <div>
              <div>Facture payée — Merci !</div>
              <div style={{ fontSize: "0.8rem", fontWeight: "400", opacity: 0.8, marginTop: "0.1rem" }}>
                Vous pouvez télécharger le PDF ci-dessous pour vos dossiers.
              </div>
            </div>
          </div>
        )}

        {/* Estimate status banners */}
        {isAccepted && (
          <div className="portal-status-banner success">
            ✅ Vous avez accepté cette soumission. Nous vous contacterons prochainement. Merci !
          </div>
        )}
        {isRejected && (
          <div className="portal-status-banner error">
            Cette soumission a été refusée.
          </div>
        )}

        {/* Line items */}
        {doc.items?.length > 0 && (
          <div className="portal-items-section">
            <div className="portal-section-title">Détail des prestations</div>
            <div className="portal-items-list">
              {doc.items.map((item, idx) => (
                <div key={idx} className="portal-item-row">
                  <div>
                    <div className="portal-item-desc">{item.description || "Prestation"}</div>
                    <div className="portal-item-meta">
                      {Number(item.quantity).toFixed(2)} × {formatMoney(item.unit_rate)}
                    </div>
                  </div>
                  <div className="portal-item-amount">{formatMoney(item.amount)}</div>
                </div>
              ))}
            </div>
            <div className="portal-subtotals">
              {doc.subtotal !== doc.total && (
                <>
                  <div className="portal-subtotal-row">
                    <span>Sous-total</span>
                    <span>{formatMoney(doc.subtotal)}</span>
                  </div>
                  {Number(doc.tax_total) > 0 && (
                    <div className="portal-subtotal-row">
                      <span>Taxes</span>
                      <span>{formatMoney(doc.tax_total)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="portal-subtotal-row total">
                <span>Total</span>
                <span>{formatMoney(doc.total || doc.total_amount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {doc.notes && (
          <div className="portal-notes-section">
            <div className="portal-section-title">Notes</div>
            <p className="portal-notes-text">{doc.notes}</p>
          </div>
        )}

        {/* Signature pad for estimate */}
        {!isInvoice && status === "sent" && showSignature && (
          <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--portal-border)" }}>
            <div className="portal-section-title" style={{ marginBottom: "0.75rem" }}>Signature électronique</div>
            <SignaturePad
              onConfirm={handleSignatureConfirm}
              onClear={() => setSignatureData(null)}
            />
          </div>
        )}

        {/* CTA buttons */}
        <div className="portal-cta-section">
          {/* Invoice: Pay button */}
          {canPay && !isPaid && (
            <button
              className="portal-btn portal-btn-pay"
              onClick={handlePay}
              disabled={paymentLoading}
            >
              {paymentLoading ? "Redirection vers Stripe…" : "💳 Payer en ligne maintenant"}
            </button>
          )}

          {/* Invoice: no Stripe configured */}
          {isInvoice && !data.hasStripeConnect && !isPaid && (
            <div style={{ textAlign: "center", fontSize: "0.85rem", color: "#718096", padding: "0.5rem 0" }}>
              Contactez votre prestataire pour les modalités de paiement.
            </div>
          )}

          {/* PDF download */}
          {isInvoice && (
            <a
              href={`${API_BASE}/api/portal/${token}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="portal-btn portal-btn-pdf"
            >
              📄 Télécharger la facture PDF
            </a>
          )}

          {/* Estimate: Accept / Reject */}
          {!isInvoice && status === "sent" && !showSignature && (
            <>
              <button
                className="portal-btn portal-btn-accept"
                onClick={() => setShowSignature(true)}
                disabled={actionLoading}
              >
                ✓ Accepter la soumission
              </button>
              <button
                className="portal-btn portal-btn-reject"
                onClick={() => handleAction("rejected")}
                disabled={actionLoading}
              >
                ✕ Refuser
              </button>
            </>
          )}
        </div>
      </div>

      <div className="portal-footer">
        Sécurisé · Chiffré · Propulsé par MADSuite
        {data.hasStripeConnect && " · Paiements via Stripe"}
      </div>
    </div>
  );
}
