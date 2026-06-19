import { memo } from "react";
import { Card } from "../../components/ui";
import { useTimer } from "../../TimerContext";

function TimesheetWeekStats({ stats }) {
  const { formatTime } = useTimer();

  if (!stats) return null;

  return (
    <div className="timesheet-week-stats">
      <Card className="timesheet-stat-card">
        <span>Semaine</span>

        <strong>{formatTime(stats.totalSeconds || 0)}</strong>
      </Card>

      <Card className="timesheet-stat-card">
        <span>Facturable</span>

        <strong>{formatTime(stats.facturableSeconds || 0)}</strong>
      </Card>

      <Card className="timesheet-stat-card">
        <span>Projets</span>

        <strong>{stats.projetsTotal || 0}</strong>
      </Card>

      <Card className="timesheet-stat-card">
        <span>Montant</span>

        <strong>{Number(stats.montant || 0).toFixed(2)}$</strong>
      </Card>
    </div>
  );
}

export default memo(TimesheetWeekStats);
