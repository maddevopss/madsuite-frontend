import { useEffect, useState } from "react";
import { Modal, Button } from "./ui";
import { useReports } from "../hooks/useReports";
import BehavioralTimeline from "./BehavioralTimeline";

export default function CognitiveMirrorModal({ show, onClose, intent, startTime, endTime }) {
  const { activityLogs = [] } = useReports();
  const [sessionLogs, setSessionLogs] = useState([]);
  const [totalSeconds, setTotalSeconds] = useState(1);
  const [focusSeconds, setFocusSeconds] = useState(0);

  // État pour l'étape 1 (estimation) vs étape 2 (vérité)
  const [step, setStep] = useState(1);
  const [perceptionValue, setPerceptionValue] = useState(50);

  useEffect(() => {
    if (show) {
      setStep(1);
      setPerceptionValue(50);
    }
  }, [show]);

  useEffect(() => {
    if (show && startTime) {
      // Filtrer les logs pour cette session
      const start = new Date(startTime).getTime();
      const end = endTime ? new Date(endTime).getTime() : Date.now();
      
      const filtered = activityLogs.filter(log => {
        const logTime = new Date(log.captured_at).getTime();
        return logTime >= start && logTime <= end;
      });

      let focusSec = 0;
      filtered.forEach(log => {
        if (!log.is_idle && log.activity_category !== 'Distraction' && log.activity_category !== 'Exploration Libre') {
          focusSec += (log.duration_seconds || 0);
        }
      });

      setSessionLogs(filtered);
      const calculatedTotal = Math.max(1, Math.round((end - start) / 1000));
      setTotalSeconds(calculatedTotal);
      setFocusSeconds(focusSec);
    }
  }, [show, startTime, endTime, activityLogs]);

  const truthPercentage = Math.min(100, Math.round((focusSeconds / totalSeconds) * 100));

  return (
    <Modal show={show} onClose={step === 2 ? onClose : undefined} title="🪞 Miroir Cognitif">
      <div style={{ padding: "1.5rem", color: "var(--color-text-primary)" }}>
        {step === 1 ? (
          // ÉTAPE 1 : ESTIMATION
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Session terminée.</h2>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Ton intention initiale :</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                "{intent || "Aucun objectif précis"}"
              </div>
            </div>

            <div style={{ background: 'var(--color-surface-hover)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>À quel point as-tu l'impression d'avoir avancé sur cet objectif ?</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '1rem' }}>
                {perceptionValue}%
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={perceptionValue} 
                onChange={(e) => setPerceptionValue(e.target.value)}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                <span>Presque rien</span>
                <span>Tout terminé</span>
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              variant="primary"
              style={{ width: "100%", padding: "16px", fontSize: "1.1rem", fontWeight: "bold" }}
            >
              Voir la réalité
            </Button>
          </div>
        ) : (
          // ÉTAPE 2 : VÉRITÉ
          <div>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Cognitive Flow Analysis</h2>
            
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              marginBottom: '1.5rem',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-surface)',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Ta perception</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{perceptionValue}%</div>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'var(--color-text-secondary)' }}>VS</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Stabilité réelle</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>{truthPercentage}%</div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: '0.95rem', background: 'var(--color-surface-hover)', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ color: "var(--color-text-primary)", margin: 0, lineHeight: '1.5' }}>
                Ta session a connu quelques <strong>Cognitive Shifts</strong>.<br/> 
                Ton Flow a été stable <strong>{truthPercentage}%</strong> du temps. La résilience et la capacité de <em>Recovery</em> sont constantes.
              </p>
            </div>

            <div style={{ 
              background: 'var(--color-surface-hover)', 
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '15px' }}>
                Relecture de la session :
              </div>
              <BehavioralTimeline sessionLogs={sessionLogs} totalDurationSeconds={totalSeconds} />
            </div>

            <Button
              onClick={onClose}
              variant="primary"
              style={{ width: "100%", padding: "16px", fontSize: "1.1rem", fontWeight: "bold" }}
            >
              Continuer ma journée
            </Button>
          </div>
        )}

      </div>
    </Modal>
  );
}
