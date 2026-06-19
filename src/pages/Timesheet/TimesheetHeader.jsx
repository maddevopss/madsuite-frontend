import { memo } from "react";
import { Button } from "../../components/ui";

import { formatWeekLabel } from "./timesheet.utils";

function TimesheetHeader({ weekDate, onPrevWeek, onNextWeek }) {
  return (
    <div className="ts-week">
      <Button type="button" variant="secondary" onClick={onPrevWeek}>
        &lt;
      </Button>

      <div className="ts-week-label">{formatWeekLabel(weekDate)}</div>

      <Button type="button" variant="secondary" onClick={onNextWeek}>
        &gt;
      </Button>
    </div>
  );
}

export default memo(TimesheetHeader);
