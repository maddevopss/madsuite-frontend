import { useState } from "react";
import api from "../../api/api";
import { Button, Card } from "../../components/ui";
import { useTimer } from "../../TimerContext";

export default function BrainDumpInput() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [suggestedTask, setSuggestedTask] = useState(null);
  const { setDescription, toggleTimer, isRunning } = useTimer();

  const handleOrganize = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/activity-intelligence/brain-dump", { prompt });
      if (res.data && res.data.tasks) {
        setTasks(res.data.tasks);
        setPrompt("");
        window.dispatchEvent(new CustomEvent("dopamine-win", { 
          detail: { text: "Brain Dump organisé", icon: "🧠" } 
        }));
      }
    } catch (err) {
      console.error("Erreur brain-dump", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = (task, index) => {
    setDescription(task.title);
    if (!isRunning) {
      toggleTimer();
    }
    // Remove the task from the list once started
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setTasks([]);
    setSuggestedTask(null);
  };

  const handleDecideForMe = () => {
    if (tasks.length === 0) return;
    const randomIndex = Math.floor(Math.random() * tasks.length);
    setSuggestedTask({ task: tasks[randomIndex], index: randomIndex });
  };

  return (
    <Card className="brain-dump-card" style={{ marginBottom: '20px', border: '2px solid var(--color-primary)' }}>
      <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        🧠 Bruit Mental (External Brain)
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
        Vide ton cerveau ici. L'IA va le transformer en micro-actions claires.
      </p>

      {tasks.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Faut que je fasse la facture de Bob, puis répondre à Jeanne, et commencer le design du logo..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-hover)',
              color: 'var(--color-text-primary)',
              resize: 'vertical',
              fontSize: '0.95rem'
            }}
          />
          <Button 
            onClick={handleOrganize} 
            disabled={loading || !prompt.trim()}
            variant="primary"
            style={{ alignSelf: 'flex-start' }}
          >
            {loading ? "Organisation en cours..." : "✨ Organise pour moi"}
          </Button>
        </div>
      ) : (
        <div className="brain-dump-tasks">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <strong>Tes prochaines actions :</strong>
              {tasks.length > 1 && !suggestedTask && (
                <Button size="sm" variant="secondary" onClick={handleDecideForMe}>
                  🎲 Décide pour moi
                </Button>
              )}
            </div>
            <Button size="sm" variant="secondary" onClick={handleClear}>Annuler</Button>
          </div>
          
          {suggestedTask ? (
            <div style={{ 
              background: 'var(--color-primary)', 
              color: 'white', 
              padding: '20px', 
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(var(--color-primary-rgb), 0.3)'
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '10px', opacity: 0.9 }}>Next best action :</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>{suggestedTask.task.title}</div>
              <div style={{ fontSize: '1rem', marginBottom: '20px', opacity: 0.9 }}>~{suggestedTask.task.duration_minutes} min</div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Button 
                  onClick={() => {
                    handleStartTask(suggestedTask.task, suggestedTask.index);
                    setSuggestedTask(null);
                  }}
                  style={{ background: 'white', color: 'var(--color-primary)', fontWeight: 'bold' }}
                >
                  ▶ Accepter & Démarrer
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setSuggestedTask(null)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: 'white' }}
                >
                  Autre chose
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasks.map((t, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'var(--color-surface-hover)',
                    padding: '12px',
                    borderRadius: '8px',
                    borderLeft: '4px solid var(--color-primary)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{t.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>~{t.duration_minutes} min</div>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => handleStartTask(t, idx)}>
                    ▶ Commencer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
