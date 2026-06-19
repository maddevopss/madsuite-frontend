export const toLocalDateString = (date) => {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const year = d.getFullYear();

  const month = String(d.getMonth() + 1).padStart(2, "0");

  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const startOfWeek = (date) => {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return new Date();
  }

  const day = d.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + diff);

  d.setHours(0, 0, 0, 0);

  return d;
};

export const endOfWeek = (date) => {
  const d = startOfWeek(date);

  d.setDate(d.getDate() + 6);

  d.setHours(23, 59, 59, 999);

  return d;
};

export const formatWeekLabel = (date) => {
  const start = startOfWeek(date);

  const end = endOfWeek(date);

  const opts = {
    day: "numeric",
    month: "long",
  };

  return `Semaine du ${start.toLocaleDateString("fr-CA", opts)} au ${end.toLocaleDateString("fr-CA", {
    ...opts,
    year: "numeric",
  })}`;
};

export const formatDuration = (heures) => {
  const value = Number(heures || 0);

  const h = Math.floor(value);

  const m = Math.round((value - h) * 60);

  return `${h}h ${String(m).padStart(2, "0")}`;
};

export const formatDate = (iso) => {
  if (!iso) return "—";

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) {
    return "—";
  }

  return d.toLocaleDateString("fr-CA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

export const toDatetimeLocal = (iso) => {
  if (!iso) return "";

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const pad = (n) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
