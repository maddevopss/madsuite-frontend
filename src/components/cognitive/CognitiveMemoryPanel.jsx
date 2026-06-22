import React, { useEffect, useState } from 'react';
import api from '../../api/api';

export default function CognitiveMemoryPanel() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/cognitive/memory-profile?range=${range}`);
        setProfile(response.data);
      } catch (error) {
        console.error("Erreur memory profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [range]);

  if (loading && !profile) {
    return <div className="text-sm text-[var(--text-muted)] p-4">Extraction du profil cognitif...</div>;
  }

  if (!profile || Object.keys(profile).length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto my-4 p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-semibold text-[var(--text-primary)]">🧠 Ton profil cognitif</h3>
        <select 
          value={range} 
          onChange={(e) => setRange(e.target.value)}
          className="bg-[var(--bg-base)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-[var(--text-muted)] outline-none"
        >
          <option value="30d">30 Jours</option>
          <option value="90d">90 Jours</option>
        </select>
      </div>

      <div className="space-y-4">
        <div>
          <span className="block text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Durée moyenne de session :</span>
          <div className="font-medium text-[var(--text-primary)]">
            {profile.avgSessionDuration} min
          </div>
        </div>

        <div>
          <span className="block text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Plage horaire active :</span>
          <div className="font-medium text-[var(--text-primary)]">
            {profile.activeHoursRange}
          </div>
        </div>

        <div>
          <span className="block text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Indice de stabilité :</span>
          <div className="font-medium text-[var(--text-primary)]">
            {profile.stabilityIndex}%
          </div>
        </div>
      </div>
    </div>
  );
}
