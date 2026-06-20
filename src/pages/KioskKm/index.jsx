import { useState } from "react";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import "../Kiosk/Kiosk.css"; // Réutilisation des styles Kiosk

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
  const d = R * c;
  return d;
}

const AUTO_STOP_MINUTES = 10;
const MIN_DISTANCE_KM = 0.05;

export default function KioskKm() {
  const { kioskToken } = useParams();
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

  useEffect(() => {
    fetchKioskInfo();
    loadStateFromStorage();

    const intervalId = setInterval(() => {
      checkAutoStop();
    }, 60000);

    return () => {
      clearInterval(intervalId);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kioskToken]);

  const fetchKioskInfo = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/punch/kiosk/${kioskToken}`);
      setOrg(res.data.organisation);
      setEmployes(res.data.employes);
      setProjets(res.data.projets);
    } catch (err) {
      setError("Ce lien Kiosque est invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const loadStateFromStorage = () => {
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
  };

  const saveStateToStorage = () => {
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
  };

  const clearStateStorage = () => {
    localStorage.removeItem(`kioskKmState_${kioskToken}`);
  };

  const checkStatus = async (currentPin) => {
    try {
      setLoading(true);
      setError(null);
      // We just call /punch/status to verify the PIN is correct for this user
      await api.post("/punch/status", {
        kiosk_token: kioskToken,
        utilisateur_id: selectedUserId,
        pin: currentPin
      });
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

  const startGpsWatch = () => {
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
  };

  const checkAutoStop = () => {
    if (!isTracking) return;
    const now = Date.now();
    const minutesSinceLastMove = (now - lastMovedTimeRef.current) / 1000 / 60;
    if (minutesSinceLastMove >= AUTO_STOP_MINUTES) {
      stopTrackingAndSave(true);
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
      await api.post("/punch/km", {
        kiosk_token: kioskToken,
        utilisateur_id: selectedUserId,
        pin: pin,
        projet_id: formData.projet_id,
        distance: parseFloat(finalDistance.toFixed(2)),
        rate_per_unit: parseFloat(formData.rate_per_unit),
        description: formData.description || (isAuto ? "Déplacement (Auto-stop)" : "Déplacement"),
      });

      setSuccessMsg(`Trajet de ${finalDistance.toFixed(2)} km enregistré !`);
      resetKiosk(true); // reset form but keep user logged in step
    } catch (err) {
      setError("Erreur lors de l'enregistrement du trajet.");
    } finally {
      setLoading(false);
    }
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

  if (loading && step === "SELECT_USER") return <div className="kiosk-container">Chargement...</div>;

  return (
    <div className="kiosk-container">
      <div className="kiosk-card">
        <div className="kiosk-header">
          <h1>{org?.nom}</h1>
          <p>Kiosque Kilométrage</p>
        </div>

        {error && <div style={{color: '#ef4444', marginBottom: '15px', fontWeight: 'bold'}}>{error}</div>}
        {successMsg && <div style={{color: '#10b981', marginBottom: '15px', fontWeight: 'bold'}}>{successMsg}</div>}

        {step === "SELECT_USER" && (
          <div>
            <h3>Qui êtes-vous ?</h3>
            <select 
              className="kiosk-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Sélectionnez votre nom --</option>
              {employes.map(e => (
                <option key={e.id} value={e.id}>{e.nom}</option>
              ))}
            </select>
            <button 
              className="kiosk-btn btn-primary"
              disabled={!selectedUserId}
              onClick={() => { setError(null); setSuccessMsg(null); setStep("PIN_PAD"); }}
            >
              Suivant
            </button>
          </div>
        )}

        {step === "PIN_PAD" && (
          <div>
            <h3>Entrez votre NIP</h3>
            <div style={{fontSize: '2rem', letterSpacing: '10px', marginBottom: '20px', minHeight: '40px'}}>
              {pin.replace(/./g, '•')}
            </div>
            
            <div className="kiosk-pinpad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button key={num} className="pin-btn" onClick={() => handlePinClick(num.toString())}>
                  {num}
                </button>
              ))}
              <button className="pin-btn action" onClick={() => setStep("SELECT_USER")}>Retour</button>
              <button className="pin-btn" onClick={() => handlePinClick("0")}>0</button>
              <button className="pin-btn action" onClick={() => setPin(pin.slice(0, -1))}>Effacer</button>
            </div>
            
            {loading && <p>Vérification...</p>}
          </div>
        )}

        {step === "TRACKER" && (
          <div>
            <div className="clock-display" style={{ marginBottom: '20px' }}>
              <div className={`status-badge ${isTracking ? 'active' : 'idle'}`}>
                {isTracking ? "TRAJET EN COURS" : "EN ATTENTE"}
              </div>
              <div className="time-huge" style={{ fontSize: '2.5rem' }}>
                {distance.toFixed(2)} km
              </div>
              {isTracking && <div style={{ fontSize: '1.2rem', marginTop: '10px' }}>{elapsedTime}</div>}
            </div>

            {!isTracking ? (
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Projet</label>
                <select 
                  name="projet_id"
                  className="kiosk-select"
                  value={formData.projet_id}
                  onChange={handleInputChange}
                  style={{ marginBottom: '15px' }}
                >
                  <option value="">-- Choisir un projet --</option>
                  {projets.map(p => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Taux ($/km)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      name="rate_per_unit"
                      className="kiosk-input"
                      value={formData.rate_per_unit}
                      onChange={handleInputChange}
                      style={{ marginBottom: 0, padding: '10px' }}
                    />
                  </div>
                </div>

                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description (Optionnel)</label>
                <input 
                  type="text" 
                  name="description"
                  className="kiosk-input"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Ex: Client XYZ"
                  style={{ padding: '10px' }}
                />

                <button 
                  className="kiosk-btn btn-success"
                  onClick={startTracking}
                  disabled={loading}
                  style={{ marginTop: '10px' }}
                >
                  {loading ? "..." : "DÉMARRER TRAJET"}
                </button>
              </div>
            ) : (
              <div>
                <button 
                  className="kiosk-btn btn-danger"
                  onClick={() => stopTrackingAndSave(false)}
                  disabled={loading}
                >
                  {loading ? "..." : "ARRIVÉ (ARRÊTER)"}
                </button>
              </div>
            )}
            
            <div style={{marginTop: '20px'}}>
              <button className="kiosk-btn btn-secondary" onClick={() => resetKiosk(false)}>
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
