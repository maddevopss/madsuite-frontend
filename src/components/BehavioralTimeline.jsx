import { useMemo } from "react";

export default function BehavioralTimeline({ sessionLogs = [], totalDurationSeconds = 1 }) {
  const segments = useMemo(() => {
    if (!sessionLogs || sessionLogs.length === 0) return [];

    // Trier chronologiquement
    const sorted = [...sessionLogs].sort((a, b) => new Date(a.captured_at) - new Date(b.captured_at));

    return sorted.map((log, index) => {
      const duration = log.duration_seconds || 10;
      const widthPercent = Math.max(1, (duration / totalDurationSeconds) * 100);
      
      let type = "focus"; // default
      let color = "var(--color-success)";
      
      if (log.is_idle) {
        type = "interruption";
        color = "var(--color-surface-hover)"; // Gris très doux
      } else if (log.activity_category === 'Distraction' || log.activity_category === 'Exploration Libre') {
        type = "shift";
        color = "var(--color-warning)"; // Jaune (léger drift), pas de rouge agressif
      } else {
        color = "var(--color-success)"; // Vert pour le flow
      }

      return {
        id: log.id || index,
        app: log.app_name || "Inconnu",
        category: log.activity_category || "Focus",
        durationMinutes: Math.max(1, Math.round(duration / 60)),
        widthPercent,
        color,
        type
      };
    });
  }, [sessionLogs, totalDurationSeconds]);

  if (segments.length === 0) {
    return (
      <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
        Pas assez de données pour reconstruire la timeline.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        <span>Début</span>
        <span>Fin</span>
      </div>
      
      <div style={{ 
        display: 'flex', 
        height: '24px', 
        borderRadius: '12px', 
        overflow: 'hidden',
        background: 'var(--color-surface-hover)',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {segments.map((segment, idx) => (
          <div
            key={segment.id}
            title={`${segment.app} (${segment.durationMinutes} min)`}
            style={{
              width: `${segment.widthPercent}%`,
              backgroundColor: segment.color,
              borderRight: idx < segments.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none',
              cursor: 'help',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '12px', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
          <span>Stable Flow</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-warning)' }}></span>
          <span>Cognitive Shift</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-surface-hover)' }}></span>
          <span>Recovery / Idle</span>
        </div>
      </div>
    </div>
  );
}
