import api from "../api/api";

export const loadUsersList = async () => {
  const res = await api.get("/users");

  return res.data || [];
};

export const loadTimesheetProjets = async () => {
  const res = await api.get("/timesheet/projets");

  return res.data || [];
};

export const createUserRequest = (payload) => {
  return api.post("/users", payload);
};

export const changeUserPasswordRequest = (userId, password) => {
  return api.put(`/users/${userId}/password`, {
    mot_de_passe: password,
  });
};

export const deleteUserRequest = (userId) => {
  return api.delete(`/users/${userId}`);
};

export const loadUserHistoryEntries = async (userId) => {
  const res = await api.get(`/users/${userId}/time-entries/recent`);

  return res.data || [];
};

export const updateHistoryEntryRequest = (entryId, payload) => {
  return api.patch(`/timesheet/entries/${entryId}`, payload);
};
