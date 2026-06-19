import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useToast } from "../context/ToastContext";

const OrganisationSettings = () => {
  const [settings, setSettings] = useState({
    retention_activity_logs_days: 30,
    retention_summary_days: 90,
    retention_audit_logs_days: 365,
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Charger les paramètres actuels au montage
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/organisation/retention");
        if (response.data) {
          setSettings(response.data);
        }
      } catch (err) {
        showToast("Impossible de charger les paramètres", "error");
      }
    };
    fetchSettings();
  }, [showToast]);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: parseInt(e.target.value, 10) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/organisation/retention", settings);
      showToast("Paramètres de rétention mis à jour avec succès", "success");
    } catch (err) {
      showToast("Erreur lors de la mise à jour", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Paramètres de l'organisation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Rétention des logs d'activité (jours)</label>
          <input
            type="number"
            name="retention_activity_logs_days"
            value={settings.retention_activity_logs_days}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md p-2"
            min="1"
          />
          <p className="text-xs text-gray-500">Données les plus sensibles (titres de fenêtres).</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rétention des résumés quotidiens (jours)</label>
          <input
            type="number"
            name="retention_summary_days"
            value={settings.retention_summary_days}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md p-2"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rétention des logs d'audit (jours)</label>
          <input
            type="number"
            name="retention_audit_logs_days"
            value={settings.retention_audit_logs_days}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md p-2"
            min="1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Enregistrement..." : "Sauvegarder les préférences"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-bold mb-2">Accès Kiosque (Mobile Punch)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Utilisez ce lien sur un appareil partagé (tablette, téléphone) pour permettre à vos employés de pointer avec leur NIP sans avoir à se connecter.
        </p>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            readOnly 
            value={settings.kiosk_token ? `${window.location.origin}/kiosk/${settings.kiosk_token}` : "Génération en cours..."} 
            className="flex-1 border rounded-md p-2 bg-gray-50 text-gray-700"
          />
          <button 
            type="button"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => {
              if (settings.kiosk_token) {
                navigator.clipboard.writeText(`${window.location.origin}/kiosk/${settings.kiosk_token}`);
                showToast("Lien copié !", "success");
              }
            }}
          >
            Copier
          </button>
          <button 
            type="button"
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            onClick={() => {
              if (settings.kiosk_token) {
                const link = `${window.location.origin}/kiosk/${settings.kiosk_token}`;
                navigator.clipboard.writeText(link);
                showToast("Lien Kiosque copié !", "success");
              }
            }}
          >
            Copier le lien Kiosque
          </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-bold mb-2">Accès Kiosque Kilométrage (GPS)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Fournissez ce lien à vos employés sur la route. Ils pourront l'ouvrir sur leur propre téléphone pour suivre leurs déplacements avec leur NIP.
        </p>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            readOnly 
            value={settings.kiosk_token ? `${window.location.origin}/kiosk_km/${settings.kiosk_token}` : "Génération en cours..."} 
            className="flex-1 border rounded-md p-2 bg-gray-50 text-gray-700"
          />
          <button 
            type="button"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => {
              if (settings.kiosk_token) {
                navigator.clipboard.writeText(`${window.location.origin}/kiosk_km/${settings.kiosk_token}`);
                showToast("Lien copié !", "success");
              }
            }}
          >
            Copier
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganisationSettings;
