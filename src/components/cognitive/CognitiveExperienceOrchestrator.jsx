import React, { useState } from 'react';
import { useCognitiveState } from '../../hooks/useCognitiveState';

import StateView from './StateView';
import CognitiveRecommendationBanner from './CognitiveRecommendationBanner';
import TimelineView from './TimelineView';
import DailyCognitiveInsight from './DailyCognitiveInsight';
import CognitivePatterns from './CognitivePatterns';
import CognitiveMemoryPanel from './CognitiveMemoryPanel';

export default function CognitiveExperienceOrchestrator() {
  const { engineOutput } = useCognitiveState();
  const [showSecondary, setShowSecondary] = useState(false);

  const state = engineOutput?.state || 'flow';

  // Logique UI pure et simple (Pas de réflexion)
  const isMinimalView = ['deep_focus', 'fatigue', 'friction'].includes(state);

  return (
    <div className="flex flex-col gap-2">
      {/* NIVEAU 1 : Toujours visible */}
      <StateView />

      {/* NIVEAU 2 : Contextuel pur */}
      <div className="min-h-[100px]">
        {isMinimalView ? <CognitiveRecommendationBanner /> : <TimelineView />}
      </div>

      {/* NIVEAU 3 : Secondaire */}
      <div className="mt-2 mb-6">
        <button 
          onClick={() => setShowSecondary(!showSecondary)}
          className="w-full max-w-md mx-auto block text-center text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-2"
        >
          {showSecondary ? 'Masquer l\'historique cognitif' : '📊 Ouvrir le miroir cognitif'}
        </button>

        {showSecondary && (
          <div className="animate-fade-in flex flex-col gap-4 mt-4">
            <DailyCognitiveInsight />
            <CognitivePatterns />
            <CognitiveMemoryPanel />
          </div>
        )}
      </div>
    </div>
  );
}
