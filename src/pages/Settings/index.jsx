import { useCallback } from "react";
import "../../styles/settings.css";
import { Link } from "react-router-dom";
import { useToast } from "../../ToastContext";
import SettingsHeader from "./SettingsHeader";
import SettingsGeneral from "./SettingsGeneral";
import SettingsUserCard from "./SettingsUserCard";
import SettingsPreferencesCard from "./SettingsPreferencesCard";
import SettingsSubscriptionCard from "./SettingsSubscriptionCard";
import SettingsInteracCard from "./SettingsInteracCard";
import SettingsStripeConnectCard from "./SettingsStripeConnectCard";
import SettingsHubCard from "./SettingsHubCard";
import MasterAdminCard from "./MasterAdminCard";
import DesktopPrivacySettings from "./DesktopPrivacySettings";
import SettingsAccountingExportCard from "./SettingsAccountingExportCard";

import { useAuth } from "../../api/authContext";
import { useSettings } from "../../hooks/useSettings";

export default function Settings() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const { settings, updateSetting, saveSettings } = useSettings();

  const handleSave = useCallback(() => {
    const success = saveSettings();

    if (success) {
      showToast("Paramètres sauvegardés", "success");
    }
  }, [saveSettings, showToast]);

  return (
    <div className="clients-page">
      <SettingsHeader />

      <SettingsGeneral settings={settings} updateSetting={updateSetting} onSave={handleSave} />

      {window.agentAPI && <DesktopPrivacySettings showToast={showToast} />}
      <div className="clients-grid">
        <SettingsUserCard user={user} theme={settings.theme} />

        {/* Modules & Subscription Card */}
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Modules & Abonnement</h3>
          <p className="text-sm text-gray-600 mb-3">Gérez les add‑ons et leur facturation.</p>
          <Link to="/modulesAndSubscription" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Gérer les modules
          </Link>
        </div>

        <SettingsHubCard settings={settings} updateSetting={updateSetting} onSave={handleSave} />

        <SettingsInteracCard />
        
        <SettingsStripeConnectCard />

        <SettingsAccountingExportCard />

        <SettingsSubscriptionCard />

        {user?.id === 1 && <MasterAdminCard />}
      </div>
    </div>
  );
}
