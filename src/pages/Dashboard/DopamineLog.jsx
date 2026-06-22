import { useEffect, useState } from "react";
import { Card } from "../../components/ui";
import { useTimer } from "../../TimerContext";

export default function DopamineLog() {
  const [logs, setLogs] = useState([]);
  const { isRunning, elapsed } = useTimer();

  useEffect(() => {
    // Initial load from local storage
    const today = new Date().toISOString().split("T")[0];
    const savedLogs = JSON.parse(localStorage.getItem(`dopamine_logs_${today}`)) || [];
    setLogs(savedLogs);

    // Simple listener for new events (could be CustomEvent dispatch from other components)
    const handleNewWin = (e) => {
      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: e.detail.text,
        icon: e.detail.icon || "🔥"
      };
      setLogs(prev => {
        const updated = [newLog, ...prev].slice(0, 5); // Keep last 5
        localStorage.setItem(`dopamine_logs_${today}`, JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener("dopamine-win", handleNewWin);
    return () => window.removeEventListener("dopamine-win", handleNewWin);
  }, []);

  // Tracking timer start
  useEffect(() => {
    if (isRunning && elapsed < 2) {
      window.dispatchEvent(new CustomEvent("dopamine-win", { 
        detail: { text: "Session démarrée", icon: "🚀" } 
      }));
    }
  }, [isRunning]);

  if (logs.length === 0) return null;

  return (
    <Card style={{ marginBottom: '20px', border: '1px solid var(--color-success)' }}>
      <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
        🏆 Victoires du Jour
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
        {logs.map(log => (
          <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '1.2rem' }}>{log.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{log.text}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{log.time}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
