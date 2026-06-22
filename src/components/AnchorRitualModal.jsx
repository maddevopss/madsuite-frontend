import { useState } from "react";
import { Modal, Button } from "./ui";

export default function AnchorRitualModal({ show, onClose, onConfirm }) {
  const [action, setAction] = useState("");
  const [duration, setDuration] = useState("");

  // Momentum check : si l'utilisateur a accumulé des drops récemment, on baisse la barre
  const dropsCount = parseInt(localStorage.getItem('momentum_drops') || '0', 10);
  const isLowMomentum = dropsCount >= 2;
  
  const suggestedTimes = isLowMomentum 
    ? ["5m", "10m", "15m", "25m"] 
    : ["15m", "25m", "45m", "60m"];

  const handleConfirm = () => {
    if (action.trim()) {
      onConfirm(action, duration);
      setAction("");
      setDuration("");
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="⚓ Anchor Ritual">
      <div style={{ padding: "1.5rem", color: "var(--color-text-primary)" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Avant de commencer...</h2>
        <p style={{ marginBottom: "1.5rem", color: "var(--color-text-secondary)" }}>
          Faisons un contrat mental pour cette session.
        </p>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Que vas-tu accomplir ? (Micro-action)
          </label>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Ex: Rédiger l'intro du mail client"
            autoFocus
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-hover)",
              color: "var(--color-text-primary)",
              fontSize: "1rem"
            }}
          />
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Pour combien de temps ? (Optionnel)
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {suggestedTimes.map(t => (
              <Button
                key={t}
                type="button"
                variant={duration === t ? "primary" : "secondary"}
                onClick={() => setDuration(t)}
                style={{ flex: 1, backgroundColor: duration === t ? 'var(--color-primary)' : isLowMomentum ? 'rgba(var(--color-primary-rgb), 0.1)' : undefined }}
              >
                {t}
              </Button>
            ))}
          </div>
          {isLowMomentum && (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '8px', textAlign: 'center' }}>
              💡 Allez, on commence petit. Juste 5 minutes.
            </div>
          )}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={!action.trim()}
          variant="primary"
          style={{ width: "100%", padding: "16px", fontSize: "1.1rem", fontWeight: "bold" }}
        >
          ▶️ Commit & Start
        </Button>
      </div>
    </Modal>
  );
}
