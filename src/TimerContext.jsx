import { createContext, useCallback, useContext, useEffect, useRef, useMemo, useState } from "react";
import { useRefresh } from "./RefreshContext";
import { useToast } from "./ToastContext";
import { getClientsDashboard } from "./api/clients.api";
import { getProjects } from "./api/projets.api";
import { getActiveTimer, getTodayProjects } from "./api/timer.api";
import { useTimerActions } from "./hooks/useTimerActions";
import { useElapsedTicker, useIdleAndLongTimerMonitor } from "./hooks/useTimerPolling";
import { filterProjectsByClient, formatElapsedTime, getElapsedSeconds, hasAuthToken } from "./timerContext.helpers";

const TimerContext = createContext();

export function TimerProvider({ children }) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeEntry, setActiveEntry] = useState(null);
  const { refreshAppData } = useRefresh();
  const [description, setDescription] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProjet, setSelectedProjet] = useState("");
  const [clients, setClients] = useState([]);
  const [projets, setProjets] = useState([]);
  const [todayProjects, setTodayProjects] = useState([]);
  const { showToast } = useToast();
  const [note, setNote] = useState("");
  const [isLongRunning, setIsLongRunning] = useState(false);
  const [activeTimerWarning, setActiveTimerWarning] = useState(null);
  const longTimerAlertShownRef = useRef(false);
  const idleWarningShownRef = useRef(false);
  const [timerSettings, setTimerSettings] = useState({
    autoPauseEnabled: false,
    idleWarningSeconds: 270,
    idleAutoPauseSeconds: 300,
  });

  useEffect(() => {
    function loadTimerSettings() {
      try {
        const saved = JSON.parse(localStorage.getItem("settings") || "{}");

        setTimerSettings({
          autoPauseEnabled: saved.autoPauseEnabled === true,
          idleWarningSeconds: Number(saved.idleWarningSeconds || 270),
          idleAutoPauseSeconds: Number(saved.idleAutoPauseSeconds || 300),
        });
      } catch {
        setTimerSettings({
          autoPauseEnabled: false,
          idleWarningSeconds: 270,
          idleAutoPauseSeconds: 300,
        });
      }
    }

    loadTimerSettings();

    window.addEventListener("storage", loadTimerSettings);
    window.addEventListener("madsuite:settings-updated", loadTimerSettings);

    return () => {
      window.removeEventListener("storage", loadTimerSettings);
      window.removeEventListener("madsuite:settings-updated", loadTimerSettings);
    };
  }, []);
  const reloadTimerData = useCallback(async () => {
    if (!hasAuthToken()) return;

    try {
      const clientsData = await getClientsDashboard();
      const projetsData = await getProjects();

      setClients(clientsData || []);
      setProjets(projetsData || []);
    } catch (err) {
      console.error("TIMER DATA ERROR:", err.response?.data || err.message);
    }
  }, []);

  const loadActiveTimer = useCallback(async () => {
    if (!hasAuthToken()) return;

    try {
      const entry = await getActiveTimer();

      if (!entry) {
        setIsRunning(false);
        setActiveEntry(null);
        setElapsed(0);
        setIsLongRunning(false);
        setActiveTimerWarning(null);
        longTimerAlertShownRef.current = false;
        return;
      }

      setActiveEntry(entry);
      setIsRunning(true);
      setIsLongRunning(Boolean(entry.is_long_running));
      setActiveTimerWarning(entry.warning || null);

      if (entry.is_long_running && entry.warning && !longTimerAlertShownRef.current) {
        longTimerAlertShownRef.current = true;
        showToast(entry.warning, "warning");
      }

      setDescription(entry.description || "");
      setNote(entry.note || "");
      setSelectedProjet(String(entry.projet_id || ""));
      setSelectedClient(String(entry.client_id || ""));
      setElapsed(getElapsedSeconds(entry.start_time));
    } catch (err) {
      console.error("LOAD ACTIVE TIMER:", err.response?.data || err.message);
    }
  }, [showToast]);

  const loadTodayProjects = useCallback(async () => {
    if (!hasAuthToken()) return;

    try {
      setTodayProjects((await getTodayProjects()) || []);
    } catch (err) {
      console.error("LOAD TODAY PROJECTS:", err.response?.data || err.message);
    }
  }, []);

  const bootstrapAuthenticatedAppData = useCallback(async () => {
    if (!hasAuthToken()) return;

    try {
      // 1) Load active timer first (so UI can react quickly)
      await loadActiveTimer();

      // 2) Then load the rest in parallel (less chance of UI inconsistencies)
      await Promise.all([reloadTimerData(), loadTodayProjects()]);
    } catch (err) {
      console.error("BOOTSTRAP APP DATA ERROR:", err?.response?.data || err.message || err);
    }
  }, [loadActiveTimer, loadTodayProjects, reloadTimerData]);

  useEffect(() => {
    bootstrapAuthenticatedAppData();
  }, [bootstrapAuthenticatedAppData]);

  useElapsedTicker({ activeEntry, isRunning, setElapsed });

  const projetsFiltres = useMemo(() => filterProjectsByClient(projets, selectedClient), [projets, selectedClient]);

  const { restartProject, resumeProject, stopActiveTimer, toggleTimer, updateNote } = useTimerActions({
    clients,
    description,
    isRunning,
    loadTodayProjects,
    longTimerAlertShownRef,
    projets,
    refreshAppData,
    selectedClient,
    selectedProjet,
    setActiveEntry,
    setActiveTimerWarning,
    setDescription,
    setElapsed,
    setIsLongRunning,
    setIsRunning,
    setNote,
    setSelectedClient,
    setSelectedProjet,
    showToast,
  });

  useIdleAndLongTimerMonitor({
    activeEntry,
    elapsed,
    idleWarningShownRef,
    idleAutoPauseSeconds: timerSettings.idleAutoPauseSeconds,
    idleWarningSeconds: timerSettings.idleWarningSeconds,
    isAutoPauseEnabled: timerSettings.autoPauseEnabled,
    isRunning,
    longTimerAlertShownRef,
    setActiveTimerWarning,
    setIsLongRunning,
    showToast,
    toggleTimer,
  });

  const formatTime = useCallback((totalSeconds) => formatElapsedTime(totalSeconds), []);

  return (
    <TimerContext.Provider
      value={{
        isRunning,
        elapsed,
        elapsedFormatted: formatTime(elapsed),
        activeEntry,
        toggleTimer,
        formatTime,
        description,
        setDescription,
        note,
        setNote,
        updateNote,
        selectedClient,
        setSelectedClient,
        selectedProjet,
        setSelectedProjet,
        clients,
        projets,
        projetsFiltres,
        setProjets,
        todayProjects,
        loadTodayProjects,
        resumeProject,
        restartProject,
        reloadTimerData,
        loadActiveTimer,
        setActiveEntry,
        isLongRunning,
        activeTimerWarning,
        stopActiveTimer,
      }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  return useContext(TimerContext);
}
