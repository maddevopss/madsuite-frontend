import api from "./api";

export const kioskKmService = {
  fetchKioskInfo: async (kioskToken) => {
    const res = await api.get(`/punch/kiosk/${kioskToken}`);
    return res.data;
  },

  checkPinStatus: async (kioskToken, utilisateurId, pin) => {
    const res = await api.post("/punch/status", {
      kiosk_token: kioskToken,
      utilisateur_id: utilisateurId,
      pin,
    });
    return res.data;
  },

  submitKmPunch: async (kioskToken, utilisateurId, pin, formData, finalDistance, isAuto) => {
    const res = await api.post("/punch/km", {
      kiosk_token: kioskToken,
      utilisateur_id: utilisateurId,
      pin: pin,
      projet_id: formData.projet_id,
      distance: parseFloat(finalDistance.toFixed(2)),
      rate_per_unit: parseFloat(formData.rate_per_unit),
      description: formData.description || (isAuto ? "Déplacement (Auto-stop)" : "Déplacement"),
    });
    return res.data;
  },
};
