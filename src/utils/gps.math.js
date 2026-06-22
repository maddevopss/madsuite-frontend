export const AUTO_STOP_MINUTES = 10;
export const MIN_DISTANCE_KM = 0.05;

/**
 * Calcule la distance entre deux points GPS en kilomètres selon la formule de Haversine.
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} distance in km
 */
export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la terre en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatElapsedTime(startTimeMs) {
  if (!startTimeMs) return "00:00:00";
  const now = new Date().getTime();
  const diff = now - startTimeMs;
  const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
  const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
  const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}
