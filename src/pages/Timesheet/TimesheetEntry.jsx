import { memo } from "react";
import { Badge, Button } from "../../components/ui";
import { useTimer } from "../../TimerContext";

import TimesheetTimeline from "./TimesheetTimeline";

function TimesheetEntry({ entry, onToggleBilled, onToggleStatus, onEdit, onDelete }) {
  const { restartProject } = useTimer();

  return (
    <div className="ts-entry-row">
      <div>{entry.client || entry.client_nom || "N/A"}</div>

      <div>{entry.projet || entry.projet_nom || "N/A"}</div>

      <div>{entry.utilisateur || entry.utilisateur_nom || "N/A"}</div>

      <div>{entry.description || "—"}</div>

      <div>{Number(entry.heures || 0).toFixed(2)}h</div>

      <div className="timesheet-badges">
        <Badge variant={
          entry.status === 'approved' ? 'success' : 
          entry.status === 'rejected' ? 'danger' : 
          entry.status === 'submitted' ? 'info' : 'default'
        }>
          {entry.status === 'approved' ? 'Approuvé' : 
           entry.status === 'rejected' ? 'Rejeté' : 
           entry.status === 'submitted' ? 'Soumis' : 'Brouillon'}
        </Badge>

        {entry.is_billed ? (
          <Badge variant="success">Facturée</Badge>
        ) : entry.invoice_id ? (
          <Badge variant="warning">Réservée dans un brouillon</Badge>
        ) : (
          <Badge variant="default">Non facturée</Badge>
        )}

        {entry.end_time === null && <Badge variant="info">Timer live</Badge>}

        {Number(entry.heures || 0) <= 0.5 && <Badge variant="warning">Minimum 30 min</Badge>}
      </div>

      <TimesheetTimeline entry={entry} />

      <div className="actions">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            restartProject({
              projet_id: entry.projet_id,
              client_id: entry.client_id,
              description: entry.description,
              projet_nom: entry.projet || entry.projet_nom,
              client_nom: entry.client || entry.client_nom,
              projet_couleur: entry.projet_couleur || entry.couleur,
            })
          }>
          Reprendre
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={() => onToggleStatus(entry)}
        >
          {entry.status === 'draft' || !entry.status ? "Soumettre" : 
           entry.status === 'submitted' ? "Approuver" : 
           entry.status === 'approved' ? "Rejeter" : "Soumettre"}
        </Button>

        <Button
          type="button"
          variant={entry.is_billed ? "warning" : "success"}
          disabled={Boolean(entry.invoice_id)}
          onClick={() => onToggleBilled(entry)}
        >
          {entry.is_billed ? "Non facturé" : "Facturer"}
        </Button>

        <Button type="button" variant="secondary" onClick={() => onEdit(entry)}>
          Modifier
        </Button>

        <Button type="button" variant="danger" onClick={() => onDelete(entry.id)}>
          Supprimer
        </Button>
      </div>
    </div>
  );
}

export default memo(TimesheetEntry);
