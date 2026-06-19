import { useNavigate } from "react-router-dom";

import { Badge, Button, Card, EmptyState, Loader } from "../../components/ui";

import { useBillingDashboard } from "../../hooks/useBillingDashboard";
import { formatDate, formatMoney } from "../../utils/formatters";

const statusBadgeVariant = (status) => {
  if (status === "paid") return "success";
  if (status === "sent") return "info";
  if (status === "draft") return "warning";
  if (status === "void") return "error";
  return "default";
};

function BillingMetric({ label, value, sub, actionLabel, onAction }) {
  return (
    <Card className="metric billing-metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-sub">{sub}</div>
      {actionLabel && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}

function getStatusCount(invoiceStatus, status) {
  return Number(invoiceStatus?.[status]?.count || 0);
}

function BillingRanking({ title, items, getKey, renderName, onInvoice }) {
  return (
    <Card className="billing-block">
      <div className="card-title">{title}</div>
      {items.length === 0 ? (
        <EmptyState message="Aucune donnee." />
      ) : (
        <div className="billing-list">
          {items.map((item) => (
            <div className="billing-row" key={getKey(item)}>
              <div className="billing-row-main">
                <div className="billing-row-title">{renderName(item)}</div>
                <div className="billing-row-meta">{Number(item.hours_to_bill || 0).toFixed(1)}h</div>
              </div>
              <div className="billing-row-side">
                <div className="billing-row-amount">{formatMoney(item.amount_to_bill || 0)}</div>
                {onInvoice && (
                  <Button variant="secondary" size="sm" onClick={() => onInvoice(item)}>
                    Facturer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function BillingInvoices({ title, invoices, emptyMessage, overdue, onOpenInvoices }) {
  return (
    <Card className={`billing-block${overdue && invoices.length ? " billing-block-warning" : ""}`}>
      <div className="billing-block-title">
        <div className="card-title">{title}</div>
        <Button variant="secondary" size="sm" onClick={onOpenInvoices}>
          Voir tout
        </Button>
      </div>
      {invoices.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="billing-list">
          {invoices.slice(0, 10).map((invoice) => (
            <div className="billing-row" key={invoice.id}>
              <div className="billing-row-main">
                <div className="billing-row-title">
                  {invoice.invoice_number} - {invoice.client_nom}
                </div>
                <div className="billing-row-meta">
                  {overdue ? "Echeance" : "Emise"}:{" "}
                  {invoice[overdue ? "due_date" : "issue_date"]
                    ? formatDate(invoice[overdue ? "due_date" : "issue_date"])
                    : "-"}
                </div>
              </div>
              <div className="billing-invoice-side">
                <Badge variant={statusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                <div className="billing-row-amount">{formatMoney(invoice.total || 0)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function BillingDashboardCockpit() {
  const navigate = useNavigate();
  const {
    loading,
    total_to_invoice,
    total_invoiced_this_month,
    total_paid_this_month,
    overdue_count,
    overdue_total,
    due_soon_count,
    due_soon_total,
    unbilled_hours,
    billed_hours,
    invoiceStatus,
    topClients,
    topProjects,
    recentInvoices,
    overdueInvoices,
    dueSoonInvoices,
  } = useBillingDashboard();

  if (loading) {
    return <Loader label="Chargement du cockpit facturation..." variant="dashboard" />;
  }

  const openInvoices = () => navigate("/invoices");
  const openCreateInvoice = (item = {}) => {
    navigate("/invoices", {
      state: {
        openCreateInvoice: true,
        clientId: item.client_id || null,
      },
    });
  };

  return (
    <section className="billing-cockpit" aria-labelledby="billing-cockpit-title">
      <div className="billing-cockpit-header">
        <h2 id="billing-cockpit-title">Cockpit facturation v1</h2>
        <div className="billing-cockpit-actions">
          <Button variant="secondary" size="sm" onClick={openInvoices}>
            Voir factures
          </Button>
          <Button variant="primary" size="sm" onClick={() => openCreateInvoice()}>
            Nouvelle facture
          </Button>
        </div>
      </div>

      <div className="billing-metrics">
        <BillingMetric
          label="A facturer"
          value={formatMoney(total_to_invoice)}
          sub={`${unbilled_hours.toFixed(1)}h non facturees`}
          actionLabel="Facturer"
          onAction={() => openCreateInvoice()}
        />
        <BillingMetric
          label="En retard"
          value={formatMoney(overdue_total)}
          sub={`${overdue_count} facture${overdue_count > 1 ? "s" : ""}`}
          actionLabel="Voir"
          onAction={openInvoices}
        />
        <BillingMetric label="Total paye ce mois" value={formatMoney(total_paid_this_month)} sub="Factures payees" />
        <BillingMetric
          label="A surveiller"
          value={formatMoney(due_soon_total)}
          sub={`${due_soon_count} echeance${due_soon_count > 1 ? "s" : ""} sous 7 jours`}
          actionLabel="Voir"
          onAction={openInvoices}
        />
      </div>

      <div className="billing-status-strip">
        <span>Draft: {getStatusCount(invoiceStatus, "draft")}</span>
        <span>Envoyees: {getStatusCount(invoiceStatus, "sent")}</span>
        <span>Payees: {getStatusCount(invoiceStatus, "paid")}</span>
        <span>Heures facturees: {billed_hours.toFixed(1)}h</span>
        <span>Total cree ce mois: {formatMoney(total_invoiced_this_month)}</span>
      </div>

      <div className="billing-two">
        <BillingInvoices
          title="Factures en retard"
          invoices={overdueInvoices}
          emptyMessage="Rien a signaler."
          onOpenInvoices={openInvoices}
          overdue
        />
        <BillingInvoices
          title="Echeances sous 7 jours"
          invoices={dueSoonInvoices}
          emptyMessage="Aucune echeance proche."
          onOpenInvoices={openInvoices}
        />
      </div>

      <div className="billing-two">
        <BillingRanking
          title="Top 5 clients a facturer"
          items={topClients}
          getKey={(client) => client.client_id}
          renderName={(client) => client.client_nom}
          onInvoice={openCreateInvoice}
        />
        <BillingRanking
          title="Top 5 projets a facturer"
          items={topProjects}
          getKey={(project) => project.projet_id}
          renderName={(project) =>
            project.client_nom ? `${project.projet_nom} - ${project.client_nom}` : project.projet_nom
          }
          onInvoice={openCreateInvoice}
        />
      </div>

      <div className="billing-one">
        <BillingInvoices
          title="Factures recentes"
          invoices={recentInvoices}
          emptyMessage="Aucune facture."
          onOpenInvoices={openInvoices}
        />
      </div>
    </section>
  );
}
