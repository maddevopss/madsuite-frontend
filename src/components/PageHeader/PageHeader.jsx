import { useTimer } from "../../TimerContext";
import "../layout/header.css";

export default function PageHeader({ icon, title, subtitle, action }) {
  const { isRunning, elapsedFormatted, activeEntry } = useTimer();

  return (
    <div className="page-header">
      <div>
        {isRunning && activeEntry && (
          <div className="page-header-timer">
            <div
              className="page-header-timer-dot"
              style={{
                background: activeEntry?.projet_couleur || activeEntry?.couleur || "var(--color-primary)",
              }}
            />

            <div className="page-header-timer-content">
              <span className="page-header-timer-time">{elapsedFormatted}</span>

              <span className="page-header-timer-project">
                {activeEntry?.client_nom || "Client"} / {activeEntry?.projet_nom || "Projet"}
              </span>
            </div>
          </div>
        )}
        <h1>
          {icon && <span className="page-header-icon">{icon}</span>}
          {title}
        </h1>

        {subtitle && <p>{subtitle}</p>}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
