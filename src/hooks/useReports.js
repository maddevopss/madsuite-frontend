import { useCallback, useEffect, useState } from "react";
import { useRefresh } from "../RefreshContext";
import { useToast } from "../ToastContext";
import { useAuth } from "../api/authContext";
import api from "../api/api";
import { getAccessToken } from "../api/tokenStore";

const defaultTotal = {
  heures: 0,
  heures_facturables: 0,
  montant_estime: 0,
  montant_facture: 0,
};

const getPeriodDates = (period) => {
  const now = new Date();

  let start;

  switch (period) {
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;

    case "quarter": {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), quarterStartMonth, 1);
      break;
    }

    case "month":
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const end = new Date(now);
  end.setDate(end.getDate() + 1);

  return {
    date_debut: start.toISOString().split("T")[0],
    date_fin: end.toISOString().split("T")[0],
  };
};

export function useReports() {
  const { refreshKey } = useRefresh();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [period, setPeriod] = useState("month");
  const [groupBy, setGroupBy] = useState("");
  const [isBilled, setIsBilled] = useState("");

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(defaultTotal);

  const [timeEntries, setTimeEntries] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [windowsLogs, setWindowsLogs] = useState([]);

  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingDebug, setLoadingDebug] = useState(false);

  // ------------------------------
  // LOAD REPORT
  // ------------------------------

  const loadReport = useCallback(async () => {
    const token = getAccessToken();

    if (!token) return;

    try {
      setLoadingReport(true);

      const { date_debut, date_fin } = getPeriodDates(period);

      const res = await api.get("/reports", {
        params: {
          date_debut,
          date_fin,
          ...(groupBy ? { group_by: groupBy } : {}),
          ...(isBilled ? { is_billed: isBilled } : {}),
        },
      });

      setRows(res.data.rows || []);

      setTotal({
        ...defaultTotal,
        ...(res.data.total || {}),
      });
    } catch (err) {
      showToast("Erreur lors du chargement du rapport.", "error");

      console.error("REPORTS ERROR:", err.response?.data || err.message);
    } finally {
      setLoadingReport(false);
    }
  }, [period, groupBy, isBilled, showToast]);

  // ------------------------------
  // LOAD DEBUG TABLES
  // ------------------------------

  const loadDebugTables = useCallback(async () => {
    const token = getAccessToken();

    if (!token) return;

    // Route backend protégée admin aussi
    if (user?.role !== "admin") return;

    try {
      setLoadingDebug(true);

      const [timeEntriesRes, activityLogsRes, windowsLogsRes] = await Promise.all([
        api.get("/reports/debug/time_entries"),
        api.get("/reports/debug/activity_logs"),
        api.get("/reports/debug/window_logs"),
      ]);

      setTimeEntries(timeEntriesRes.data || []);
      setActivityLogs(activityLogsRes.data || []);
      setWindowsLogs(windowsLogsRes.data || []);
    } catch (err) {
      showToast("Erreur lors du chargement des tables debug.", "error");

      console.error("DEBUG TABLES ERROR:", err.response?.data || err.message);
    } finally {
      setLoadingDebug(false);
    }
  }, [showToast, user]);

  // ------------------------------
  // EFFECTS
  // ------------------------------

  useEffect(() => {
    loadReport();
  }, [loadReport, refreshKey]);

  // ------------------------------
  // RETURN
  // ------------------------------

  return {
    period,
    setPeriod,
    groupBy,
    setGroupBy,
    isBilled,
    setIsBilled,

    rows,
    total,

    timeEntries,
    activityLogs,
    windowsLogs,

    loadingReport,
    loadingDebug,

    loadReport,
    loadDebugTables,
  };
}
