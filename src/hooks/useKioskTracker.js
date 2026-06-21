import { useState, useEffect, useRef, useCallback } from "react";
import { kioskKmService } from "../api/kioskKm.service";

const AUTO_STOP_MINUTES = 10;
const MIN_DISTANCE_KM = 0.05;

// Haversine
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
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

export function useKioskTracker(kioskToken) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Data
  const [org, setOrg] = useState(null);
  const [employes, setEmployes] = useState([]);
  const [projets, setProjets] = useState([]);

  // State Machine
  const [step, setStep] = useState("SELECT_USER"); // SELECT_USER, PIN_PAD, TRACKER
  const [selectedUserId, setSelectedUserId] = useState("");
  const [pin, setPin] = useState("");

  // Tracker State
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [formData, setFormData] = useState({
    projet_id: "",
    rate_per_unit: 0.68,
    description: "",
  });

  const watchIdRef = useRef(null);
  const lastPosRef = useRef(null);
  const lastMovedTimeRef = useRef(Date.now());
  const distanceRef = useRef(0);
  const startTimeRef = useRef(null);

  // Load Kiosk Info
  const fetchInfo = useCallback(async () => {
    try {
      setLoading(true);
      const data = await kioskKmService.fetchKioskInfo(kioskToken);
      setOrg(data.organisation);
      setEmployes(data.employes);
      setProjets(data.projets);
    } catch (err) {
      setError("Ce lien Kiosque est invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  }, [kioskToken]);

  // Handle auto stop
  const checkAutoStop = useCallback(() => {
    if (!isTracking) return;
    const now = Date.now();
    const minutesSinceLastMove = (now - lastMovedTimeRef.current) / 1000 / 60;
    if (minutesSinceLastMove >= AUTO_STOP_MINUTES) {
      stopTrackingAndSave(true);
    }
  }, [isTracking]);

  // GPS Watch
  const startGpsWatch = useCallback(() => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;
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
      (err) => console.warn("Erreur GPS:", err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  }, []);

  // Storage Handlers
  const saveStateToStorage = useCallback(() => {
    localStorage.setItem(
      `kioskKmState_${kioskToken}`,
      JSON.stringify({
        isTracking: true,
        userId: selectedUserId,
        pin: pin,
        distance: distanceRef.current,
        lastPos: lastPosRef.current,
        lastMovedTime: lastMovedTimeRef.current,
        startTime: startTimeRef.current,
        formData: formData,
      })
    );
  }, [kioskToken, selectedUserId, pin, formData]);

  const clearStateStorage = useCallback(() => {
    localStorage.removeItem(`kioskKmState_${kioskToken}`);
  }, [kioskToken]);

  const loadStateFromStorage = useCallback(() => {
    const savedState = localStorage.getItem(`kioskKmState_${kioskToken}`);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed.isTracking) {
        setStep("TRACKER");
        setSelectedUserId(parsed.userId);
        setPin(parsed.pin);
        setIsTracking(true);
        distanceRef.current = parsed.distance || 0;
        setDistance(parsed.distance || 0);
        lastPosRef.current = parsed.lastPos || null;
        lastMovedTimeRef.current = parsed.lastMovedTime || Date.now();
        startTimeRef.current = parsed.startTime || Date.now();
        setFormData(parsed.formData || formData);
        
        startGpsWatch();
        checkAutoStop();
      }
    }
  }, [kioskToken, startGpsWatch, checkAutoStop, formData]);

  // Initial load
  useEffect(() => {
    fetchInfo();
    loadStateFromStorage();

    const intervalId = setInterval(checkAutoStop, 60000);

    return () => {
      clearInterval(intervalId);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [fetchInfo, loadStateFromStorage, checkAutoStop]);

  // Timer
  useEffect(() => {
    let interval;
    if (isTracking && startTimeRef.current) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = now - startTimeRef.current;
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

  // Actions
  const checkStatus = async (currentPin) => {
    try {
      setLoading(true);
      setError(null);
      await kioskKmService.checkPinStatus(kioskToken, selectedUserId, currentPin);
      setStep("TRACKER");
    } catch (err) {
      setError("NIP invalide. Veuillez réessayer.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const handlePinClick = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        checkStatus(newPin);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (isTracking) {
        localStorage.setItem(`kioskKmState_${kioskToken}`, JSON.stringify({
          ...JSON.parse(localStorage.getItem(`kioskKmState_${kioskToken}`) || "{}"),
          formData: newState
        }));
      }
      return newState;
    });
  };

  const startTracking = () => {
    if (!formData.projet_id) {
      setError("Veuillez sélectionner un projet.");
      return;
    }
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée.");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    distanceRef.current = 0;
    setDistance(0);
    lastPosRef.current = null;
    lastMovedTimeRef.current = Date.now();
    startTimeRef.current = Date.now();
    setIsTracking(true);

    saveStateToStorage();
    startGpsWatch();
  };

  const resetKiosk = (keepUser = false) => {
    setDistance(0);
    setFormData((prev) => ({ ...prev, description: "" }));
    if (!keepUser) {
      setStep("SELECT_USER");
      setSelectedUserId("");
      setPin("");
    } else {
      setStep("TRACKER");
    }
  };

  const stopTrackingAndSave = async (isAuto = false) => {
    setIsTracking(false);
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    const finalDistance = distanceRef.current;
    clearStateStorage();

    if (finalDistance < 0.1) {
      setError("Trajet trop court (< 100m). Non enregistré.");
      resetKiosk(false);
      return;
    }

    setLoading(true);
    try {
      await kioskKmService.submitKmPunch(
        kioskToken,
        selectedUserId,
        pin,
        formData,
        finalDistance,
        isAuto
      );

      setSuccessMsg(`Trajet de ${finalDistance.toFixed(2)} km enregistré !`);
      resetKiosk(true);
    } catch (err) {
      setError("Erreur lors de l'enregistrement du trajet.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    org,
    employes,
    projets,
    step,
    setStep,
    selectedUserId,
    setSelectedUserId,
    pin,
    setPin,
    isTracking,
    distance,
    elapsedTime,
    formData,
    handlePinClick,
    handleInputChange,
    startTracking,
    stopTrackingAndSave,
    resetKiosk,
  };
}
