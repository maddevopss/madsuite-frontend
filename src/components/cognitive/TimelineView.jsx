import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const STATE_COLORS = {
  flow: 'text-green-500',
  deep_focus: 'text-blue-500',
  friction: 'text-yellow-500',
  fatigue: 'text-orange-500'
};

const STATE_ICONS = {
  flow: '🟢',
  deep_focus: '🔵',
  friction: '🟡',
  fatigue: '🟠'
};

const STATE_LABELS = {
  flow: 'Flow',
  deep_focus: 'Session profonde',
  friction: 'Friction',
  fatigue: 'Fatigue'
};

export default function TimelineView({ date = 'today' }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const targetDate = date === 'today' ? new Date().toISOString().split('T')[0] : date;
        const response = await api.get(`/cognitive/timeline?date=${targetDate}`);
        setEvents(response.data || []);
      } catch (error) {
        console.error("Erreur lors de la récupération de la timeline:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [date]);

  const formatTime = (isoString) => {
    if (!isoString) return 'En cours';
    const d = new Date(isoString);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="animate-pulse text-sm text-[var(--text-muted)]">Chargement de la mémoire cognitive...</div>;
  }

  if (events.length === 0) {
    return null; // Pas de timeline à afficher
  }

  const startTime = formatTime(events[0]?.started_at);

  return (
    <div className="w-full max-w-md mx-auto my-6 font-mono text-sm">
      <div className="flex items-center text-[var(--text-muted)] mb-4">
        <span>{startTime}</span>
        <span className="flex-1 border-t border-[var(--border-color)] mx-3" />
      </div>

      <div className="space-y-4 pl-4 border-l-2 border-[var(--bg-elevated)]">
        {events.map((ev, i) => {
          const colorClass = STATE_COLORS[ev.state] || 'text-gray-400';
          const icon = STATE_ICONS[ev.state] || '⚪';
          const label = STATE_LABELS[ev.state] || ev.state;

          return (
            <div key={ev.id || i} className="relative">
              {/* Dot sur la ligne */}
              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--bg-base)]" />
              
              <div className="flex flex-col">
                <span className="flex items-center gap-2 font-semibold">
                  <span>{icon}</span>
                  <span className={colorClass}>{label}</span>
                </span>
                <span className="text-xs text-[var(--text-muted)] mt-1">
                  {formatTime(ev.started_at)} → {formatTime(ev.ended_at)} 
                  {ev.duration_minutes > 0 && ` (${ev.duration_minutes} min)`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
