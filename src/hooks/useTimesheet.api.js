import api from "../api/api";

export const loadTimesheetProjets = async () => {
  const res = await api.get("/timesheet/projets");

  return res.data || [];
};

export const loadTimesheetEntries = async (queryString) => {
  const res = await api.get(`/timesheet/entries?${queryString}`);

  return {
    data: res.data?.data || [],
    pagination: {
      page: res.data?.pagination?.page || 1,
      limit: res.data?.pagination?.limit || 50,
      total: res.data?.pagination?.total || 0,
      totalPages: res.data?.pagination?.totalPages || 1,
      hasNext: res.data?.pagination?.hasNext || false,
      hasPrev: res.data?.pagination?.hasPrev || false
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
