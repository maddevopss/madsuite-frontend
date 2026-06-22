import { useState, useEffect, useMemo, useCallback } from "react";
import { useTimer } from "../TimerContext";
import api from "../api/api";

export function useHeaderState() {
  const timer = useTimer();
  const {
    isRunning,
    description,
    setDescription,
    selectedClient,
    setSelectedClient,
    selectedProjet,
    setSelectedProjet,
    clients,
    projetsFiltres,
    toggleTimer,
    elapsedFormatted,
    setProjets,
    activeEntry,
    todayProjects,
    resumeProject,
    note,
    updateNote,
    setNote,
    isLongRunning,
    activeTimerWarning,
    stopActiveTimer,
    elapsed,
  } = timer;

  const [showFocusTunnel, setShowFocusTunnel] = useState(false);
  const [showAnchorRitual, setShowAnchorRitual] = useState(false);
  const [showCognitiveMirror, setShowCognitiveMirror] = useState(false);
  const [mirrorData, setMirrorData] = useState({ intent: "", startTime: null, endTime: null });
  const [isPulsing, setIsPulsing] = useState(false);
  const [syncPendingCount, setSyncPendingCount] = useState(0);

  const progressPercent = useMemo(() => {
    if (!isRunning) return 0;
    return Math.min(100, ((elapsed || 0) % 3600) / 3600 * 100);
  }, [isRunning, elapsed]);

  const visibleTodayProjects = useMemo(() => todayProjects.slice(0, 4), [todayProjects]);

  useEffect(() => {
    if (window.agentAPI && window.agentAPI.onSyncStatusUpdate) {
      return window.agentAPI.onSyncStatusUpdate((stats) => {
        if (stats && typeof stats.pendingCount === 'number') {
          setSyncPendingCount(stats.pendingCount);
        }
      });
    }
  }, []);

  useEffect(() => {
    let timeout;
    if (!isRunning) {
      timeout = setTimeout(() => setIsPulsing(true), 120000); // 2 minutes
    } else {
      setIsPulsing(false);
    }
    return () => clearTimeout(timeout);
  }, [isRunning]);

  const handlePlayClick = () => {
    if (!isRunning) {
      if (!description || description.trim() === "") {
        setShowAnchorRitual(true);
      } else {
        toggleTimer();
      }
    } else {
      if (activeEntry && activeEntry.start_time) {
        setMirrorData({
          intent: description,
          startTime: activeEntry.start_time,
          endTime: new Date().toISOString(),
        });
        setShowCognitiveMirror(true);
      }
      toggleTimer();
    }
  };

  const handleAnchorConfirm = (action) => {
    setDescription(action);
    setShowAnchorRitual(false);
    setTimeout(() => {
      if (!isRunning) toggleTimer();
    }, 50);
  };

  const loadProjets = useCallback(async () => {
    try {
      const res = await api.get("/timesheet/projets");
      setProjets(res.data || []);
    } catch (err) {
      console.error("LOAD TIMER PROJECTS:", err);
    }
  }, [setProjets]);

  const handleClientChange = useCallback(
    (e) => {
      setSelectedClient(e.target.value);
      setSelectedProjet("");
    },
    [setSelectedClient, setSelectedProjet],
  );

  const handleProjetChange = useCallback((e) => setSelectedProjet(e.target.value), [setSelectedProjet]);
  const handleSaveNote = useCallback(() => updateNote(note), [note, updateNote]);

  useEffect(() => {
    loadProjets();
    window.addEventListener("focus", loadProjets);
    window.addEventListener("projects-updated", loadProjets);
    return () => {
      window.removeEventListener("focus", loadProjets);
      window.removeEventListener("projects-updated", loadProjets);
    };
  }, [loadProjets]);

  useEffect(() => {
    if (!selectedClient || isRunning) return;
    const loadClientProjects = async () => {
      try {
        const res = await api.get(`/projets/client/${selectedClient}`);
        setProjets(res.data || []);
      } catch (err) {
        console.error("LOAD CLIENT PROJECTS:", err.response?.data || err.message);
      }
    };
    loadClientProjects();
  }, [selectedClient, isRunning, setProjets]);

  return {
    state: {
      isRunning,
      description,
      selectedClient,
      selectedProjet,
      clients,
      projetsFiltres,
      elapsedFormatted,
      activeEntry,
      note,
      isLongRunning,
      activeTimerWarning,
      progressPercent,
      showFocusTunnel,
      showAnchorRitual,
      showCognitiveMirror,
      mirrorData,
      isPulsing,
      syncPendingCount,
      visibleTodayProjects,
    },
    actions: {
      setDescription,
      stopActiveTimer,
      setNote,
      handleSaveNote,
      handleClientChange,
      handleProjetChange,
      handlePlayClick,
      setShowFocusTunnel,
      setShowAnchorRitual,
      setShowCognitiveMirror,
      handleAnchorConfirm,
      resumeProject,
    },
  };
}
