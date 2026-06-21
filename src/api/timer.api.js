import api from "./api";

const unwrapApiResponse = (response) => {
  const body = response?.data;
  return body && typeof body === "object" && typeof body.success === "boolean" && "data" in body
    ? body.data
    : body;
};

export const getActiveTimer = async () => {
  const res = await api.get("/timer/active");
  return unwrapApiResponse(res);
};

export const getTodayProjects = async () => {
  const res = await api.get("/timer/today-projects");
  return unwrapApiResponse(res);
};

export const startTimer = async (data) => {
  const res = await api.post("/timer/start", data);
  return unwrapApiResponse(res);
};

export const startUnsortedTimer = async (description) => {
  const res = await api.post("/timer/start-unsorted", { description });
  return unwrapApiResponse(res);
};

export const stopTimer = async () => {
  const res = await api.patch("/timer/stop");
  return unwrapApiResponse(res);
};

export const updateActiveNote = async (note) => {
  const res = await api.patch("/timer/active/note", { note });
  return unwrapApiResponse(res);
};

export const getLatestActivity = async () => {
  const res = await api.get("/activity/latest");
  return res.data;
};
