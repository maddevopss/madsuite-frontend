import { useState,  useState, useEffect } from "react";
import { Button, Loader } from "../../components/ui";
import api from "../../api/api";
import { useToast } from "../../ToastContext";

export default function AutoTimesheetModal({ show, onClose, targetDate, onSaveSuccess }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (show && targetDate) {
      fetchSuggestions();
    }
  }, [show, targetDate]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      // Use the actual targetDate or today
      const dateStr = targetDate || new Date().toISOString().split('T')[0];
      const response = await api.post("/intelligence/auto-timesheet", { targetDate: dateStr });
      if (response.data?.data) {
        setSuggestions(response.data.data);
        // Select all by default
        setSelectedIndices(new Set(response.data.data.map((_, i) => i)));
      }
    } catch (error) {
      console.error("Failed to fetch suggestions", error);
      showToast("Erreur lors de la génération IA.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (index) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const selectedSuggestions = suggestions.filter((_, i) => selectedIndices.has(i));
      
      // Save them one by one or via a bulk endpoint. Since we only have saveNewEntry in the hook normally,
      // we'll hit the /timesheet endpoint directly for each.
      for (const s of selectedSuggestions) {
        await api.post("/timesheet", {
          projet_id: s.projet_id,
          start_time: s.start_time,
          end_time: s.end_time,
          description: s.description,
          distance_km: 0
        });
      }

      showToast(`${selectedSuggestions.length} entrées de temps ajoutées avec succès!`, "success");
      onSaveSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving timesheets", err);
      showToast("Erreur lors de la sauvegarde.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
        <header className="modal-header">
          <h2>✨ Suggestions de l'IA</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </header>
        
        <div className="modal-body">
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            Nous avons analysé vos activités en arrière-plan pour la journée. Voici les suggestions :
          </p>
          
          {loading ? (
            <Loader label="Analyse IA en cours..." />
          ) : suggestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Aucune activité suffisante détectée pour aujourd'hui.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {suggestions.map((s, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    border: `1px solid ${selectedIndices.has(idx) ? '#2575fc' : '#eee'}`, 
                    borderRadius: '8px', 
                    padding: '1rem',
                    cursor: 'pointer',
                    background: selectedIndices.has(idx) ? '#f0f4ff' : '#fff'
                  }}
                  onClick={() => toggleSelection(idx)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>{s.projet_nom}</strong>
                      {s.is_ai_generated && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)', 
                          color: 'white', 
                          padding: '2px 6px', 
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>✨ IA</span>
                      )}
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#2575fc' }}>{formatDuration(s.duration_seconds)}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                    {s.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            disabled={saving || loading || suggestions.length === 0 || selectedIndices.size === 0}
            style={{ background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)', border: 'none' }}
          >
            {saving ? "Enregistrement..." : `Approuver (${selectedIndices.size})`}
          </Button>
        </footer>
      </div>
    </div>
  );
}
