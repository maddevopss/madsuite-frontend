import { useEffect, useRef } from "react";

import { getLatestActivity } from "../api/timer.api";
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
        const latest = await getLatestActivity();
        const thresholdHours = activeEntry?.long_timer_threshold_hours || 8;
        const thresholdSeconds = thresholdHours * 3600;
        const now = Date.now();

        if (
          elapsedRef.current >= thresholdSeconds &&
          (!longTimerAlertShownRef.current || now - lastLongTimerToastAtRef.current >= LONG_TIMER_REMINDER_MS)
        ) {
          longTimerAlertShownRef.current = true;
          lastLongTimerToastAtRef.current = now;

          const warning =
            activeEntry?.warning || `Timer en cours depuis plus de ${thresholdHours} heures. Es-tu encore sur ce projet?`;

          setIsLongRunning(true);
          setActiveTimerWarning(warning);
          showToast(warning, "warning");
        }

        const warningSeconds = Math.max(60, Number(idleWarningSeconds || DEFAULT_IDLE_WARNING_SECONDS));
        const autoPauseSeconds = Math.max(warningSeconds + 30, Number(idleAutoPauseSeconds || DEFAULT_IDLE_AUTO_PAUSE_SECONDS));

        if (
          latest?.idle_seconds >= warningSeconds &&
          !idleWarningShownRef.current &&
          now - lastIdleToastAtRef.current >= IDLE_TOAST_COOLDOWN_MS
        ) {
          idleWarningShownRef.current = true;
          lastIdleToastAtRef.current = now;
          showToast("Inactivité détectée. Vérifie si ton timer roule encore.", "warning");
        }

        if (isAutoPauseEnabled && latest?.is_idle && latest?.idle_seconds >= autoPauseSeconds && !idlePausedRef.current) {
          idlePausedRef.current = true;
          showToast("Timer mis en pause pour inactivite.", "warning");

          idleWarningShownRef.current = false;
          longTimerAlertShownRef.current = false;

          await toggleTimer();
        }

        if (!latest?.is_idle && latest?.idle_seconds < warningSeconds) {
          idleWarningShownRef.current = false;
          idlePausedRef.current = false;
        }
      } catch (err) {
        console.error("CHECK IDLE:", err.response?.data || err.message);
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
