import { memo } from "react";
import { Card } from "../../components/ui";
import { useTimer } from "../../TimerContext";

function TimesheetStats({ stats }) {
  const { formatTime } = useTimer();

  if (!stats) return null;

  return (
    <div className="timesheet-stats">
      <Card className="timesheet-stat-card">
        <span>Aujourd'hui</span>

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
    </div>
  );
}

export default memo(TimesheetStats);
