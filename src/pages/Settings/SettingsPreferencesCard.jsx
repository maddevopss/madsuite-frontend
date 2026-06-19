import { memo } from "react";

function SettingsPreferencesCard({ companyName, defaultRate }) {
  return (
    <div className="client-card">
      <h3>Préférences</h3>

      <p>{companyName}</p>

      <div className="stats">
        <span>Taux défaut : {Number(defaultRate || 0).toFixed(2)}$ / h</span>
      </div>
    </div>
  );
}

export default memo(SettingsPreferencesCard);
