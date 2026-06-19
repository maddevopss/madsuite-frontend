import { useEffect, useMemo, useState } from "react";
import { useTimer } from "../TimerContext";
import { classifyActivity, detectProjectFromTitle } from "../utils/activityClassifier";
import { useRecentActivity } from "./useRecentActivity";

export function useActivitySuggestions() {
  const todayKey = new Date().toISOString().split("T")[0];
  const storageKey = `ignoredActivitySuggestions:${todayKey}`;
  const { isRunning, activeEntry, projets } = useTimer();
  const { activityLogs } = useRecentActivity();

  const [ignoredProjectId, setIgnoredProjectId] = useState(null);
  const [stableSuggestion, setStableSuggestion] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [ignoredTodayProjectIds, setIgnoredTodayProjectIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(ignoredTodayProjectIds));
  }, [ignoredTodayProjectIds, storageKey]);

  const rawSuggestion = useMemo(() => {
    if (!activityLogs || activityLogs.length === 0) return null;

    const latest = activityLogs[0];
    const activity = classifyActivity(latest.app_name, latest.window_title);
    const detectedProject = detectProjectFromTitle(latest.window_title, projets);

    if (!detectedProject) return null;
    if (ignoredProjectId === detectedProject.id) return null;
    if (ignoredTodayProjectIds.includes(detectedProject.id)) return null;
    if (isRunning && String(activeEntry?.projet_id) === String(detectedProject.id)) return null;
    if (activity.confidence < 0.7) return null;

    return {
      activity,
      project: detectedProject,
      source: latest,
      signature: `${latest.app_name}-${latest.window_title}-${detectedProject.id}`,
    };
  }, [activityLogs, projets, ignoredProjectId, ignoredTodayProjectIds, isRunning, activeEntry]);

  useEffect(() => {
    if (!rawSuggestion) {
      setCandidate(null);
      setStableSuggestion(null);
      return;
    }

    if (candidate?.signature !== rawSuggestion.signature) {
      setCandidate({ ...rawSuggestion, firstSeenAt: Date.now() });
      setStableSuggestion(null);
      return;
    }

    if (Date.now() - candidate.firstSeenAt >= 60000) {
      setStableSuggestion(rawSuggestion);
    }
  }, [rawSuggestion, candidate]);

  const ignoreSuggestion = () => {
    if (stableSuggestion?.project?.id) {
      setIgnoredProjectId(stableSuggestion.project.id);
    }
    setStableSuggestion(null);
  };

  const ignoreSuggestionForToday = () => {
    if (stableSuggestion?.project?.id) {
      setIgnoredTodayProjectIds((prev) => [...new Set([...prev, stableSuggestion.project.id])]);
    }
    setStableSuggestion(null);
  };

  return {
    suggestion: stableSuggestion,
    ignoreSuggestion,
    ignoreSuggestionForToday,
  };
}
