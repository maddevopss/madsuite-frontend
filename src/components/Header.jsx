import { memo, useCallback, useEffect, useMemo } from "react";
import logo from "../assets/logo.png";
import { PlayIcon, PauseIcon, BsSun, BsMoon } from "../assets/Icon/idx_icon";
import { useTimer } from "../TimerContext";
import { useTheme } from "../ThemeContext";
import api from "../api/api";
import ActivitySuggestionBadge from "./activity-intelligence/ActivitySuggestionBadge";
import "./layout/header.css";

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
          placeholder="Sur quoi travaillez-vous ?"
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

        <button className="timer-play" onClick={toggleTimer} disabled={!isRunning && !selectedProjet}>
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
      </div>
    </header>
  );
}
