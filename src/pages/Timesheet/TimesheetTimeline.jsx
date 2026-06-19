import { memo } from "react";

function TimesheetTimeline({ entry }) {
  if (!entry?.start_time || !entry?.end_time) return null;

  const start = new Date(entry.start_time);
  const end = new Date(entry.end_time);

  const startMinutes = start.getHours() * 60 + start.getMinutes();

  const endMinutes = end.getHours() * 60 + end.getMinutes();

  const duration = Math.max(endMinutes - startMinutes, 0);

  const left = (startMinutes / 1440) * 100;

  const width = Math.max((duration / 1440) * 100, 2);

  return (
    <div className="timeline-row">
      <div
        className="timeline-bar"
        style={{
          left: `${left}%`,
          width: `${width}%`,
          background: entry.projet_couleur || entry.couleur || "var(--color-primary)",
        }}
      />
    </div>
  );
}

export default memo(TimesheetTimeline);
