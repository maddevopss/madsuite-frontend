import { useEffect, useState } from "react";

const defaultSettings = {
  companyName: "MADSuite",
  defaultRate: "",
  theme: "dark",
  autoPauseEnabled: false,
  idleWarningSeconds: 270,
  idleAutoPauseSeconds: 300,
  pomodoroDuration: 25,
  pomodoroHourlyRate: 20,
};

export function useSettings() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("settings");

      if (saved) {
        const parsed = JSON.parse(saved);

        setSettings({
          ...defaultSettings,
          ...parsed,
          defaultRate: parsed.defaultRate === "" || parsed.defaultRate == null ? "" : Number(parsed.defaultRate),
          autoPauseEnabled: parsed.autoPauseEnabled === true,
          idleWarningSeconds: Number(parsed.idleWarningSeconds ?? defaultSettings.idleWarningSeconds),
          idleAutoPauseSeconds: Number(parsed.idleAutoPauseSeconds ?? defaultSettings.idleAutoPauseSeconds),
          pomodoroDuration: Number(parsed.pomodoroDuration ?? defaultSettings.pomodoroDuration),
          pomodoroHourlyRate: Number(parsed.pomodoroHourlyRate ?? defaultSettings.pomodoroHourlyRate),
        });
      }
    } catch (err) {
      console.error("LOAD SETTINGS:", err);
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = () => {
    try {
      const normalizedSettings = {
        ...settings,
        defaultRate: settings.defaultRate === "" || settings.defaultRate == null ? "" : Number(settings.defaultRate),
        idleWarningSeconds: Math.max(60, Number(settings.idleWarningSeconds ?? 270)),
        idleAutoPauseSeconds: Math.max(90, Number(settings.idleAutoPauseSeconds ?? 300)),
        pomodoroDuration: Math.max(1, Number(settings.pomodoroDuration ?? 25)),
        pomodoroHourlyRate: Math.max(0, Number(settings.pomodoroHourlyRate ?? 20)),
      };

      if (normalizedSettings.idleWarningSeconds >= normalizedSettings.idleAutoPauseSeconds) {
        normalizedSettings.idleWarningSeconds = Math.max(60, normalizedSettings.idleAutoPauseSeconds - 30);
      }

      localStorage.setItem("settings", JSON.stringify(normalizedSettings));

      document.documentElement.setAttribute("data-theme", normalizedSettings.theme);
      window.dispatchEvent(new CustomEvent("madsuite:settings-updated"));

      return true;
    } catch (err) {
      console.error("SAVE SETTINGS:", err);
      return false;
    }
  };

  return {
    settings,
    updateSetting,
    saveSettings,
  };
}
