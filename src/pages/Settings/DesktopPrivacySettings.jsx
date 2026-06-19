import { useEffect, useState } from "react";
import { Button } from "../../components/ui";

function splitValues(value) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function DesktopPrivacySettings({ showToast }) {
  const [settings, setSettings] = useState(null);
  const [ignoredApps, setIgnoredApps] = useState("");
  const [ignoredKeywords, setIgnoredKeywords] = useState("");
  const [autoStart, setAutoStart] = useState(false);

  useEffect(() => {
    window.agentAPI.getPrivacySettings().then((data) => {
      setSettings(data);
      setIgnoredApps((data.ignoredApps || []).join("\n"));
      setIgnoredKeywords((data.ignoredKeywords || []).join("\n"));
    });

    if (window.agentAPI.getAutoStart) {
      window.agentAPI.getAutoStart().then((enabled) => setAutoStart(enabled));
    }
  }, []);

  if (!settings) return <div className="client-form">Chargement des réglages desktop...</div>;

  const save = async () => {
    const next = {
      trackingEnabled: settings.trackingEnabled,
      ignoredApps: splitValues(ignoredApps),
      ignoredKeywords: splitValues(ignoredKeywords),
    };
    const result = await window.agentAPI.setPrivacySettings(next);
    
    if (window.agentAPI.setAutoStart) {
      await window.agentAPI.setAutoStart(autoStart);
    }

    setSettings((current) => ({ ...current, ...result }));
    showToast("Réglages de confidentialité sauvegardés.", "success");
  };

  const deleteHistory = async () => {
    if (!window.confirm("Supprimer tout votre historique d'activité capturé?")) return;
    await window.agentAPI.deleteActivityHistory();
    setSettings((current) => ({ ...current, lastCapturedActivity: null }));
    showToast("Historique d'activité supprimé.", "success");
  };

  return (
    <section className="client-form desktop-privacy-settings">
      <h2>Confidentialité desktop</h2>

      <label>
        <input
          type="checkbox"
          checked={settings.trackingEnabled}
          onChange={(event) => setSettings((current) => ({ ...current, trackingEnabled: event.target.checked }))}
        />
        Activer le suivi des fenêtres
      </label>

      {window.agentAPI.getAutoStart && (
        <label>
          <input
            type="checkbox"
            checked={autoStart}
            onChange={(event) => setAutoStart(event.target.checked)}
          />
          Lancer l'agent au démarrage de l'ordinateur
        </label>
      )}

      <label>
        Intervalle de capture
        <select
          value={settings.interval}
          onChange={async (event) => {
            const interval = Number(event.target.value);
            await window.agentAPI.setTrackingInterval(interval);
            setSettings((current) => ({ ...current, interval }));
          }}>
          <option value={10}>10 secondes</option>
          <option value={30}>30 secondes</option>
          <option value={60}>60 secondes</option>
        </select>
      </label>

      <label>
        Applications ignorées
        <textarea value={ignoredApps} onChange={(event) => setIgnoredApps(event.target.value)} rows={4} placeholder="Outlook&#10;KeePass" />
      </label>

      <label>
        Mots-clés ignorés dans les titres
        <textarea
          value={ignoredKeywords}
          onChange={(event) => setIgnoredKeywords(event.target.value)}
          rows={4}
          placeholder="médical&#10;banque"
        />
      </label>

      <div className="desktop-last-capture">
        <strong>Dernière donnée capturée</strong>
        {settings.lastCapturedActivity ? (
          <p>
            {settings.lastCapturedActivity.app_name} - {settings.lastCapturedActivity.window_title}
          </p>
        ) : (
          <p>Aucune capture locale disponible.</p>
        )}
      </div>

      {settings.platform !== "win32" && <p>La liste des fenêtres ouvertes est disponible uniquement sur Windows.</p>}

      <div className="form-actions">
        <Button variant="danger" type="button" onClick={deleteHistory}>
          Supprimer l'historique
        </Button>
        <Button variant="primary" type="button" onClick={save}>
          Sauvegarder
        </Button>
      </div>
    </section>
  );
}
