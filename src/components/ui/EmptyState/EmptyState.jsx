import "./emptyState.css";

export default function EmptyState({ title = "Aucune donnée", message = "Rien à afficher pour le moment.", action }) {
  return (
    <div className="ui-empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
