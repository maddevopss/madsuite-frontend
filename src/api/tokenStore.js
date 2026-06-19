/**
 * Stockage en mémoire de l'Access Token pour éviter les attaques XSS.
 */
let accessToken = null;

// Canal de communication entre onglets
const authChannel = typeof window !== "undefined" && typeof BroadcastChannel !== "undefined"
  ? new BroadcastChannel("auth_sync")
  : null;

export const setAccessToken = (token, broadcast = true) => {
  accessToken = token;

  // Notifier api.jsx que le cache d'expiration doit être invalidé
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("token:updated", { detail: { token } }));
  }

  // Electron : Synchronisation impérative avec le Main Process (Tracking)
  if (typeof window !== "undefined" && window.agentAPI?.agentTokenRefreshed) {
    window.agentAPI.agentTokenRefreshed(token).catch(() => {});
  }

  // On prévient les autres onglets, sauf si l'ordre vient déjà du canal
  if (broadcast && authChannel) {
    authChannel.postMessage({ type: "TOKEN_UPDATED", token });
  }
};

export const getAccessToken = () => {
  return accessToken;
};

export const clearAccessToken = (broadcast = true) => {
  accessToken = null;
  if (broadcast && authChannel) {
    authChannel.postMessage({ type: "TOKEN_CLEARED" });
  }
};

// Écoute des mises à jour venant des autres onglets
if (authChannel) {
  authChannel.onmessage = (event) => {
    if (event.data.type === "TOKEN_UPDATED") {
      setAccessToken(event.data.token, false);
    } else if (event.data.type === "TOKEN_CLEARED") {
      clearAccessToken(false);
    }
  };
}

export default { setAccessToken, getAccessToken, clearAccessToken };
