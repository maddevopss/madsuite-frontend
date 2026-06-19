export const toDatetimeLocal = (iso) => {
  if (!iso) return "";

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const pad = (n) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const getClientsFromProjects = (projets = []) => {
  return [
    ...new Map(
      projets.map((p) => [
        p.client_id,
        {
          id: p.client_id,
          nom: p.client || p.client_nom || "Client",
        },
      ]),
    ).values(),
  ];
};
