import { memo, useCallback, useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState } from "../../components/ui";

import { classifyActivity, detectProjectFromTitle } from "../../utils/activityClassifier";

import { useReports } from "../../hooks/useReports";
import { useTimer } from "../../TimerContext";
import AutoTimesheetModal from "../Timesheet/AutoTimesheetModal";

function DashboardActivityIntelligence() {
  const { activityLogs = [] } = useReports();
  const { projets = [], restartProject } = useTimer();

  const [showAutoFill, setShowAutoFill] = useState(false);

  const recent = useMemo(() => activityLogs.slice(0, 6), [activityLogs]);

  const restartDetectedProject = useCallback(
    (row, detectedProject) => {
      restartProject({
        projet_id: detectedProject.id,
        client_id: detectedProject.client_id,
        description: row.window_title,
        projet_nom: detectedProject.nom,
        projet_couleur: detectedProject.couleur,
      });
    },
    [restartProject],
  );

  const computedRecent = useMemo(
    () =>
      recent.map((row) => {
        const activity = classifyActivity(row.app_name, row.window_title);
        const detectedProject = detectProjectFromTitle(row.window_title, projets);

        return { row, activity, detectedProject };
      }),
    [projets, recent],
  );

  return (
    <Card className="dashboard-activity-intelligence">
      <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          🧠 Assistant Mémoire (IA)
        </div>
        <Button size="sm" variant="primary" onClick={() => setShowAutoFill(true)}>
          ✨ Créer ma feuille de temps
        </Button>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        Oublié de démarrer le chronomètre ? Voici ce que l'IA a détecté pendant votre session.
      </p>

      <div className="activity-ai-list">
        {recent.length === 0 ? (
          <EmptyState message="Aucune activité récente." />
        ) : (
          computedRecent.map(({ row, activity, detectedProject }) => {
            return (
              <div key={row.id} className="activity-ai-row">
                <div className="activity-ai-type">
                  <span>{activity.icon}</span>

                  <div>
                    <div className="activity-ai-label">{activity.label}</div>

                    <Badge variant="info">{Math.round(activity.confidence * 100)}%</Badge>
                  </div>
                </div>

                <div className="activity-ai-info">
                  <div>{row.app_name || "Application inconnue"}</div>

                  <div className="activity-ai-window">{row.window_title || "Fenêtre sans titre"}</div>

                  {detectedProject && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => restartDetectedProject(row, detectedProject)}>
                      Reprendre {detectedProject.nom}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AutoTimesheetModal 
        show={showAutoFill} 
        onClose={() => setShowAutoFill(false)} 
        targetDate={new Date().toISOString().split('T')[0]}
        onSaveSuccess={() => {
          setShowAutoFill(false);
          // Optionnel : un petit toast ou reload pour rafraichir
          window.location.reload();
        }} 
      />
    </Card>
  );
}

export default memo(DashboardActivityIntelligence);
