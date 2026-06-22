import { useEffect, useState } from "react";
import { useToast } from "../../ToastContext";
import api from "../../api/api";
import { useClients } from "../../hooks/useClients";
import { useInvoices } from "../../hooks/useInvoices";
import { Button } from "../ui";

export default function SampleDataGenerator({ onGenerate }) {
  const { clients, loading: clientsLoading } = useClients();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { showToast } = useToast();
  
  const [countdown, setCountdown] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shouldRun, setShouldRun] = useState(false);

  useEffect(() => {
    if (!clientsLoading && !invoicesLoading) {
      if (clients.length === 0 && invoices.length === 0) {
        setShouldRun(true);
      } else {
        setShouldRun(false);
      }
    }
  }, [clients, invoices, clientsLoading, invoicesLoading]);

  useEffect(() => {
    if (!shouldRun || isGenerating) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      generateSampleData();
    }
  }, [countdown, shouldRun, isGenerating]);

  const generateSampleData = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    try {
      showToast("Création des données de démonstration...", "info");
      await api.post("/onboarding/sample-data");
      showToast("Données de démonstration prêtes !", "success");
      if (onGenerate) onGenerate();
    } catch (err) {
      showToast("Impossible de générer les données de démonstration.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!shouldRun) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '15px 25px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      zIndex: 9999,
      border: '1px solid #e2e8f0'
    }}>
      <div>
        <p style={{ margin: 0, fontWeight: 'bold' }}>Découvrez MADSuite en action</p>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
          Génération d'un client et d'une facture de démo dans {countdown}s...
        </p>
      </div>
      <Button variant="primary" onClick={generateSampleData} disabled={isGenerating}>
        {isGenerating ? "Génération..." : "Générer maintenant"}
      </Button>
    </div>
  );
}
