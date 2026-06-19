import { useState } from "react";
import { Button } from "../../components/ui";
import { createCheckoutSession } from "../../api/stripe.api";
import { useToast } from "../../ToastContext";

export default function SettingsSubscriptionCard() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const successUrl = `${window.location.origin}/settings?success=true`;
      const cancelUrl = `${window.location.origin}/settings?canceled=true`;
      
      const res = await createCheckoutSession(successUrl, cancelUrl);
      
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      showToast("Impossible de rediriger vers le paiement Stripe.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="card-icon">💳</div>
      <h3>Abonnement & Facturation</h3>
      
      <div className="form-group" style={{ marginTop: "1.5rem" }}>
        <p style={{ marginBottom: "1rem", color: "var(--text-color-muted)" }}>
          Gérez votre abonnement MADSuite. Passez au plan Pro pour débloquer toutes les fonctionnalités.
        </p>
        
        <div style={{ background: "var(--bg-color)", padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <strong>Plan actuel:</strong>
            <span style={{ color: "var(--primary-color)", fontWeight: "600" }}>Essai gratuit</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Statut:</strong>
            <span className="badge" style={{ background: "#fef3c7", color: "#d97706" }}>En essai (expire bientôt)</span>
          </div>
        </div>

        <Button 
          variant="primary" 
          onClick={handleSubscribe} 
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? "Redirection..." : "S'abonner au plan Pro (20$/mois)"}
        </Button>
      </div>
    </div>
  );
}
