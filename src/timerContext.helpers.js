import { getAccessToken } from "./api/tokenStore";

export function hasAuthToken() {
  return Boolean(getAccessToken());
}

export function getElapsedSeconds(startTime, now = Date.now()) {
  const start = new Date(startTime).getTime();
  return Math.max(0, Math.floor((now - start) / 1000));
}

export function filterProjectsByClient(projets = [], selectedClient = "") {
  if (!selectedClient) return [];

  return (projets || []).filter((p) => {
    const projectClientId = p.client_id || p.clientId || p.clientID;

    return String(projectClientId) === String(selectedClient);
  });
}

export function formatElapsedTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function buildActiveEntry(timerData, { project, client, clientId, fallbackEntry = {} }) {
  return {
    ...timerData,
    projet_nom: project?.nom || project?.projet || fallbackEntry.projet_nom || "Projet",
    client_nom: client?.nom || fallbackEntry.client_nom || "Client",
    projet_couleur: project?.couleur || fallbackEntry.projet_couleur || "var(--color-primary)",
    client_id: clientId,
  };
}
