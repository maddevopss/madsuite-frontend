import { formatMinutes } from "./innovationUtils";

export default function InnovationInsights({ insights }) {
  return (
    <div className="innovation-card">
      <h2>Intelligence d'activité</h2>

      {insights.length === 0 ? (
        <p>Aucune activité analysée.</p>
      ) : (
        insights.map((item, index) => (
          <div className="innovation-row" key={`${item.app_name}-${item.activity_category || item.category}-${index}`}>
            <strong>{item.app_name || "Application inconnue"}</strong>
            <span>{item.activity_category || item.category || "Non classé"}</span>
            <small>{formatMinutes(item.total_seconds)} min</small>
          </div>
        ))
      )}
    </div>
  );
}
