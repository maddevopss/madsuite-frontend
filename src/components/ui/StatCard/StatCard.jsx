import "./statCard.css";

export default function StatCard({ label, value, sub }) {
  return (
    <div className="ui-stat-card">
      <div className="ui-stat-label">{label}</div>
      <div className="ui-stat-value">{value}</div>
      {sub && <div className="ui-stat-sub">{sub}</div>}
    </div>
  );
}
