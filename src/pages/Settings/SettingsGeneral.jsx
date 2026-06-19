import { memo } from "react";

function SettingsGeneral({ settings, updateSetting, onSave }) {
  return (
    <div className="client-form">
      <input
        placeholder="Nom de l'entreprise"
        value={settings.companyName}
        onChange={(e) => updateSetting("companyName", e.target.value)}
      />

      <input
        type="number"
        placeholder="Taux horaire par défaut"
        value={settings.defaultRate}
        onChange={(e) => updateSetting("defaultRate", e.target.value === "" ? "" : Number(e.target.value))}
      />

      <select value={settings.theme} onChange={(e) => updateSetting("theme", e.target.value)}>
        <option value="dark">Sombre</option>
        <option value="light">Clair</option>
      </select>

      <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={settings.autoPauseEnabled === true}
          onChange={(e) => updateSetting("autoPauseEnabled", e.target.checked)}
        />
        Auto-pause du timer après inactivité (optionnelle)
      </label>

      <input
        type="number"
        min="60"
        step="30"
        placeholder="Alerte inactivité (secondes)"
        value={settings.idleWarningSeconds}
        onChange={(e) => updateSetting("idleWarningSeconds", Number(e.target.value))}
        disabled={settings.autoPauseEnabled === false}
      />

      <input
        type="number"
        min="90"
        step="30"
        placeholder="Auto-pause inactivité (secondes)"
        value={settings.idleAutoPauseSeconds}
        onChange={(e) => updateSetting("idleAutoPauseSeconds", Number(e.target.value))}
        disabled={settings.autoPauseEnabled === false}
      />

      <button onClick={onSave}>Sauvegarder</button>
    </div>
  );
}

export default memo(SettingsGeneral);
