import { Button, StatusBadge } from "../../components/ui";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function EstimateCard({ estimate, onView, onEdit, onDelete, onConvert }) {
  return (
    <div className="estimate-card list-card fade-in">
      <div className="card-header">
        <div>
          <h3>{estimate.estimate_number}</h3>
          <p className="card-subtitle">{estimate.client_nom}</p>
        </div>
        <StatusBadge status={estimate.status} />
      </div>

      <div className="card-body">
        <div className="card-row">
          <span className="label">Date d'émission:</span>
          <span className="value">{formatDate(estimate.issue_date)}</span>
        </div>
        <div className="card-row">
          <span className="label">Valide jusqu'au:</span>
          <span className="value">{formatDate(estimate.valid_until) || "N/A"}</span>
        </div>
        <div className="card-row">
          <span className="label">Total:</span>
          <span className="value highlight-value">{formatCurrency(estimate.total)}</span>
        </div>
      </div>

      <div className="card-actions">
        <Button variant="secondary" size="small" onClick={() => onView(estimate.id)}>
          Voir
        </Button>
        {estimate.status !== "invoiced" && (
          <Button variant="secondary" size="small" onClick={() => onEdit(estimate)}>
            Modifier
          </Button>
        )}
        {estimate.status === "accepted" && (
          <Button variant="primary" size="small" onClick={() => onConvert(estimate.id)}>
            Convertir
          </Button>
        )}
        {(estimate.status === "draft" || estimate.status === "rejected") && (
          <Button variant="danger" size="small" onClick={() => onDelete(estimate.id)}>
            Supprimer
          </Button>
        )}
      </div>
    </div>
  );
}
