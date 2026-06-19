import ClientStats from "./ClientStats";

export default function ClientCard({ client, onEdit, onDelete, onAddProject }) {
  return (
    <div className="client-card">
      <div className="client-card-header">
        <div>
          <h3>{client.nom}</h3>
          <p>Client #{client.id}</p>
        </div>
      </div>

      <ClientStats client={client} />

      <div className="card-actions">
        <button onClick={() => onAddProject(client)}>+ Projet</button>
        <button onClick={() => onEdit(client)}>Modifier</button>
        <button className="danger" onClick={() => onDelete(client.id)}>
          Supprimer
        </button>
      </div>
    </div>
  );
}
