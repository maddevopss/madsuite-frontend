import api from "./api";

const notificationsApi = {
  listNotifications: async () => {
    const res = await api.get("/notifications");
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data;
  },
};

export default notificationsApi;
