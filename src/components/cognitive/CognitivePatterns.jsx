import React, { useEffect, useState } from 'react';
import api from '../../api/api';

export default function CognitivePatterns() {
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');

  useEffect(() => {
    const fetchPatterns = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/cognitive/patterns?range=${range}`);
        setPatterns(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des patterns:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatterns();
  }, [range]);

  if (loading && !patterns) {
    return <div className="animate-pulse text-sm text-[var(--text-muted)] my-6">Analyse des habitudes cognitives...</div>;
  }

  if (!patterns || Object.keys(patterns).length === 0) {
    return null; // Pas assez de données
  }

  const {
    bestFocusWindow,
    worstFocusWindow,
    dominantProject,
    averageTimeToDeepFocus,
    averageContextSwitches
  } = patterns;

  return (
    <div className="w-full max-w-md mx-auto my-6 p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">🧠 Historique Cognitif</h3>
        <div className="flex gap-2 text-xs">
          {['7d', '14d', '30d'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-1 rounded ${range === r ? 'bg-[var(--bg-base)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              {r.replace('d', ' j')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5 text-sm">
        {bestFocusWindow && (
          <div>
            <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
              <span>🕒</span>
              <span>Meilleure période de focus</span>
            </div>
            <div className="pl-6 mt-1 text-[var(--text-muted)]">
              {bestFocusWindow.start} → {bestFocusWindow.end}
              <span className="block text-xs mt-0.5">{bestFocusWindow.confidence}% de tes sessions profondes</span>
            </div>
          </div>
        )}

        {worstFocusWindow && (
          <div>
            <div className="flex items-center gap-2 font-semibold text-yellow-500">
              <span>⚠️</span>
              <span>Période difficile</span>
            </div>
            <div className="pl-6 mt-1 text-[var(--text-muted)]">
              {worstFocusWindow.start} → {worstFocusWindow.end}
              <span className="block text-xs mt-0.5">Haute fragmentation cognitive</span>
            </div>
          </div>
        )}

        {dominantProject && (
          <div>
            <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
              <span>🎯</span>
              <span>Projet dominant</span>
            </div>
            <div className="pl-6 mt-1 text-blue-500 font-medium">
              {dominantProject.projectName}
            </div>
          </div>
        )}

        {averageTimeToDeepFocus != null && (
          <div>
            <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
              <span>⏱</span>
              <span>Temps d'entrée en focus</span>
            </div>
            <div className="pl-6 mt-1 text-[var(--text-muted)]">
              ~{averageTimeToDeepFocus} minutes en moyenne
            </div>
          </div>
        )}

        {averageContextSwitches !== undefined && (
          <div>
            <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
              <span>🔀</span>
              <span>Changements de contexte</span>
            </div>
            <div className="pl-6 mt-1 text-[var(--text-muted)]">
              {averageContextSwitches} en moyenne par jour
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
