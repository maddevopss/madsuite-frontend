import { memo, useCallback, useEffect, useMemo } from "react";
import logo from "../assets/logo.png";
import { PlayIcon, PauseIcon, BsSun, BsMoon } from "../assets/Icon/idx_icon";
import { useTimer } from "../TimerContext";
import { useTheme } from "../ThemeContext";
import api from "../api/api";
import ActivitySuggestionBadge from "./activity-intelligence/ActivitySuggestionBadge";
import FocusTunnel from "../pages/Dashboard/FocusTunnel";
import AnchorRitualModal from "./AnchorRitualModal";
import CognitiveMirrorModal from "./CognitiveMirrorModal";
import "./layout/header.css";
import { useState } from "react";

const ResumeProjectButton = memo(function ResumeProjectButton({ project, onResume }) {
  return (
    <button type="button" className="resume-project" onClick={() => onResume(project)}>
      <span
        className="resume-dot"
        style={{
          background: project.projet_couleur || "var(--color-primary)",
        }}
      />

      <span>
        Reprendre {project.client_nom} / {project.projet_nom}
      </span>
    </button>
  );
});

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const {
    isRunning,
    description,
    setDescription,
    selectedClient,
    setSelectedClient,
    selectedProjet,
    setSelectedProjet,
    clients,
    projetsFiltres,
    toggleTimer,
    elapsedFormatted,
    setProjets,
    activeEntry,
    todayProjects,
    resumeProject,
    note,
    updateNote,
    setNote,
    isLongRunning,
    activeTimerWarning,
    stopActiveTimer,
  } = useTimer();

  const elapsedSeconds = useTimer().elapsed || 0;
  const progressPercent = useMemo(() => {
    if (!isRunning) return 0;
    return Math.min(100, (elapsedSeconds % 3600) / 3600 * 100);
  }, [isRunning, elapsedSeconds]);

  const [showFocusTunnel, setShowFocusTunnel] = useState(false);
  const [showAnchorRitual, setShowAnchorRitual] = useState(false);
  const [showCognitiveMirror, setShowCognitiveMirror] = useState(false);
  const [mirrorData, setMirrorData] = useState({ intent: "", startTime: null, endTime: null });
  const [isPulsing, setIsPulsing] = useState(false);

  // Momentum Engine : Pulse effect if inactive for > 2 mins
  useEffect(() => {
    let timer;
    if (!isRunning) {
      timer = setTimeout(() => {
        setIsPulsing(true);
      }, 120000); // 2 minutes
    } else {
      setIsPulsing(false);
    }
    return () => clearTimeout(timer);
  }, [isRunning]);

  const handlePlayClick = () => {
    if (!isRunning) {
      if (!description || description.trim() === "") {
        setShowAnchorRitual(true);
      } else {
        toggleTimer();
      }
    } else {
      // Stopping the timer -> Show Cognitive Mirror
      if (activeEntry && activeEntry.start_time) {
        setMirrorData({
          intent: description,
          startTime: activeEntry.start_time,
          endTime: new Date().toISOString()
        });
        setShowCognitiveMirror(true);
      }
      toggleTimer();
    }
  };

  const handleAnchorConfirm = (action, duration) => {
    setDescription(action);
    setShowAnchorRitual(false);
    // On ajoute un timeout léger pour laisser le state description se propager (ou on lance direct)
    setTimeout(() => {
      if (!isRunning) toggleTimer();
    }, 50);
  };

  const loadProjets = useCallback(async () => {
    try {
      const res = await api.get("/timesheet/projets");
      setProjets(res.data || []);
    } catch (err) {
      console.error("LOAD TIMER PROJECTS:", err);
    }
  }, [setProjets]);

  const visibleTodayProjects = useMemo(() => todayProjects.slice(0, 4), [todayProjects]);
  const handleClientChange = useCallback(
    (e) => {
      setSelectedClient(e.target.value);
      setSelectedProjet("");
    },
    [setSelectedClient, setSelectedProjet],
  );
  const handleProjetChange = useCallback((e) => setSelectedProjet(e.target.value), [setSelectedProjet]);
  const handleSaveNote = useCallback(() => updateNote(note), [note, updateNote]);

  useEffect(() => {
    loadProjets();

    window.addEventListener("focus", loadProjets);
    window.addEventListener("projects-updated", loadProjets);

    return () => {
      window.removeEventListener("focus", loadProjets);
      window.removeEventListener("projects-updated", loadProjets);
    };
  }, [loadProjets]);

  useEffect(() => {
    if (!selectedClient || isRunning) return;

    const loadClientProjects = async () => {
      try {
        const res = await api.get(`/projets/client/${selectedClient}`);
        setProjets(res.data || []);
      } catch (err) {
        console.error("LOAD CLIENT PROJECTS:", err.response?.data || err.message);
      }
    };

    loadClientProjects();
  }, [selectedClient, isRunning, setProjets]);

  return (
    <header className="header">
      <div
        className="timer-project-dot"
        style={{
          background: activeEntry?.projet_couleur,
        }}
      />

      <img src={logo} className="App-logo" alt="logo" />

      <div className="timer-bar">
        {isRunning && (
          <div 
            className="timer-visual-progress" 
            style={{ width: `${progressPercent}%` }} 
          />
        )}
        <div className={`timer-status ${isRunning ? "running" : "idle"}`} />

        {!isRunning && visibleTodayProjects.length > 0 && (
          <div className="resume-projects">
            {visibleTodayProjects.map((p) => (
              <ResumeProjectButton key={p.projet_id} project={p} onResume={resumeProject} />
            ))}
          </div>
        )}

        <input
          className="timer-input"
          placeholder="Mon objectif (ex: 'Écrire 1 phrase', 'Ouvrir Figma') :"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isRunning}
        />

        {isRunning && isLongRunning && activeTimerWarning && (
          <div className="timer-warning">
            <div className="timer-warning__text">⚠️ {activeTimerWarning}</div>

            <button type="button" className="timer-warning__button" onClick={stopActiveTimer}>
              Terminer maintenant
            </button>
          </div>
        )}

        {isRunning && activeEntry && (
          <div className="timer-note">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note rapide sur le timer actif..."
              className="timer-note__input"
            />

            <button type="button" className="timer-note__button" onClick={handleSaveNote}>
              Sauvegarder
            </button>
          </div>
        )}

        <select
          value={selectedClient || ""}
          onChange={handleClientChange}
          disabled={isRunning}>
          <option value="">Client</option>
          {(clients || []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>

        <select
          value={selectedProjet || ""}
          onChange={handleProjetChange}
          disabled={isRunning || !selectedClient}>
          <option value="">Projet</option>
          {(projetsFiltres || []).map((p) => (
            <option key={p.id || p.projet_id} value={p.id || p.projet_id}>
              {p.projet || p.projet_nom || p.nom}
            </option>
          ))}
        </select>

        {activeEntry && (
          <div className="timer-active-project">
            <span>{activeEntry.projet_nom}</span>
          </div>
        )}

        <button 
          className="timer-play" 
          onClick={handlePlayClick}
          style={isPulsing ? { animation: 'pulse-primary 2s infinite', boxShadow: '0 0 15px rgba(var(--color-primary-rgb), 0.5)' } : {}}
        >
          {isRunning ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="timer-live">
          <span className="timer-live-time">{elapsedFormatted}</span>

          {isRunning && activeEntry && (
            <span className="timer-live-project">
              {activeEntry.client_nom} / {activeEntry.projet_nom}
            </span>
          )}
        </div>

        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          title="Basculer le thème"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-primary)", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {theme === "dark" ? <BsSun size={20} /> : <BsMoon size={20} />}
        </button>

        <ActivitySuggestionBadge />
        
        {isRunning && (
          <button 
            className="theme-toggle" 
            onClick={() => setShowFocusTunnel(true)} 
            title="Entrer dans le tunnel"
            style={{ background: "var(--color-danger)", color: "white", borderRadius: "16px", padding: "4px 12px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem", marginLeft: "8px" }}
          >
            🌑 Tunnel
          </button>
        )}
      </div>

      <FocusTunnel show={showFocusTunnel} onClose={() => setShowFocusTunnel(false)} />
      <AnchorRitualModal 
        show={showAnchorRitual} 
        onClose={() => setShowAnchorRitual(false)} 
        onConfirm={handleAnchorConfirm} 
      />
      <CognitiveMirrorModal
        show={showCognitiveMirror}
        onClose={() => setShowCognitiveMirror(false)}
        intent={mirrorData.intent}
        startTime={mirrorData.startTime}
        endTime={mirrorData.endTime}
      />
    </header>
  );
}
