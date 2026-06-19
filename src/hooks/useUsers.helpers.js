import { toDatetimeLocal, getClientsFromProjects } from "../pages/Users/users.utils";

export const getEmptyEditForm = () => ({
  description: "",
  projet_id: "",
  start_time: "",
  end_time: "",
});

export const buildCreateUserPayload = ({ nom, email, password, role }) => ({
  nom: nom.trim(),
  email: email.trim(),
  mot_de_passe: password.trim(),
  role,
});

export const validateCreateUserPayload = (payload) => {
  if (!payload.nom) return "Le nom est requis.";
  if (!payload.email) return "Le courriel est requis.";
  if (!payload.mot_de_passe) return "Le mot de passe est requis.";

  return null;
};

export const normalizePassword = (passwordValue, fallbackPassword) => {
  return String(passwordValue ?? fallbackPassword ?? "").trim();
};

export const getEditHistoryFormFromEntry = (entry) => ({
  description: entry.description || "",
  projet_id: entry.projet_id || "",
  start_time: toDatetimeLocal(entry.start_time),
  end_time: toDatetimeLocal(entry.end_time),
});

export const getClientIdForEntry = (entry, projets) => {
  const projet = projets.find((p) => String(p.id) === String(entry.projet_id));

  return projet?.client_id || "";
};

export const buildHistoryEntryPayload = (form) => ({
  projet_id: Number(form.projet_id),
  description: form.description || null,
  start_time: form.start_time ? new Date(form.start_time).toISOString() : null,
  end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
});

export const getClientsEdit = (projets) => {
  return getClientsFromProjects(projets);
};

export const getProjetsForClient = (projets, clientId) => {
  return projets.filter((projet) => String(projet.client_id) === String(clientId));
};
