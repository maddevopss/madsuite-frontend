import api from "../api/api";

export const loadTimesheetProjets = async () => {
  const res = await api.get("/timesheet/projets");

  return res.data || [];
};

export const loadTimesheetEntries = async (queryString) => {
  const res = await api.get(`/timesheet/entries?${queryString}`);

  return {
    data: res.data?.entries || [],
    pagination: {
      page: res.data?.page || 1,
      limit: res.data?.limit || 50,
      total: res.data?.total || 0,
      totalPages: res.data?.totalPages || 1
    },
  };
};

export const createTimesheetEntry = (payload) => {
  return api.post("/timesheet/manual", payload);
};

export const updateTimesheetEntry = (entryId, payload) => {
  return api.patch(`/timesheet/entries/${entryId}`, payload);
};

export const updateTimesheetEntryBilled = (entryId, isBilled) => {
  return api.patch(`/timesheet/entries/${entryId}/facturer`, {
    is_billed: isBilled,
  });
};

export const removeTimesheetEntry = (entryId) => {
  return api.delete(`/timesheet/entries/${entryId}`);
};

export const updateTimesheetEntryStatus = (entryId, status) => {
  return api.patch(`/timesheet/entries/${entryId}/status`, { status });
};
