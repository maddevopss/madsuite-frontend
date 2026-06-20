import { useState,  useState, useEffect } from "react";
import { Button, Input } from "../../components/ui";
import { useToast } from "../../ToastContext";
import api from "../../api/api";

export default function SettingsInteracCard() {
  const [settings, setSettings] = useState({
    interac_email: "",
    interac_question: "",
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/organisation/retention");
        if (response.data?.data) {
          setSettings({
            interac_email: response.data.data.interac_email || "",
            interac_question: response.data.data.interac_question || "",
          });
        }
      } catch (err) {
        console.error("Erreur chargement interac settings", err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch("/organisation/retention", settings);
      showToast("Paramètres Interac enregistrés", "success");
    } catch (err) {
      showToast("Erreur lors de la sauvegarde Interac", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card fade-in" style={{ animationDelay: "0.3s" }}>
      <div className="card-icon">💸</div>
      <h3>Paiement par Interac</h3>
      
      <div className="form-group" style={{ marginTop: "1.5rem" }}>
        <p style={{ marginBottom: "1rem", color: "var(--text-color-muted)" }}>
          Ces informations apparaîtront sur les factures PDF que vous générez pour vos clients.
        </p>

        <div style={{ marginBottom: "1rem" }}>
          <Input
            label="Courriel Interac"
            name="interac_email"
            type="email"
            value={settings.interac_email}
            onChange={handleChange}
            placeholder="paiement@monentreprise.com"
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <Input
            label="Question de sécurité (Optionnel)"
            name="interac_question"
            value={settings.interac_question}
            onChange={handleChange}
            placeholder="Ex: Facture123"
          />
        </div>

        <Button 
          variant="secondary" 
          onClick={handleSave} 
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? "Sauvegarde..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
