import React, { useEffect, useState } from "react";
import api from "../api/api";

const PurgeNotification = () => {
  const [purgeInfo, setPurgeInfo] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchLatestPurge = async () => {
      try {
        // On cherche uniquement le dernier log de purge
        const response = await api.get("/organisation/audit-logs?action=system.purge_executed&limit=1");
        const latestLog = response?.data?.data?.[0];

        if (latestLog) {
          const lastSeenPurge = localStorage.getItem("last_seen_purge_id");

          // On ne l'affiche que si c'est un nouveau log (ID différent)
          if (lastSeenPurge !== String(latestLog.id)) {
            setPurgeInfo(latestLog);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV !== "test") {
          console.error("Erreur lors de la récupération du statut de maintenance", err);
        }
      }
    };

    fetchLatestPurge();
  }, []);

  // Auto-dismiss après 8 secondes
  useEffect(() => {
    if (purgeInfo && !dismissed) {
      const timer = setTimeout(() => handleDismiss(), 8000);
      return () => clearTimeout(timer);
    }
  }, [purgeInfo, dismissed]);

  const handleDismiss = () => {
    if (purgeInfo) {
      localStorage.setItem("last_seen_purge_id", purgeInfo.id);
      setDismissed(true);
    }
  };

  if (!purgeInfo || dismissed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] w-80 bg-gray-900 text-white shadow-2xl rounded-lg border-l-4 border-indigo-500 p-4 flex items-start space-x-3 animate-in fade-in slide-in-from-right-5 duration-500">
      <div className="text-xl shrink-0">🛡️</div>
      <div className="flex-1">
        <p className="font-bold text-xs uppercase tracking-wider text-indigo-400">Sécurité & Rétention</p>
        <p className="text-xs mt-1 leading-relaxed">
          La purge RGPD a été exécutée avec succès le {new Date(purgeInfo.created_at).toLocaleDateString()}.
        </p>
      </div>
      <button onClick={handleDismiss} className="text-gray-400 hover:text-white transition-colors" title="Fermer">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default PurgeNotification;
