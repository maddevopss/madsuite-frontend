import React, { useEffect, useState } from 'react';
import api from '../../api/api';

export default function DailyCognitiveInsight({ date = 'today' }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const targetDate = date === 'today' ? new Date().toISOString().split('T')[0] : date;
        const response = await api.get(`/cognitive/insight?date=${targetDate}`);
        setInsight(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération du daily insight:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [date]);

  const formatMinutes = (mins) => {
    if (!mins) return '0 min';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  };

  if (loading) {
    return <div className="animate-pulse text-sm text-[var(--text-muted)]">Chargement du résumé cognitif...</div>;
  }

  // Si pas de données encore pour aujourd'hui (cron non passé ou session en cours)
  if (!insight) {
    return null; 
  }

  return (
    <div className="w-full max-w-md mx-auto my-6 p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
      <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">📊 Aujourd'hui</h3>
      
      <div className="space-y-2 mb-6 text-sm">
        <div className="flex justify-between items-center">
          <span>🔵 Session profonde totale :</span>
          <span className="font-semibold">{formatMinutes(insight.deep_focus_minutes)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>🟢 Flow :</span>
          <span className="font-semibold">{formatMinutes(insight.flow_minutes)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>🟠 Fatigue :</span>
          <span className="font-semibold">{formatMinutes(insight.fatigue_minutes)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>🟡 Friction :</span>
          <span className="font-semibold">{formatMinutes(insight.friction_minutes)}</span>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-[var(--border-color)] text-sm">
        <div className="flex items-center gap-2">
          <span>💡</span>
          <span className="text-[var(--text-muted)]">Session la plus longue :</span>
          <span className="font-semibold">{formatMinutes(insight.longest_session_minutes)}</span>
        </div>
        
        {insight.dominant_project_name && (
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span className="text-[var(--text-muted)]">Projet dominant :</span>
            <span className="font-semibold text-blue-500">{insight.dominant_project_name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
