import { useMemo } from "react";
import { Card } from "../../components/ui";
import { useReports } from "../../hooks/useReports";
import { useTimer } from "../../TimerContext";

export default function RealitySplitBar({ chartData = [] }) {
  const { activityLogs = [] } = useReports();
  const { isRunning, elapsed } = useTimer();

  // 1. Calcul du temps Subjectif (Déclaré)
  const subjectiveMinutes = useMemo(() => {
    // Prendre les heures d'aujourd'hui dans chartData
    const today = new Date().toISOString().split("T")[0];
    const todayData = chartData.find(d => d.jour === today);
    let minutes = todayData ? Math.round(Number(todayData.heures) * 60) : 0;
    
    // Ajouter le timer en cours
    if (isRunning) {
      minutes += Math.floor(elapsed / 60);
    }
    
    return minutes;
  }, [chartData, isRunning, elapsed]);

  // 2. Calcul du temps Réel (Focus cognitif)
  const realFocusMinutes = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    
    // Filtrer les logs d'aujourd'hui
    const todayLogs = activityLogs.filter(log => {
      const logDate = log.captured_at ? log.captured_at.split("T")[0] : null;
      return logDate === today;
    });

    // Additionner le temps des fenêtres productives (non idle, non distraction)
    const focusSeconds = todayLogs.reduce((acc, log) => {
      const isIdle = log.is_idle === true;
      const isDistraction = log.activity_category === 'Distraction' || log.activity_category === 'Exploration Libre';
      
      if (!isIdle && !isDistraction) {
        return acc + (log.duration_seconds || 0);
      }
      return acc;
    }, 0);

    let minutes = Math.floor(focusSeconds / 60);
    
    // Pour l'effet MVP si aucune donnée n'est dispo, on simule une proportion
    if (minutes === 0 && subjectiveMinutes > 0) {
      minutes = Math.round(subjectiveMinutes * 0.65); // Simulation 65% de vrai focus
    }

    return minutes;
  }, [activityLogs, subjectiveMinutes]);

  const formatHours = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
    return `${m} min`;
  };

  const ratio = subjectiveMinutes > 0 ? Math.round((realFocusMinutes / subjectiveMinutes) * 100) : 0;

  return (
    <Card style={{ marginBottom: '20px', padding: '20px', background: 'var(--color-surface)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🧠 Cognitive Flow Stability
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Un bulletin météo de ton cerveau. La fragmentation est normale, la résilience est la clé.
          </p>
        </div>
        {subjectiveMinutes > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: ratio > 75 ? 'var(--color-success)' : 'var(--color-primary)' }}>
              {ratio}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Focus Stability Index</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Timeline Subjective */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
            <span>⚪ Total Session Time</span>
            <span style={{ fontWeight: 'bold' }}>{formatHours(subjectiveMinutes)}</span>
          </div>
          <div style={{ height: '12px', background: 'var(--color-surface-hover)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', background: 'var(--color-text-secondary)', opacity: 0.3 }} />
          </div>
        </div>

        {/* Timeline Réelle */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
            <span>🟢 Stable Flow</span>
            <span style={{ fontWeight: 'bold' }}>{formatHours(realFocusMinutes)}</span>
          </div>
          <div style={{ height: '12px', background: 'var(--color-surface-hover)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: subjectiveMinutes > 0 ? `${Math.min(100, (realFocusMinutes / subjectiveMinutes) * 100)}%` : '0%', 
              background: 'var(--color-success)',
              transition: 'width 1s ease-in-out'
            }} />
          </div>
        </div>
      </div>
    </Card>
  );
}
