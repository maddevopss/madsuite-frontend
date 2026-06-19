import { memo } from "react";

function SettingsUserCard({ user, theme }) {
  return (
    <div className="client-card">
      <h3>Utilisateur connecté</h3>

      <p>{user?.nom || user?.email || "Utilisateur inconnu"}</p>

      <div className="stats">
        <span>Rôle : {user?.role || "N/A"}</span>
        <span>Thème : {theme}</span>
      </div>
    </div>
  );
}

export default memo(SettingsUserCard);
