import api from "./api";

// GET tous les projets
export const getProjects = async () => {
  const res = await api.get("/projets");
  return res.data;
};

// GET projets par client
export const getProjectsByClient = async (clientId) => {
  const res = await api.get(`/projets/client/${clientId}`);
  return res.data;
};

// CREATE
export const createProject = async (data) => {
  const res = await api.post("/projets", data);
  return res.data;
};

// UPDATE
export const updateProject = async (id, payload) => {
  const res = await api.put(`/projets/${id}`, payload);
  return res.data;
};

// DELETE
export const deleteProject = async (id) => {
  const res = await api.delete(`/projets/${id}`);
  return res.data;
};

// GET AI SUMMARY
export const getProjectAiSummary = async (id) => {
  const res = await api.get(`/projets/${id}/ai-summary`);
  return res.data;
};
