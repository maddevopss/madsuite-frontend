import api from "./api";

// GET /summary pour le dashboard
export async function getClientsSummary() {
  const res = await api.get("/dashboard/clients-summary");
  return res.data;
}

export async function getActivitySummary(dateDebut, dateFin) {
  const res = await api.get("/activity/summary", {
    params: {
      date_debut: dateDebut,
      date_fin: dateFin,
    },
  });

  return res.data;
}

export async function categorizeUnclassifiedAi() {
  const res = await api.post("/activity-intelligence/ai-categorize-unclassified");
  return res.data;
}
