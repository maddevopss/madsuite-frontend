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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Intention principale : Informer sans sur-stimuler */}
      
      {/* Status Banner */}
      <div style={{ 
        padding: 'var(--spacing-md)', 
        background: 'var(--color-surface)', 
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xs)'
      }}>
        <h2 style={{ 
          fontSize: '16px', 
          color: 'var(--color-success)', 
          margin: 0,
          fontWeight: 600
        }}>
          Today: Stable Cognitive Flow
        </h2>
        <p style={{ 
          margin: 0, 
          color: 'var(--color-text-secondary)', 
          fontSize: '14px',
          lineHeight: 1.5
        }}>
          Quelques shifts d'attention détectés, mais une excellente capacité de recovery.
        </p>
      </div>

      {/* Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 'var(--spacing-md)' 
      }}>
        <Card style={{ 
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          padding: 'var(--spacing-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-xs)'
        }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 500 }}>Focus Blocks</div>
          <div style={{ color: 'var(--color-primary)', fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>4</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Cycles profonds complétés</div>
        </Card>

        <Card style={{ 
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          padding: 'var(--spacing-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-xs)'
        }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 500 }}>Fragmentation</div>
          <div style={{ color: 'var(--color-warning)', fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>Faible</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Interruptions cognitives</div>
        </Card>

        <Card style={{ 
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          padding: 'var(--spacing-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-xs)'
        }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 500 }}>Recovery Speed</div>
          <div style={{ color: 'var(--color-success)', fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>Rapide</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>~3 min pour se recentrer</div>
        </Card>
      </div>

      {/* Tomorrow Suggestion - Elevated for slight focus without distraction */}
      <div style={{ marginTop: 'var(--spacing-sm)' }}>
        <h3 style={{ 
          fontSize: '14px', 
          color: 'var(--color-text-secondary)', 
          marginBottom: 'var(--spacing-sm)', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          fontWeight: 600,
          margin: '0 0 var(--spacing-sm) 0'
        }}>
          Suggestion
        </h3>
        <Card style={{ 
          padding: 'var(--spacing-md)', 
          background: 'var(--color-elevated)',
          border: '1px solid var(--color-border)'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: 'var(--color-text-primary)',
            lineHeight: 1.5 
          }}>
            Tes sessions matinales montrent une stabilité 2x supérieure. Tu sembles mieux te concentrer en blocs de 45 minutes.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default memo(DashboardMetrics);
