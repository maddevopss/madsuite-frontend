import api from "./api";

// GET
export const getClients = async () => {
  const res = await api.get("/clients");
  return res.data;
};

// GET (legacy alias)
export const getClientsDashboard = async () => {
  return getClients();
};

// GET BY ID
export const getClientById = async (id) => {
  const res = await api.get(`/clients/${id}`);
  return res.data;
};

// CREATE
export const createClient = async (client) => {
  const res = await api.post("/clients", client);
  return res.data;
};

// UPDATE
export const updateClient = async (id, client) => {
  const res = await api.put(`/clients/${id}`, client);
  return res.data;
};

// DELETE
export const deleteClient = async (id) => {
  const res = await api.delete(`/clients/${id}`);
  return res.data;
};
