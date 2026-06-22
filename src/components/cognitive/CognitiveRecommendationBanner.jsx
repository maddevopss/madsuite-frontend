import React, { useState, useEffect } from 'react';
import { useCognitiveState } from '../../hooks/useCognitiveState';
import { useTimer } from '../../TimerContext';


export default function CognitiveRecommendationBanner() {
  const { engineOutput } = useCognitiveState();
  const { activeTimer, stopTimer } = useTimer();
  
  const [dismissed, setDismissed] = useState(false);

  // If state changes, reset dismiss status
  useEffect(() => {
    setDismissed(false);
  }, [engineOutput.state]);

  if (dismissed) return null;

  const recommendation = engineOutput.recommendation;

  if (!recommendation || recommendation.type === 'none') {
    return null;
  }

  const handleAction = () => {
    if (recommendation.actionKey === 'pause') {
      if (activeTimer) {
        stopTimer(activeTimer.id); // Stop the active timer to take a break
      }
    }
    setDismissed(true);
  };

  // Styles based on state
  let bgColor = 'bg-[var(--bg-elevated)]';
  let borderColor = 'border-[var(--border-color)]';
  let icon = '💡';
  let labelColor = 'text-[var(--text-primary)]';

  if (recommendation.state === 'deep_focus') {
    icon = '🔵';
    borderColor = 'border-blue-500/30';
  } else if (recommendation.state === 'fatigue') {
    icon = '🟠';
    borderColor = 'border-orange-500/30';
  } else if (recommendation.state === 'friction') {
    icon = '🟡';
    borderColor = 'border-yellow-500/30';
  }

  return (
    <div className={`w-full max-w-md mx-auto my-4 p-4 rounded-xl border ${bgColor} ${borderColor} shadow-sm animate-fade-in`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl">{icon}</span>
          <div className="flex-1">
            <h4 className={`text-sm font-semibold ${labelColor} mb-1`}>
              {recommendation.state === 'friction' ? 'Difficulté à démarrer' : 
               recommendation.state === 'fatigue' ? 'Fatigue détectée' : 
               'Session profonde'}
            </h4>
            <p className="text-sm text-[var(--text-muted)]">
              {recommendation.title}
            </p>
          </div>
        </div>
        
        {recommendation.actionLabel && (
          <div className="flex justify-end mt-2">
            <button
              onClick={handleAction}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-[var(--bg-base)] border border-[var(--border-color)] hover:border-[var(--text-muted)] text-[var(--text-primary)] transition-colors"
            >
              {recommendation.actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
