export default function ClientStats({ client }) {
  return (
    <div className="client-stats">
      <span>{client.projets_total || 0} projets</span>
      <span>{Number(client.heures_total || 0).toFixed(1)} h</span>
      <span>{Number(client.hourly_rate_defaut || 0).toFixed(2)} $ / h</span>
    </div>
  );
}
