import { useCallback } from "react";
import confetti from "canvas-confetti";

import { startTimer, startUnsortedTimer, stopTimer, updateActiveNote } from "../api/timer.api";
import { buildActiveEntry } from "../timerContext.helpers";

export function useTimerActions({
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
}) {
  const toggleTimer = useCallback(async () => {
    if (!isRunning) {
      try {
        let timerData;
        let project = null;
        let client = null;

        if (!selectedProjet) {
          timerData = await startUnsortedTimer(description || null);
          // the timerData might return project_id and client_id, we can load them or let bootstrap do it
          // for MVP, let's just trigger a full reload since the "À classer" project was just created
        } else {
          timerData = await startTimer({
            projet_id: Number(selectedProjet),
            description: description || null,
          });
          project = projets.find((p) => String(p.id) === String(selectedProjet));
          client = clients.find((c) => String(c.id) === String(selectedClient));
        }

        setActiveEntry(buildActiveEntry(timerData, { project, client, clientId: selectedClient }));
        showToast("Timer demarre", "success");
        setIsRunning(true);
        setElapsed(0);
        setIsLongRunning(false);
        setActiveTimerWarning(null);
        longTimerAlertShownRef.current = false;
        refreshAppData();
      } catch (err) {
        showToast("Erreur lors du demarrage du timer.", "error");
        console.error("START TIMER:", err.response?.data || err.message);
      }
      return;
    }

    try {
      await stopTimer();
      
      // Dopamine Hit / Gamification (TDAH)
      // On déclenche les confettis si le timer a roulé plus de 1 minute (60s) pour éviter le spam, 
      // ou on peut le déclencher à chaque fois pour l'instant (MVP).
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast("Timer arrete", "info");
      setIsRunning(false);
      setActiveEntry(null);
      setElapsed(0);
      setDescription("");
      setSelectedClient("");
      setSelectedProjet("");
      setIsLongRunning(false);
      setActiveTimerWarning(null);
      longTimerAlertShownRef.current = false;
      await loadTodayProjects();
      refreshAppData();
    } catch (err) {
      showToast("Erreur lors de l'arret du timer.", "error");
      console.error("STOP TIMER:", err.response?.data || err.message);
    }
  }, [
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
    setSelectedClient,
    setSelectedProjet,
    showToast,
  ]);

  const stopActiveTimer = useCallback(async () => {
    if (!isRunning) return;
    await toggleTimer();
  }, [isRunning, toggleTimer]);

  const resumeProject = useCallback(
    (entry) => {
      setSelectedClient(String(entry.client_id || ""));
      setSelectedProjet(String(entry.projet_id || ""));
      setDescription(entry.description || "");
    },
    [setDescription, setSelectedClient, setSelectedProjet],
  );

  const restartProject = useCallback(
    async (entry) => {
      if (isRunning) return;

      const projetId = String(entry.projet_id || "");
      const clientId = String(entry.client_id || "");

      if (!projetId || !clientId) return;

      setSelectedClient(clientId);
      setSelectedProjet(projetId);
      setDescription(entry.description || "");

      try {
        const timerData = await startTimer({
          projet_id: Number(projetId),
          description: entry.description || null,
        });
        const project = projets.find((p) => String(p.id) === projetId);
        const client = clients.find((c) => String(c.id) === clientId);

        setActiveEntry(buildActiveEntry(timerData, { project, client, clientId, fallbackEntry: entry }));
        setIsRunning(true);
        setElapsed(0);
        showToast("Projet repris", "success");
        refreshAppData();
      } catch (err) {
        showToast("Erreur lors de la reprise du projet.", "error");
        console.error("RESTART PROJECT:", err.response?.data || err.message);
      }
    },
    [
      clients,
      isRunning,
      projets,
      refreshAppData,
      setActiveEntry,
      setDescription,
      setElapsed,
      setIsRunning,
      setSelectedClient,
      setSelectedProjet,
      showToast,
    ],
  );

  const updateNote = useCallback(
    async (newNote) => {
      try {
        await updateActiveNote(newNote);
        setNote(newNote);
        setActiveEntry((prev) => (prev ? { ...prev, note: newNote } : prev));
      } catch (err) {
        showToast("Erreur lors de la mise a jour de la note.", "error");
        console.error("UPDATE NOTE:", err.response?.data || err.message);
      }
    },
    [setActiveEntry, setNote, showToast],
  );

  return {
    restartProject,
    resumeProject,
    stopActiveTimer,
    toggleTimer,
    updateNote,
  };
}
