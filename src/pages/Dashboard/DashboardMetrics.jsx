import { memo, useMemo } from "react";
import { Card } from "../../components/ui";

function DashboardMetrics({ stats = {} }) {
  const values = useMemo(
    () => ({
      semaine: parseFloat(stats.semaine || 0).toFixed(1),
      mois: parseFloat(stats.mois || 0).toFixed(1),
      facturable: parseFloat(stats.facturable || 0).toFixed(0),
      montant: parseFloat(stats.montant_a_facturer || 0).toLocaleString("fr-CA", {
        style: "currency",
        currency: "CAD",
      }),
    }),
    [stats],
  );

  return (
    <div className="metrics">
      <Card className="metric">
        <div className="metric-label">Cette semaine</div>

        <div className="metric-value">{values.semaine} h</div>

        <div className="metric-sub">Heures enregistrées</div>
      </Card>

      <Card className="metric">
        <div className="metric-label">Ce mois</div>

        <div className="metric-value">{values.mois} h</div>

        <div className="metric-sub">Objectif: 160h</div>
      </Card>

      <Card className="metric">
        <div className="metric-label">Facturable</div>

        <div className="metric-value">{values.facturable}%</div>

        <div className="metric-sub">Heures facturées ce mois</div>
      </Card>

      <Card className="metric">
        <div className="metric-label">À facturer</div>

        <div className="metric-value">
          {values.montant}
        </div>

        <div className="metric-sub">Entrées non facturées</div>
      </Card>
    </div>
  );
}

export default memo(DashboardMetrics);
