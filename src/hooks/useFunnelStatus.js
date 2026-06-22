import { useState, useEffect, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "../api/authContext";

export function useFunnelStatus() {
  const { user } = useAuth();
  const [funnelStatus, setFunnelStatus] = useState({
    hasClients: true,
    hasEstimates: true,
    hasInvoices: true,
    loading: true,
  });

  const loadStatus = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/onboarding/funnel-status");
      if (res.data && res.data.data) {
        setFunnelStatus({
          hasClients: res.data.data.hasClients,
          hasEstimates: res.data.data.hasEstimates,
          hasInvoices: res.data.data.hasInvoices,
          loading: false,
        });
      }
    } catch (err) {
      console.error("Failed to load funnel status", err);
      // Fail open if there's an error so we don't trap the user
      setFunnelStatus({
        hasClients: true,
        hasEstimates: true,
        hasInvoices: true,
        loading: false,
      });
    }
  }, [user]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  return { ...funnelStatus, reloadFunnelStatus: loadStatus };
}
