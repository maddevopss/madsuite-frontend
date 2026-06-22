import { Modal, Button } from "../../components/ui";
import { useTimer } from "../../TimerContext";

export default function RecoveryModal({ show, onClose }) {
  const { isRunning, toggleTimer, description, stopActiveTimer } = useTimer();

  const handleResume = () => {
    if (!isRunning) {
      toggleTimer();
    }
    window.dispatchEvent(new CustomEvent("dopamine-win", { 
      detail: { text: "Distraction évitée", icon: "🛡️" } 
    }));
    onClose();
  };

  const handleDrop = () => {
    stopActiveTimer();
    // Enregistrer un 'drop' pour le Momentum Engine
    const currentDrops = parseInt(localStorage.getItem('momentum_drops') || '0', 10);
    localStorage.setItem('momentum_drops', (currentDrops + 1).toString());
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose} title="🛡️ Distraction Recovery Protocol">
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-primary)" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Content de te revoir.</h2>
        
        <div style={{ 
          background: 'rgba(var(--color-primary-rgb), 0.1)', 
          borderLeft: '4px solid var(--color-primary)',
          padding: '1rem',
          marginBottom: '2rem',
          borderRadius: '4px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            💾 Contexte Mental Restauré
          </div>
          <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
            Tu étais concentré sur : <br/>
            <strong style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>{description || "Aucun objectif défini"}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Button 
            onClick={handleResume} 
            variant="primary" 
            style={{ padding: '16px', fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            ▶️ Reprendre le focus
          </Button>

          <Button 
            onClick={handleDrop} 
            variant="secondary" 
            style={{ padding: '16px', fontSize: '1.1rem', background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)' }}
          >
            ⏹️ J'ai abandonné cette tâche
          </Button>
        </div>
      </div>
    </Modal>
  );
}
