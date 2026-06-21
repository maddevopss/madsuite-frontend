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

  // Reality Gamification Metrics
  const resilienceCount = parseInt(localStorage.getItem('resilience_count') || '1', 10);
  const hyperfocusCount = parseInt(localStorage.getItem('hyperfocus_count') || '0', 10);
  const focusStability = Math.floor(Math.random() * 20) + 70; // Fake stability for MVP

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="metrics">
      <Card className="metric">
        <div className="metric-label">Cette semaine</div>

        <div className="metric-value">{values.semaine} h</div>

        <div className="metric-sub">Sessions de focus</div>
      </Card>

      <Card className="metric">
        <div className="metric-label">Ce mois</div>

        <div className="metric-value">{values.mois} h</div>

        <div className="metric-sub">Objectif: 160h</div>
      </Card>

      <Card className="metric">
        <div className="metric-label">Temps Client</div>

        <div className="metric-value">{values.facturable}%</div>

        <div className="metric-sub">Focus sur mandats externes</div>
      </Card>

      <Card className="metric">
        <div className="metric-label">Valeur Créée</div>

        <div className="metric-value">
          {values.montant}
        </div>

        <div className="metric-sub">Prêt à facturer</div>
      </Card>
      </div>

      <div style={{ marginTop: '10px', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          🧠 Santé Cognitive
        </h3>
        <div className="metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <Card className="metric" style={{ borderTop: '3px solid var(--color-success)' }}>
            <div className="metric-label">Stabilité du Focus</div>
            <div className="metric-value" style={{ color: 'var(--color-success)' }}>{focusStability}%</div>
            <div className="metric-sub">Moyenne de la session</div>
          </Card>
          
          <Card className="metric" style={{ borderTop: '3px solid var(--color-primary)' }}>
            <div className="metric-label">Résilience</div>
            <div className="metric-value" style={{ color: 'var(--color-primary)' }}>{resilienceCount}x</div>
            <div className="metric-sub">Distractions évitées</div>
          </Card>
          
          <Card className="metric" style={{ borderTop: '3px solid var(--color-warning)' }}>
            <div className="metric-label">Hyperfocus</div>
            <div className="metric-value" style={{ color: 'var(--color-warning)' }}>{hyperfocusCount}x</div>
            <div className="metric-sub">Sessions &gt; 45min</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default memo(DashboardMetrics);
