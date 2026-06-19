export default function InnovationBillingIssues({ issues }) {
  return (
    <div className="innovation-card">
      <h2>Assistant facturation</h2>

      {issues.length === 0 ? (
        <p>Aucun problème détecté.</p>
      ) : (
        issues.map((issue) => (
          <div className="innovation-row" key={issue.id}>
            <strong>Entrée #{issue.id}</strong>
            <span>{issue.description || "Description manquante"}</span>
          </div>
        ))
      )}
    </div>
  );
}
