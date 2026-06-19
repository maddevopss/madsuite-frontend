import { memo } from "react";

function SettingsHubCard({ settings, updateSetting, onSave }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-2">Hub & Pomodoro</h3>
      <p className="text-sm text-gray-600 mb-3">Paramètres du widget de concentration Pomodoro.</p>
      
      <div className="flex flex-col gap-3">
        <label className="flex flex-col text-sm">
          <span className="font-medium text-gray-700 mb-1">Durée du Pomodoro (minutes)</span>
          <input
            type="number"
            min="1"
            className="border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={settings.pomodoroDuration || 25}
            onChange={(e) => updateSetting("pomodoroDuration", Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col text-sm">
          <span className="font-medium text-gray-700 mb-1">Tarif horaire de session (€/h)</span>
          <input
            type="number"
            min="0"
            className="border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={settings.pomodoroHourlyRate || 20}
            onChange={(e) => updateSetting("pomodoroHourlyRate", Number(e.target.value))}
          />
        </label>

        <button
          onClick={onSave}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium transition-colors"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

export default memo(SettingsHubCard);
