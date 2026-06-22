import api from "./api";

// GET /api/invoices — list all invoices
export const getInvoices = async (params) => {
  const res = await api.get("/invoices", { params });
  return res.data;
};

// GET /api/invoices/:id — get invoice with items
export const getInvoice = async (id) => {
  const res = await api.get(`/invoices/${id}`);
  return res.data;
};

// GET /api/invoices/unbilled-entries — list unbilled time entries ready to invoice
export const getUnbilledInvoiceEntries = async (clientId) => {
  const res = await api.get("/invoices/unbilled-entries", {
    params: { client_id: clientId },
  });
  return res.data;
};

// GET /api/invoices/unbilled-expenses — list unbilled expenses ready to invoice
export const getUnbilledExpenses = async (clientId) => {
  const res = await api.get("/invoices/unbilled-expenses", {
    params: { client_id: clientId },
  });
  return res.data;
};

// POST /api/invoices — generate invoice from selected time entries
export const createInvoice = async (data) => {
  const res = await api.post("/invoices", data);
  return res.data;
};

// PATCH /api/invoices/:id — update invoice (status, dates, notes)
export const updateInvoice = async (id, payload) => {
  const res = await api.patch(`/invoices/${id}`, payload);
  return res.data;
};

// DELETE /api/invoices/:id — soft delete
export const deleteInvoice = async (id) => {
  const res = await api.delete(`/invoices/${id}`);
  return res.data;
};

// POST /api/invoices/:id/finalize
export const finalizeInvoice = async (id) => {
  const res = await api.post(`/invoices/${id}/finalize`);
  return res.data;
};

// GET /api/invoices/:id/pdf — download PDF
export const downloadInvoicePDF = async (id) => {
  const res = await api.get(`/invoices/${id}/pdf`, { responseType: "arraybuffer" });
  return res.data;
};

// GET /api/invoices/:id/portal-link
export const getInvoicePortalLink = async (id) => {
  const res = await api.get(`/invoices/${id}/portal-link`);
  return res.data;
};

// POST /api/invoices/:id/checkout
export const checkoutInvoice = async (id) => {
  const res = await api.post(`/invoices/${id}/checkout`);
  return res.data;
};
