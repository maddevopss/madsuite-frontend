import { useCallback, useEffect, useMemo, useState } from "react";
import { useRefresh } from "../RefreshContext";
import { useToast } from "../ToastContext";
import api from "../api/api";

const defaultStats = {
  semaine: 0,
  mois: 0,
  facturable: 0,
  montant_a_facturer: 0,
  par_client: [],
  par_jour: [],
};

export function useDashboard() {
  const { refreshKey } = useRefresh();
  const { showToast } = useToast();

  const [stats, setStats] = useState(defaultStats);

  const [loading, setLoading] = useState(true);

  // Charge les statistiques du dashboard
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/timesheet/dashboard");

      setStats({
        ...defaultStats,
        ...(res.data || {}),
      });
    } catch (err) {
      showToast("Erreur lors du chargement des statistiques.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Recharge les statistiques au montage et lors d'un refresh global
  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshKey]);

  // Sécurise les données reçues avant affichage
  const parClient = useMemo(() => {
    return Array.isArray(stats.par_client) ? stats.par_client : [];
  }, [stats.par_client]);

  const parJour = useMemo(() => {
    return Array.isArray(stats.par_jour) ? stats.par_jour : [];
  }, [stats.par_jour]);

  // Calcule le maximum d'heures pour les graphiques clients
  const maxHeures = useMemo(() => {
    return Math.max(...parClient.map((c) => parseFloat(c.heures || 0)), 1);
  }, [parClient]);

  // Prépare les données du graphique journalier
  const chartData = useMemo(() => {
    return parJour.map((j) => ({
      jour: formatJour(j.jour),
      heures: parseFloat(j.heures || 0),
    }));
  }, [parJour]);

  return {
    stats,
    loading,
    parClient,
    parJour,
    maxHeures,
    chartData,

    fetchStats,
  };
}

function formatJour(dateValue) {
  if (!dateValue) return "";

  return new Date(dateValue).toLocaleDateString("fr-CA", {
    weekday: "short",
  });
}
