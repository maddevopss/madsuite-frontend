import { memo } from "react";
import { Button } from "../../components/ui";

function ViewClientDetails({ client, onClose }) {
  if (!client) return null;

  return (
    <>
      <h3>{client.nom}</h3>

      <p>
        Taux défaut :{" "}
        {Number(client.hourly_rate_defaut || 0).toFixed(2)}$ / h
      </p>

      <hr />

      <h4>Projets de ce client</h4>

      {!client.projets || client.projets.length === 0 ? (
        <p>Aucun projet pour ce client.</p>
      ) : (
        <div className="client-projects-list">
          {client.projets.map((p) => (
            <div key={p.id} className="client-project-item">
              <div
                className="client-project-dot"
                style={{
                  background:
                    p.couleur || "var(--color-primary)",
                }}
              />

              <div>
                <strong>{p.nom || p.projet}</strong>

                <span>
                  {p.status || "actif"} ·{" "}
                  {Number(p.taux_horaire || 0).toFixed(2)}$ / h
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="modal-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
        >
          Fermer
        </Button>
      </div>
    </>
  );
}

export default memo(ViewClientDetails);
