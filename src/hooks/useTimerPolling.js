import { useEffect, useRef } from "react";

import { syncTimerState } from "../api/timer.api";
import { getElapsedSeconds } from "../timerContext.helpers";

const DEFAULT_IDLE_WARNING_SECONDS = 270;
const DEFAULT_IDLE_AUTO_PAUSE_SECONDS = 300;
const IDLE_TOAST_COOLDOWN_MS = 5 * 60 * 1000;
const LONG_TIMER_REMINDER_MS = 60 * 60 * 1000;

export function useElapsedTicker({ activeEntry, isRunning, setElapsed }) {
  useEffect(() => {
    if (!isRunning || !activeEntry?.start_time) return undefined;

    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds(activeEntry.start_time));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, activeEntry, setElapsed]);
}

export function useIdleAndLongTimerMonitor({
  activeEntry,
  elapsed,
  idleAutoPauseSeconds = DEFAULT_IDLE_AUTO_PAUSE_SECONDS,
  idleWarningSeconds = DEFAULT_IDLE_WARNING_SECONDS,
  idleWarningShownRef,
  isAutoPauseEnabled = false,
  isRunning,
  longTimerAlertShownRef,
  setActiveTimerWarning,
  setIsLongRunning,
  showToast,
  toggleTimer,
}) {
  const elapsedRef = useRef(elapsed);
  const idlePausedRef = useRef(false);
  const lastIdleToastAtRef = useRef(0);
  const lastLongTimerToastAtRef = useRef(0);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    if (!isRunning) {
      longTimerAlertShownRef.current = false;
      idleWarningShownRef.current = false;
      idlePausedRef.current = false;
      return undefined;
    }

    const interval = setInterval(async () => {
      try {
        const syncRes = await syncTimerState({
          idleWarningSeconds: idleWarningSeconds || DEFAULT_IDLE_WARNING_SECONDS,
          idleAutoPauseSeconds: idleAutoPauseSeconds || DEFAULT_IDLE_AUTO_PAUSE_SECONDS,
          autoPauseEnabled: isAutoPauseEnabled,
        });

        const now = Date.now();

        // 1. Check auto-pause
        if (syncRes?.autoPaused && !idlePausedRef.current) {
          idlePausedRef.current = true;
          showToast(syncRes.message || "Timer mis en pause pour inactivité.", "warning");
          
          idleWarningShownRef.current = false;
          longTimerAlertShownRef.current = false;
          
          await toggleTimer(); // will sync UI to stopped state
          return;
        }

        if (syncRes?.isRunning === false) {
          return;
        }

        // 2. Check long timer warning from backend activeEntry
        if (
          syncRes?.activeEntry?.is_long_running &&
          (!longTimerAlertShownRef.current || now - lastLongTimerToastAtRef.current >= LONG_TIMER_REMINDER_MS)
        ) {
          longTimerAlertShownRef.current = true;
          lastLongTimerToastAtRef.current = now;

          const warning = syncRes.activeEntry.warning;
          setIsLongRunning(true);
          setActiveTimerWarning(warning);
          showToast(warning, "warning");
        }

        // 3. Check idle warning from backend
        if (
          syncRes?.idleWarning &&
          !idleWarningShownRef.current &&
          now - lastIdleToastAtRef.current >= IDLE_TOAST_COOLDOWN_MS
        ) {
          idleWarningShownRef.current = true;
          lastIdleToastAtRef.current = now;
          showToast(syncRes.message || "Inactivité détectée. Vérifie si ton timer roule encore.", "warning");
        }

        // Reset idle states if no warning from backend
        if (!syncRes?.idleWarning && !syncRes?.autoPaused) {
          idleWarningShownRef.current = false;
          idlePausedRef.current = false;
        }

      } catch (err) {
        console.error("SYNC TIMER:", err.response?.data || err.message);
      }
    }, 30000);

    return () => clearInterval(interval);
    // Keep `elapsed` fresh via ref without restarting the interval.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeEntry,
    idleAutoPauseSeconds,
    idleWarningSeconds,
    idleWarningShownRef,
    isAutoPauseEnabled,
    isRunning,
    longTimerAlertShownRef,
    setActiveTimerWarning,
    setIsLongRunning,
    showToast,
    toggleTimer,
  ]);
}
