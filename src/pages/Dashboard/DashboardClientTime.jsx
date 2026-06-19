import { memo, useMemo } from "react";
import { Card, EmptyState } from "../../components/ui";

function DashboardClientTime({ parClient = [], maxHeures = 0 }) {
  const monthLabel = useMemo(
    () =>
      new Date().toLocaleString("fr-CA", {
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const rows = useMemo(
    () =>
      parClient.map((c) => {
        const heures = parseFloat(c.heures || 0);
        const percent = maxHeures > 0 ? Math.round((heures / maxHeures) * 100) : 0;

        return {
          key: c.client,
          name: c.client || "Client inconnu",
          hours: heures.toFixed(1),
          percent,
        };
      }),
    [maxHeures, parClient],
  );

  return (
    <Card className="dashboard-client-time">
      <div className="card-title">
        Temps par client — {monthLabel}
      </div>

      {rows.length === 0 ? (
        <EmptyState message="Aucune entrée ce mois." />
      ) : (
        rows.map((row) => (
          <div className="client-row" key={row.key}>
            <div className="client-dot" />

            <span className="client-name">{row.name}</span>

            <span className="client-hours">{row.hours}h</span>

            <div className="client-bar-wrap">
              <div
                className="client-bar"
                style={{
                  width: `${row.percent}%`,
                }}
              />
            </div>
          </div>
        ))
      )}
    </Card>
  );
}

export default memo(DashboardClientTime);
