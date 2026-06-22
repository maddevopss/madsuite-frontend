import { Modal } from "../../components/ui";
import { useState } from "react";
import { useTimer } from "../../TimerContext";

export default function RescueModal({ show, onClose }) {
  const [step, setStep] = useState(1);
  const [action, setAction] = useState("");
  const { setDescription, isRunning, toggleTimer } = useTimer();

  const handleStart = () => {
    if (action.trim()) {
      setDescription(action);
    }
    if (!isRunning) {
      toggleTimer();
    }
    setStep(1);
    setAction("");
    onClose();
  };

  const handleClose = () => {
    setStep(1);
    setAction("");
    onClose();
  };

  return (
    <Modal show={show} onClose={handleClose} title="🛟 SOS Focus">
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-primary)" }}>
        {step === 1 ? (
          <>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Respire. Tout va bien.</h2>
            <p style={{ marginBottom: "2rem", color: "var(--color-text-secondary)" }}>
              L'éparpillement arrive à tout le monde. Laisse tout le reste de côté pour l'instant.
            </p>
            <button
              onClick={() => setStep(2)}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                background: "var(--color-primary)",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1.1rem"
              }}
            >
              Je suis prêt(e)
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
              Quelle est la TOUTE PREMIÈRE petite action physique que tu peux faire maintenant ?
            </h2>
            <input
              type="text"
              placeholder="Ex: Ouvrir un fichier, écrire 1 phrase..."
              value={action}
              onChange={(e) => setAction(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-hover)",
                color: "var(--color-text-primary)",
                marginBottom: "2rem",
                fontSize: "1rem"
              }}
              autoFocus
            />
            <button
              onClick={handleStart}
              disabled={!action.trim()}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                background: action.trim() ? "var(--color-primary)" : "var(--color-border)",
                color: "white",
                border: "none",
                cursor: action.trim() ? "pointer" : "not-allowed",
                fontWeight: "bold",
                width: "100%",
                fontSize: "1.1rem"
              }}
            >
              C'est parti !
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
