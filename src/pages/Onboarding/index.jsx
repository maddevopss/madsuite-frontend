import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui";
import { useAuth } from "../../api/authContext";
import { createCheckoutSession } from "../../api/stripe.api";
import api from "../../api/api";
import { useToast } from "../../ToastContext";
import "./onboarding.css";

export default function Onboarding() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: "",
    address: "",
    taxNumbers: ""
  });

  // Si pas admin, on passe l'onboarding
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleNext = () => setStep(step + 1);
  
  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.post("/onboarding/setup", formData);
      showToast("Votre espace est prêt à facturer !", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      showToast(err.message || "Erreur lors de la configuration.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await api.post("/onboarding/setup", formData); // Save first
      const { url } = await createCheckoutSession(
        `${window.location.origin}/dashboard?onboarding=success`,
        `${window.location.origin}/dashboard?onboarding=success` // Even if cancelled, they land on dashboard
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
      <div className="onboarding-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
        <div className="onboarding-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Bienvenue sur MADSuite 🎉</h2>
          <p style={{ color: '#666', fontSize: '16px' }}>La dernière étape avant d'optimiser votre temps et vos revenus.</p>
        </div>

        <div className="onboarding-card" style={{ background: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Étape 1 : Votre Entreprise</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nom de l'entreprise</label>
                <input 
                  type="text" 
                  value={formData.nom} 
                  onChange={e => setFormData({...formData, nom: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                  placeholder="Ex: Acme Corp"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Adresse complète</label>
                <textarea 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '80px' }}
                  placeholder="Ex: 123 Rue Principale, Ville, QC H1A 2B3"
                />
              </div>
              <Button variant="primary" size="large" style={{ width: '100%' }} onClick={handleNext} disabled={!formData.nom}>Continuer</Button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Étape 2 : Taxes (Optionnel)</h3>
              <p style={{ marginBottom: '15px', color: '#666' }}>Indiquez vos numéros de taxes si applicables. Ils apparaîtront sur vos factures.</p>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Numéros de taxes (TPS/TVQ, TVA...)</label>
                <input 
                  type="text" 
                  value={formData.taxNumbers} 
                  onChange={e => setFormData({...formData, taxNumbers: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                  placeholder="Ex: TPS: 123456789 RT0001, TVQ: 1234567890 TQ0001"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="secondary" size="large" style={{ flex: 1 }} onClick={() => setStep(1)}>Retour</Button>
                <Button variant="primary" size="large" style={{ flex: 1 }} onClick={handleNext}>Continuer</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Étape 3 : Paiements (Optionnel)</h3>
              <p style={{ marginBottom: '15px', color: '#666' }}>Activez votre compte MADSuite Pro pour permettre à vos clients de payer vos factures par carte de crédit avec Stripe.</p>
              
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>Abonnement Pro - 20$ CAD/mois</h4>
                <p style={{ fontSize: '14px', color: '#475569' }}>14 jours d'essai gratuit. Annulable en un clic.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Button variant="primary" size="large" style={{ width: '100%', backgroundColor: '#635BFF', borderColor: '#635BFF' }} onClick={handleSubscribe} disabled={loading}>
                  {loading ? "Redirection..." : "Activer & Connecter Stripe"}
                </Button>
                <Button variant="secondary" size="large" style={{ width: '100%' }} onClick={handleComplete} disabled={loading}>
                  Passer cette étape (Compléter plus tard)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
