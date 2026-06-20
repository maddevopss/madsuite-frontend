import api from "./api";

export const getExpenses = async (projetId) => {
  const url = projetId ? `/expenses?projetId=${projetId}` : "/expenses";
  const res = await api.get(url);
  return res.data;
};

export const createExpense = async (data) => {
  const res = await api.post("/expenses", data);
  return res.data;
};

export const updateExpense = async (id, data) => {
  const res = await api.put(`/expenses/${id}`, data);
  return res.data;
};

export const deleteExpense = async (id) => {
  const res = await api.delete(`/expenses/${id}`);
  return res.data;
};
