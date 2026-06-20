import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "../../components/ui";
import { useAuth } from "../../api/authContext";
import { createCheckoutSession } from "../../api/stripe.api";
import { useToast } from "../../ToastContext";
import "./onboarding.css";
import { motion } from "framer-motion";

export default function Onboarding() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Si on est déjà abonné ou pas admin, on passe l'onboarding
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { url } = await createCheckoutSession(
        `${window.location.origin}/dashboard?onboarding=success`,
        `${window.location.origin}/onboarding?payment=cancelled`
      );
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      showToast(err.message || "Erreur de connexion à Stripe", "error");
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <motion.div 
        className="onboarding-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="onboarding-header">
          <h2>Bienvenue sur MADSuite 🎉</h2>
          <p>La dernière étape avant d'optimiser votre temps et vos revenus.</p>
        </div>

        <div className="onboarding-card">
          <div className="plan-details">
            <h3>Abonnement Pro</h3>
            <div className="price">
              <span className="amount">20$</span>
              <span className="currency">CAD</span>
              <span className="period">/mois</span>
            </div>
            <div className="trial-badge">14 jours d'essai gratuit</div>
            <p className="billing-info">
              Votre carte ne sera facturée qu'à la fin de la période d'essai de 14 jours.
              Vous pouvez annuler à tout moment d'un simple clic.
            </p>
            
            <ul className="plan-features">
              <li>✅ Accès complet (Clients, Projets, Factures)</li>
              <li>✅ Suivi du temps & Mobile Punch</li>
              <li>✅ Sécurité RLS niveau Entreprise</li>
              <li>✅ Assistant IA Copilot Inclus</li>
            </ul>
          </div>

          <div className="onboarding-actions">
            <Button 
              variant="primary" 
              size="large" 
              onClick={handleSubscribe}
              disabled={loading}
              className="subscribe-btn"
            >
              {loading ? "Redirection sécurisée..." : "Activer mon compte"}
            </Button>
            
            <button 
              onClick={() => window.location.href = "/dashboard"}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline bg-transparent border-none cursor-pointer"
            >
              Passer cette étape (Compléter plus tard)
            </button>

            <div className="secure-badge mt-4">
              🔒 Paiement sécurisé par Stripe
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
