import api from "./api";

export const getExpenses = async (projetId) => {
  const url = projetId ? `/api/expenses?projetId=${projetId}` : "/api/expenses";
  const res = await api.get(url);
  return res.data;
};

export const createExpense = async (data) => {
  const res = await api.post("/api/expenses", data);
  return res.data;
};

export const updateExpense = async (id, data) => {
  const res = await api.put(`/api/expenses/${id}`, data);
  return res.data;
};

export const deleteExpense = async (id) => {
  const res = await api.delete(`/api/expenses/${id}`);
  return res.data;
};
