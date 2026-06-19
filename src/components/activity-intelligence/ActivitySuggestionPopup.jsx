import { useActivitySuggestionContext } from "./ActivitySuggestionContext";
import { useTimer } from "../../TimerContext";
import "../feedback/activity-suggestion.css";

export default function ActivitySuggestionPopup() {
  const { suggestion, ignoreSuggestion, ignoreSuggestionForToday } = useActivitySuggestionContext();
  const { restartProject } = useTimer();

  if (!suggestion) return null;

  const { activity, project, source } = suggestion;

  return (
    <div className="activity-suggestion-popup">
      <div className="activity-suggestion-icon">{activity.icon}</div>

      <div className="activity-suggestion-content">
        <strong>Vous semblez travailler sur :</strong>

        <span>{project.nom}</span>

        <small>{source.app_name}</small>

        <div className="activity-suggestion-actions">
          <button
            type="button"
            onClick={() =>
              restartProject({
                projet_id: project.id,
                client_id: project.client_id,
                description: source.window_title,
                projet_nom: project.nom,
                projet_couleur: project.couleur,
              })
            }>
            Reprendre le timer
          </button>

          <button type="button" className="secondary" onClick={ignoreSuggestion}>
            Ignorer
          </button>

          <button type="button" className="secondary" onClick={ignoreSuggestionForToday}>
            Ne plus suggérer aujourd’hui
          </button>
        </div>
      </div>
    </div>
  );
}
