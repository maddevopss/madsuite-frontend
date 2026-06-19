export function formatHours(value) {
  const heures = Number(value || 0);
  const h = Math.floor(heures);
  const m = Math.round((heures - h) * 60);

  return `${h}h ${String(m).padStart(2, "0")}`;
}

export function formatMoney(value) {
  return Number(value || 0).toLocaleString("fr-CA", {
    style: "currency",
    currency: "CAD",
  });
}

// Alias used by Estimates module
export const formatCurrency = formatMoney;

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("fr-CA");
}
