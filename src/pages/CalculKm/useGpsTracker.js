import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "../../ToastContext";

// --- PURE FUNCTIONS ---
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

const AUTO_STOP_MINUTES = 10;
const MIN_DISTANCE_KM = 0.05; // 50 mètres pour éviter les sauts GPS
const STORAGE_KEY = "calculKmState";

export function useGpsTracker(onAutoStop) {
  const { showToast } = useToast();

  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  const [formData, setFormData] = useState({
    projet_id: "",
    rate_per_unit: 0.68,
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  const watchIdRef = useRef(null);
  const lastPosRef = useRef(null);
  const lastMovedTimeRef = useRef(Date.now());
  const distanceRef = useRef(0);
  const startTimeRef = useRef(null);

  // --- STORAGE LOGIC ---
  const saveStateToStorage = useCallback(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        isTracking: true,
        distance: distanceRef.current,
        lastPos: lastPosRef.current,
        lastMovedTime: lastMovedTimeRef.current,
        startTime: startTimeRef.current,
        formData,
      })
    );
  }, [formData]);

  const clearStateStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const loadStateFromStorage = useCallback(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) return false;

    try {
      const parsed = JSON.parse(savedState);
      if (parsed.isTracking) {
        setIsTracking(true);
        distanceRef.current = parsed.distance || 0;
        setDistance(parsed.distance || 0);
        lastPosRef.current = parsed.lastPos || null;
        lastMovedTimeRef.current = parsed.lastMovedTime || Date.now();
        startTimeRef.current = parsed.startTime || Date.now();
        setFormData(parsed.formData || formData);
        return true;
      }
    } catch (e) {
      console.warn("Failed to parse tracking state", e);
    }
    return false;
  }, [formData]);

  const updateFormData = useCallback((name, value) => {
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (isTracking) {
        try {
          const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, formData: newState }));
        } catch (e) { /* ignore */ }
      }
      return newState;
    });
  }, [isTracking]);

  // --- GPS LOGIC ---
  const startGpsWatch = useCallback(() => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: currentLat, longitude: currentLng } = position.coords;

        if (lastPosRef.current) {
          const dist = getDistanceFromLatLonInKm(
            lastPosRef.current.lat,
            lastPosRef.current.lng,
            currentLat,
            currentLng
          );

          if (dist >= MIN_DISTANCE_KM) {
            distanceRef.current += dist;
            setDistance(distanceRef.current);
            lastPosRef.current = { lat: currentLat, lng: currentLng };
            lastMovedTimeRef.current = Date.now();
            saveStateToStorage();
          }
        } else {
          lastPosRef.current = { lat: currentLat, lng: currentLng };
          lastMovedTimeRef.current = Date.now();
          saveStateToStorage();
        }
      },
      (error) => {
        console.warn("Erreur GPS :", error.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  }, [saveStateToStorage]);

  const startTracking = useCallback(() => {
    if (!formData.projet_id) {
      showToast("Veuillez sélectionner un projet avant de démarrer.", "warning");
      return;
    }

    if (!navigator.geolocation) {
      showToast("La géolocalisation n'est pas supportée par votre navigateur.", "error");
      return;
    }

    distanceRef.current = 0;
    setDistance(0);
    lastPosRef.current = null;
    lastMovedTimeRef.current = Date.now();
    startTimeRef.current = Date.now();
    setIsTracking(true);

    saveStateToStorage();
    startGpsWatch();
    showToast("Suivi GPS démarré.", "success");
  }, [formData.projet_id, showToast, saveStateToStorage, startGpsWatch]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    clearStateStorage();
    return distanceRef.current; // Return final distance
  }, [clearStateStorage]);

  // --- TIMER & BACKGROUND CHECKS ---
  useEffect(() => {
    const wasTracking = loadStateFromStorage();
    if (wasTracking) {
      startGpsWatch();
    }

    const intervalId = setInterval(() => {
      if (!isTracking) return;
      const minutesSinceLastMove = (Date.now() - lastMovedTimeRef.current) / 60000;
      if (minutesSinceLastMove >= AUTO_STOP_MINUTES) {
        console.log(`Auto-stop déclenché après ${AUTO_STOP_MINUTES} minutes sans mouvement.`);
        onAutoStop();
      }
    }, 60000);

    return () => {
      clearInterval(intervalId);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [loadStateFromStorage, startGpsWatch, isTracking, onAutoStop]);

  useEffect(() => {
    let interval;
    if (isTracking && startTimeRef.current) {
      interval = setInterval(() => {
        const diff = Date.now() - startTimeRef.current;
        const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
        setElapsedTime(`${h}:${m}:${s}`);
      }, 1000);
    } else {
      setElapsedTime("00:00:00");
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  return {
    isTracking,
    distance,
    elapsedTime,
    formData,
    updateFormData,
    startTracking,
    stopTracking,
    setDistance,
    setFormData
  };
}
