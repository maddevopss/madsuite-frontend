import { useTimer } from "../../TimerContext";
import { PlayIcon, PauseIcon } from "../../assets/Icon/idx_icon";

export default function FocusTunnel({ show, onClose }) {
  const { isRunning, description, toggleTimer, elapsedFormatted, activeEntry } = useTimer();

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Quitter le tunnel
        </button>
      </div>

      <div style={{ 
        fontSize: '1.5rem', 
        color: 'rgba(255,255,255,0.6)', 
        marginBottom: '1rem',
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}>
        Objectif en cours
      </div>

      <div style={{ 
        fontSize: '4rem', 
        fontWeight: 'bold', 
        textAlign: 'center',
        marginBottom: '4rem',
        maxWidth: '80%',
        lineHeight: '1.2'
      }}>
        {description || "Aucun objectif défini"}
      </div>

      <div style={{ 
        fontSize: '8rem', 
        fontFamily: 'monospace', 
        marginBottom: '4rem',
        color: isRunning ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
        textShadow: isRunning ? '0 0 20px rgba(var(--color-primary-rgb), 0.5)' : 'none'
      }}>
        {elapsedFormatted}
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <button 
          onClick={toggleTimer}
          style={{
            background: 'var(--color-surface)',
            border: 'none',
            color: 'var(--color-text-primary)',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}
        >
          {isRunning ? <PauseIcon width="32" height="32" /> : <PlayIcon width="32" height="32" />}
        </button>

        <button 
          onClick={() => {
            if (isRunning) toggleTimer();
            onClose();
          }}
          style={{
            background: 'var(--color-success)',
            border: 'none',
            color: '#fff',
            padding: '0 40px',
            borderRadius: '40px',
            cursor: 'pointer',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(var(--color-success-rgb), 0.5)'
          }}
        >
          J'ai terminé
        </button>
      </div>
    </div>
  );
}
