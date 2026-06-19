import { memo } from "react";
import { Card, EmptyState, Loader } from "../../components/ui";

import TimesheetEntry from "./TimesheetEntry";

function TimesheetTable({ entries = [], loading, totalHeures, onToggleBilled, onToggleStatus, onEdit, onDelete }) {
  return (
    <Card className="timesheet-table-card">
      <div className="ts-entry-head">
        <span></span>
        <span>Date</span>
        <span>Description</span>
        <span>Client · Projet</span>
        <span>Durée</span>
        <span>Statut</span>
        <span>Actions</span>
      </div>

      {loading ? (
        <Loader label="Chargement..." variant="table" />
      ) : entries.length === 0 ? (
        <EmptyState message="Aucune entrée cette semaine." />
      ) : (
        entries.map((entry) => (
          <TimesheetEntry key={entry.id} entry={entry} onToggleBilled={onToggleBilled} onToggleStatus={onToggleStatus} onEdit={onEdit} onDelete={onDelete} />
        ))
      )}

      <div className="ts-total">
        <span>Total semaine</span>

        <span>{Number(totalHeures || 0).toFixed(2)}h</span>
      </div>
    </Card>
  );
}

export default memo(TimesheetTable);
