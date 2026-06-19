import { memo } from "react";
import { Card, Button, EmptyState } from "../../components/ui";

function ClientsGrid({ clients = [], isAdmin, onView, onEdit, onDelete }) {
  if (clients.length === 0) {
    return <EmptyState message="Aucun client trouvé." />;
  }

  return (
    <div className="clients-grid">
      {clients.map((c) => (
        <Card key={c.id} className="client-card-ui">
          <h3>{c.nom || "Client sans nom"}</h3>

          <p>{Number(c.hourly_rate_defaut || 0).toFixed(2)}$ / h</p>

          <div className="stats">
            <span>Projets: {c.projets_total || 0}</span>

            <span>Heures: {Number(c.heures_total || 0).toFixed(1)}h</span>
          </div>

          <div className="actions">
            <Button type="button" size="sm" variant="secondary" onClick={() => onView(c.id)}>
              Voir
            </Button>

            {isAdmin && (
              <Button type="button" size="sm" variant="primary" onClick={() => onEdit(c)}>
                Modifier
              </Button>
            )}

            {isAdmin && (
              <Button type="button" size="sm" variant="danger" onClick={() => onDelete(c.id)}>
                Supprimer
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default memo(ClientsGrid);
