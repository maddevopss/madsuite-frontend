import api from "./api";

/**
 * Downloads a CSV file from the given endpoint
 */
const downloadCSV = async (endpoint, filename, params = {}) => {
  const response = await api.get(endpoint, {
    params,
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportInvoicesCSV = async (startDate, endDate) => {
  const dateStr = new Date().toISOString().slice(0, 10);
  return downloadCSV("/integrations/export/invoices", `invoices_${dateStr}.csv`, { startDate, endDate });
};

export const exportExpensesCSV = async (startDate, endDate) => {
  const dateStr = new Date().toISOString().slice(0, 10);
  return downloadCSV("/integrations/export/expenses", `expenses_${dateStr}.csv`, { startDate, endDate });
};

export const exportLedgerCSV = async (startDate, endDate) => {
  const dateStr = new Date().toISOString().slice(0, 10);
  return downloadCSV("/integrations/export/ledger", `ledger_${dateStr}.csv`, { startDate, endDate });
};
