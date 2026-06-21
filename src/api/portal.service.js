const API_BASE = import.meta.env.VITE_API_URL || "";

export const portalService = {
  fetchPortalDocument: async (token) => {
    const response = await fetch(`${API_BASE}/api/portal/${token}`, {
      credentials: "include",
    });

    if (!response.ok) throw new Error("Lien expiré ou invalide.");
    return await response.json();
  },

  submitPortalAction: async (token, action, signatureData) => {
    const body = { action };
    if (action === "accepted" && signatureData) {
      body.signature_data = signatureData;
    }

    const response = await fetch(`${API_BASE}/api/portal/${token}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Action impossible");
    }

    return await response.json();
  },

  initiateCheckout: async (token) => {
    const response = await fetch(`${API_BASE}/api/portal/${token}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result;
  },

  getPdfUrl: (token) => `${API_BASE}/api/portal/${token}/pdf`,
};
