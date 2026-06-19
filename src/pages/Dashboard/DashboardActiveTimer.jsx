import { memo, useMemo } from "react";
import { classifyActivity, detectProjectFromTitle } from "../../utils/activityClassifier";
import { useReports } from "../../hooks/useReports";
import { useTimer } from "../../TimerContext";

function DashboardActivityIntelligence() {
  const { activityLogs = [] } = useReports();
  const { projets = [], restartProject } = useTimer();

  const recent = useMemo(() => activityLogs.slice(0, 6), [activityLogs]);
  const computedRecent = useMemo(() => {
    return recent.map((row) => {
      const activity = classifyActivity(row.app_name, row.window_title);
      const detectedProject = detectProjectFromTitle(row.window_title, projets);

      return { row, activity, detectedProject };
    });
  }, [recent, projets]);

  return (
    <div className="card">
      <div className="card-title">Activité intelligente</div>

      <div className="activity-ai-list">
        {recent.length === 0 ? (
          <div className="ts-empty">Aucune activité récente.</div>
        ) : (
          computedRecent.map(({ row, activity, detectedProject }) => (
            <div key={row.id} className="activity-ai-row">
              <div className="activity-ai-type">
                <span>{activity.icon}</span>

                <div>
                  <div className="activity-ai-label">{activity.label}</div>

                  <div className="activity-ai-confidence">{Math.round(activity.confidence * 100)}%</div>
                </div>
              </div>

              <div className="activity-ai-info">
                <div>{row.app_name}</div>

                <div className="activity-ai-window">{row.window_title}</div>
                {detectedProject && (
                  <button
                    type="button"
                    className="activity-ai-suggestion"
                    onClick={() =>
                      restartProject({
                        projet_id: detectedProject.id,
                        client_id: detectedProject.client_id,
                        description: row.window_title,
                        projet_nom: detectedProject.nom,
                        projet_couleur: detectedProject.couleur,
                      })
                    }>
                    Reprendre {detectedProject.nom}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default memo(DashboardActivityIntelligence);
