import { memo } from "react";
import { Button } from "../../components/ui/index";

function UserHistoryContent({ historyUser, historyEntries, onEdit }) {
  return (
    <>
      <div className="history-header">
        <button className="history-full-btn" onClick={() => (window.location.href = `/timesheet?user=${historyUser?.id}`)}>
          Voir tout
        </button>
      </div>

      <p className="users-modal-subtitle">5 dernières sessions de {historyUser?.nom}</p>

      {!historyEntries || historyEntries.length === 0 ? (
        <p>Aucune session trouvée.</p>
      ) : (
        <div className="history-list">
          {historyEntries.map((entry) => (
            <div className="history-card" key={entry.id}>
              <strong>
                {entry.client || "Sans client"} · {entry.projet || "Sans projet"}
              </strong>

              <span>{entry.description || "Sans description"}</span>

              <small>Début : {new Date(entry.start_time).toLocaleString("fr-CA")}</small>

              <small>Fin : {entry.end_time ? new Date(entry.end_time).toLocaleString("fr-CA") : "En cours"}</small>

              <small>Durée : {entry.heures ? `${parseFloat(entry.heures).toFixed(2)} h` : "En cours"}</small>

              <Button className="ts-action-btn" onClick={() => onEdit(entry)} title="Modifier">
                ✏️
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default memo(UserHistoryContent);
