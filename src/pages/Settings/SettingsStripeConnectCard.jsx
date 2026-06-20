import { useState,  useState, useEffect } from "react";
import { Button } from "../../components/ui";
import { useToast } from "../../ToastContext";
import api from "../../api/api";
import { useAuth } from "../../api/authContext";

export default function SettingsStripeConnectCard() {
  const [loading, setLoading] = useState(false);
  const [hasStripe, setHasStripe] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const response = await api.get("/organisation/retention");
        if (response.data?.data) {
          setHasStripe(!!response.data.data.stripe_account_id);
        }
      } catch (err) {
        console.error("Erreur chargement Stripe info", err);
      }
    };
    fetchOrg();
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await api.post("/stripe/connect", {
        returnUrl: window.location.href,
        refreshUrl: window.location.href,
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      showToast("Erreur lors de la connexion à Stripe", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card fade-in" style={{ animationDelay: "0.4s" }}>
      <div className="card-icon">💳</div>
      <h3>Paiement en Ligne (Stripe)</h3>
      
      <div className="form-group" style={{ marginTop: "1.5rem" }}>
        <p style={{ marginBottom: "1rem", color: "var(--text-color-muted)" }}>
          Permettez à vos clients de régler leurs factures en ligne par carte de crédit directement depuis le Portail Client. L'argent sera versé directement dans votre compte bancaire.
        </p>

        {hasStripe ? (
          <div style={{ padding: "1rem", background: "#e8f5e9", color: "#2e7d32", borderRadius: "8px", marginBottom: "1rem" }}>
            <strong>✅ Compte Stripe Connecté</strong>
            <p style={{ margin: 0, fontSize: "0.9rem", marginTop: "0.5rem" }}>
              Vos clients voient désormais le bouton "Payer en ligne" sur leurs factures.
            </p>
          </div>
        ) : null}

        <Button 
          variant={hasStripe ? "secondary" : "primary"} 
          onClick={handleConnect} 
          disabled={loading || user?.role !== "admin"}
          style={{ width: "100%" }}
        >
          {loading ? "Génération du lien..." : (hasStripe ? "Gérer mon compte Stripe" : "Connecter mon compte Stripe")}
        </Button>
      </div>
    </div>
  );
}
