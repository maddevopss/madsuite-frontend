import { useCallback, useEffect, useState } from "react";
import api from "../api/api";
import { getAccessToken } from "../api/tokenStore";

export function useRecentActivity({ pollMs = 30000, enabled = true } = {}) {
  const [activityLogs, setActivityLogs] = useState([]);
  const token = getAccessToken();

  const loadRecentActivity = useCallback(async () => {
    if (!enabled || !token) return [];

    const res = await api.get("/activity/recent");
    const rows = res.data || [];

    setActivityLogs(rows);
    return rows;
  }, [enabled, token]);

  useEffect(() => {
    if (!enabled || !token) return undefined;

    loadRecentActivity().catch(() => {});

    const interval = setInterval(() => {
      loadRecentActivity().catch(() => {});
    }, pollMs);

    return () => clearInterval(interval);
  }, [enabled, loadRecentActivity, pollMs, token]);

  return {
    activityLogs,
    loadRecentActivity,
  };
}
