import { memo, useState } from 'react';
import { useCognitiveState } from '../../hooks/useCognitiveState';
import { env } from '../../env';

function CognitiveMetricsPanel() {
  const { pageMetrics, pageBudget, cognitiveState, setCognitiveState, engineOutput } = useCognitiveState();
  const [collapsed, setCollapsed] = useState(false);

  // if (env.NODE_ENV !== 'development') return null;

  const safeMetrics = pageMetrics || {
    score: 0,
    visibleActions: 0,
    visibleColors: 0,
    animationsActive: 0,
    competingCTAs: 0,
    visiblePanels: 0,
  };

  const safeBudget = pageBudget || { maxScore: 45 };

  const isOverBudget =
    safeMetrics.score > (safeBudget.maxScore || 45);

  if (collapsed) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 9999,
          background: 'var(--color-surface)',
          padding: '8px',
          borderRadius: '50%',
          border: `2px solid ${isOverBudget ? 'var(--color-danger)' : 'var(--color-success)'}`,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={() => setCollapsed(false)}
      >
        🧠
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: 9999,
      background: 'var(--color-surface)',
      border: `1px solid ${isOverBudget ? 'var(--color-danger)' : 'var(--color-border)'}`,
      borderRadius: 'var(--radius-md)',
      padding: 'var(--spacing-md)',
      boxShadow: 'var(--shadow-lg)',
      width: '280px',
      fontSize: '13px',
      color: 'var(--color-text-primary)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          🧠 Cognitive Metrics
          {isOverBudget && (
            <span style={{
              color: 'var(--color-background)',
              background: 'var(--color-danger)',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              OVERLOAD
            </span>
          )}
        </strong>

        <button
          onClick={() => setCollapsed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Current CLS:</span>
        <strong style={{ color: isOverBudget ? 'var(--color-danger)' : 'var(--color-success)' }}>
          {safeMetrics.score}
        </strong>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
        <span>Budget Max:</span>
        <span>{safeBudget.maxScore || 45}</span>
      </div>

      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
          Breakdown:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px' }}>
          <div>Actions: {safeMetrics.visibleActions}</div>
          <div>Colors: {safeMetrics.visibleColors}</div>
          <div>Anims: {safeMetrics.animationsActive}</div>
          <div>CTAs: {safeMetrics.competingCTAs}</div>
          <div>Panels: {safeMetrics.visiblePanels}</div>
        </div>
      </div>

      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
          Simulate State (Override):
        </div>

        <select
          value={cognitiveState}
          onChange={(e) =>
            setCognitiveState(e.target.value === "AUTO" ? null : e.target.value)
          }
          style={{
            width: '100%',
            padding: '4px',
            borderRadius: '4px',
            background: 'var(--color-background)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <option value="AUTO">-- Auto (Engine) --</option>
          <option value="flow">Flow</option>
          <option value="deep_focus">Session profonde (Deep Focus)</option>
          <option value="fatigue">Fatigue</option>
          <option value="friction">Friction</option>
        </select>
      </div>

      {engineOutput && (
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid var(--color-border)',
          fontSize: '11px',
          color: 'var(--color-text-secondary)'
        }}>
          <div>
            <strong>Engine:</strong> {engineOutput.state} ({Math.round((engineOutput.confidence || 0) * 100)}%)
          </div>

          <div>
            <em>Score: {engineOutput.score ?? 0}</em>
          </div>

          <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0' }}>
            {(engineOutput.reasons || []).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default memo(CognitiveMetricsPanel);