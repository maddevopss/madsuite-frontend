import { startOfWeek, endOfWeek, toDatetimeLocal, toLocalDateString } from "../pages/Timesheet/timesheet.utils";

export const getEmptyEntryForm = () => ({
  projet_id: "",
  description: "",
  start_time: "",
  end_time: "",
});

export const getEntrySeconds = (entry) => {
  if (entry.duration_seconds != null) {
    return Number(entry.duration_seconds || 0);
  }

  if (entry.heures != null) {
    return Number(entry.heures || 0) * 3600;
  }

  return 0;
};

export const getClientsFromProjets = (projets) => {
  return [
    ...new Map(
      (projets || []).map((projet) => [
        projet.client_id,
        {
          id: projet.client_id,
          nom: projet.client,
        },
      ]),
    ).values(),
  ];
};

export const buildEntriesQuery = ({ weekDate, currentPage, filterClient, filterBilled, filterUser }) => {
  const params = new URLSearchParams();
  params.set("date_debut", toLocalDateString(startOfWeek(weekDate)));
  params.set("date_fin", toLocalDateString(endOfWeek(weekDate)));
  params.set("page", currentPage);
  params.set("limit", 50);

  if (filterClient) params.set("client_id", filterClient);
  if (filterBilled !== "") params.set("is_billed", filterBilled);
  if (filterUser) params.set("utilisateur_id", filterUser);

  return params.toString();
};

export const shiftWeek = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
};

export const getEditFormFromEntry = (entry) => ({
  projet_id: entry.projet_id || "",
  description: entry.description || "",
  start_time: toDatetimeLocal(entry.start_time),
  end_time: toDatetimeLocal(entry.end_time),
});

export const getAddEntryPayload = (form) => ({
  projet_id: form.projet_id,
  description: form.description || null,
  start_time: form.start_time,
  end_time: form.end_time,
});

export const getEditEntryPayload = (form) => ({
  projet_id: form.projet_id,
  description: form.description || null,
  start_time: form.start_time || null,
  end_time: form.end_time || null,
});

export const isAddEntryFormValid = (form) => {
  return Boolean(form.projet_id && form.start_time && form.end_time);
};

export const groupEntriesByDate = (entries) => {
  return entries.reduce((groups, entry) => {
    const dateKey = toLocalDateString(entry.start_time);

    return {
      ...groups,
      [dateKey]: [...(groups[dateKey] || []), entry],
    };
  }, {});
};
