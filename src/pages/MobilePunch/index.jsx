import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../api/authContext";
import api from "../../api/api";
import { Button } from "../../components/ui";
import { useToast } from "../../ToastContext";
import "./mobilePunch.css";
import { AiOutlineLeft } from "../../assets/Icon/idx_icon";

export default function MobilePunch() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTimer, setActiveTimer] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveTimer();
    fetchProjects();
  }, []);

  const fetchActiveTimer = async () => {
    try {
      const res = await api.get("/timer/active");
      if (res.data.data) {
        setActiveTimer(res.data.data);
      } else {
        setActiveTimer(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projets");
      // Trier par ID décroissant pour avoir les plus récents en premier
      setProjects(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePunchIn = async () => {
    if (!selectedProjectId) {
      showToast("Veuillez sélectionner un projet.", "warning");
      return;
    }
    setLoading(true);
    try {
      await api.post("/timer/start", {
        projet_id: selectedProjectId,
        description: description || "Travail sur le terrain",
      });
      showToast("Punch In enregistré !", "success");
      setDescription("");
      await fetchActiveTimer();
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors du Punch In", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setLoading(true);
    try {
      await api.post("/timer/stop", {
        description: description || activeTimer.description,
      });
      showToast("Punch Out enregistré !", "success");
      setDescription("");
      await fetchActiveTimer();
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors du Punch Out", "error");
    } finally {
      setLoading(false);
    }
  };

  // Rendu de la durée dynamique
  const [elapsed, setElapsed] = useState("00:00:00");
  useEffect(() => {
    let interval;
    if (activeTimer) {
      const start = new Date(activeTimer.start_time).getTime();
      interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = now - start;
        const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
        setElapsed(`${h}:${m}:${s}`);
      }, 1000);
    } else {
      setElapsed("00:00:00");
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  return (
    <div className="mobile-punch-container">
      <header className="mobile-header">
        <Link to="/dashboard" className="back-btn">
          <AiOutlineLeft size={24} />
        </Link>
        <h1>Mobile Punch</h1>
        <div style={{ width: 24 }}></div>
      </header>

      <main className="mobile-main">
        <div className="clock-display">
          <div className={`status-badge ${activeTimer ? 'active' : 'idle'}`}>
            {activeTimer ? "EN COURS" : "EN ATTENTE"}
          </div>
          <div className="time-huge">{elapsed}</div>
          {activeTimer && (
            <div className="active-details">
              Projet: {activeTimer.projet_nom || `ID #${activeTimer.projet_id}`}
            </div>
          )}
        </div>

        <div className="punch-controls">
          {!activeTimer ? (
            <div className="punch-form">
              <label>Projet</label>
              <select 
                value={selectedProjectId} 
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="mobile-input"
              >
                <option value="">-- Choisir un projet --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} ({p.client_nom})
                  </option>
                ))}
              </select>

              <label>Note (optionnel)</label>
              <input 
                type="text" 
                placeholder="Ex: Déplacement, réunion..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mobile-input"
              />

              <button 
                className="huge-btn punch-in" 
                onClick={handlePunchIn}
                disabled={loading}
              >
                {loading ? "..." : "PUNCH IN"}
              </button>
            </div>
          ) : (
            <div className="punch-form">
              <label>Mettre à jour la note (optionnel)</label>
              <input 
                type="text" 
                placeholder={activeTimer.description || "Ajouter une note de fin..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mobile-input"
              />
              <button 
                className="huge-btn punch-out" 
                onClick={handlePunchOut}
                disabled={loading}
              >
                {loading ? "..." : "PUNCH OUT"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
