import api from "./api";

// GET /api/estimates
export const getEstimates = async (params) => {
  const res = await api.get("/estimates", { params });
  return res.data;
};

// GET /api/estimates/:id
export const getEstimate = async (id) => {
  const res = await api.get(`/estimates/${id}`);
  return res.data;
};

// POST /api/estimates
export const createEstimate = async (data) => {
  const res = await api.post("/estimates", data);
  return res.data;
};

// PATCH /api/estimates/:id
export const updateEstimate = async (id, data) => {
  const res = await api.patch(`/estimates/${id}`, data);
  return res.data;
};

// DELETE /api/estimates/:id
export const deleteEstimate = async (id) => {
  const res = await api.delete(`/estimates/${id}`);
  return res.data;
};

// POST /api/estimates/:id/convert
export const convertEstimateToInvoice = async (id) => {
  const res = await api.post(`/estimates/${id}/convert`);
  return res.data;
};

// GET /api/estimates/:id/pdf
export const downloadEstimatePdf = async (id) => {
  const response = await api.get(`/estimates/${id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
};
