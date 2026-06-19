import api from "./api";

export const billingAssistantApi = {
  /**
   * Récupère les suggestions pour une date donnée (YYYY-MM-DD)
   */
  getSuggestions: async (date) => {
    const response = await api.get(`/billing-assistant/suggestions`, { params: { date } });
    return response.data;
  },

  /**
   * Applique une suggestion pour créer une entrée de temps
   */
  applySuggestion: async (payload) => {
    const response = await api.post(`/billing-assistant/apply`, payload);
    return response.data;
  },
};
