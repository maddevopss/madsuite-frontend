import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getProjets } from "../../api/projets.api";
import { createExpense } from "../../api/expenses.api";
import { useToast } from "../../ToastContext";
import "./calculKm.css";
import { AiOutlineLeft, AiOutlineCar } from "../../assets/Icon/idx_icon";

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
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
  const d = R * c;
  return d;
}

const AUTO_STOP_MINUTES = 10;
const MIN_DISTANCE_KM = 0.05; // 50 mètres pour éviter les sauts GPS

export default function CalculKm() {
  const { showToast } = useToast();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(false);

  // States du Tracker
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

  useEffect(() => {
    fetchProjects();
    loadStateFromStorage();

    // Boucle de vérification d'inactivité (toutes les minutes)
    const intervalId = setInterval(() => {
      checkAutoStop();
    }, 60000);

    return () => {
      clearInterval(intervalId);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await getProjets();
      setProjets(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error(err);
      showToast("Erreur lors du chargement des projets", "error");
    }
  };

  const loadStateFromStorage = () => {
    const savedState = localStorage.getItem("calculKmState");
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed.isTracking) {
        setIsTracking(true);
        distanceRef.current = parsed.distance || 0;
        setDistance(parsed.distance || 0);
        lastPosRef.current = parsed.lastPos || null;
        lastMovedTimeRef.current = parsed.lastMovedTime || Date.now();
        startTimeRef.current = parsed.startTime || Date.now();
        setFormData(parsed.formData || formData);
        
        // Reprendre le tracking
        startGpsWatch();

        // Vérifier si ça fait plus de 10 min qu'on n'a pas bougé
        checkAutoStop();
      }
    }
  };

  const saveStateToStorage = () => {
    localStorage.setItem(
      "calculKmState",
      JSON.stringify({
        isTracking: true,
        distance: distanceRef.current,
        lastPos: lastPosRef.current,
        lastMovedTime: lastMovedTimeRef.current,
        startTime: startTimeRef.current,
        formData: formData,
      })
    );
  };

  const clearStateStorage = () => {
    localStorage.removeItem("calculKmState");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (isTracking) {
        localStorage.setItem("calculKmState", JSON.stringify({
          ...JSON.parse(localStorage.getItem("calculKmState") || "{}"),
          formData: newState
        }));
      }
      return newState;
    });
  };

  const startTracking = () => {
    if (!formData.projet_id) {
      showToast("Veuillez sélectionner un projet avant de démarrer.", "warning");
      return;
    }

    if (!navigator.geolocation) {
      showToast("La géolocalisation n'est pas supportée par votre navigateur.", "error");
      return;
    }

    // Initialize state
    distanceRef.current = 0;
    setDistance(0);
    lastPosRef.current = null;
    lastMovedTimeRef.current = Date.now();
    startTimeRef.current = Date.now();
    setIsTracking(true);

    saveStateToStorage();
    startGpsWatch();
    showToast("Suivi GPS démarré.", "success");
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
          // Premier point
          lastPosRef.current = { lat: currentLat, lng: currentLng };
          lastMovedTimeRef.current = Date.now();
          saveStateToStorage();
        }
      },
      (error) => {
        console.warn("Erreur GPS :", error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );
  };

  const checkAutoStop = () => {
    if (!isTracking) return;
    const now = Date.now();
    const minutesSinceLastMove = (now - lastMovedTimeRef.current) / 1000 / 60;
    
    if (minutesSinceLastMove >= AUTO_STOP_MINUTES) {
      console.log(`Auto-stop déclenché après ${AUTO_STOP_MINUTES} minutes sans mouvement.`);
      stopTrackingAndSave(true);
    }
  };

  const stopTrackingAndSave = async (isAuto = false) => {
    setIsTracking(false);
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    
    const finalDistance = distanceRef.current;
    clearStateStorage();

    if (finalDistance < 0.1) {
      if (!isAuto) showToast("Trajet trop court (< 100m). Non enregistré.", "warning");
      return;
    }

    setLoading(true);
    try {
      const finalAmount = parseFloat((finalDistance * parseFloat(formData.rate_per_unit)).toFixed(2));
      await createExpense({
        projet_id: parseInt(formData.projet_id, 10),
        category: "mileage",
        amount: finalAmount,
        total_amount: finalAmount,
        distance: parseFloat(finalDistance.toFixed(2)),
        rate_per_unit: parseFloat(formData.rate_per_unit),
        description: formData.description || (isAuto ? "Déplacement (Auto-stop)" : "Déplacement"),
        expense_date: formData.expense_date,
      });

      showToast(`Trajet de ${finalDistance.toFixed(2)} km enregistré !`, "success");
      setDistance(0);
      setFormData((prev) => ({ ...prev, description: "" }));
    } catch (err) {
      showToast("Erreur lors de l'enregistrement", "error");
    } finally {
      setLoading(false);
    }
  };

  // Timer rendering
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

  const calculateTotalPreview = () => {
    return (distance * parseFloat(formData.rate_per_unit)).toFixed(2);
  };

  return (
    <div className="calcul-km-container">
      <header className="mobile-header">
        <Link to="/dashboard" className="back-btn">
          <AiOutlineLeft size={24} />
        </Link>
        <h1>Carnet de route</h1>
        <div style={{ width: 24 }}></div>
      </header>

      <main className="calcul-km-main">
        <div className="km-hero">
          <div className="car-icon-wrapper">
            <AiOutlineCar size={48} />
          </div>
          <h2>Tracker GPS</h2>
          <p>Le système enregistre automatiquement après 10min d'arrêt.</p>
        </div>

        <div className="km-form">
          <div className="form-group">
            <label>Projet *</label>
            <select 
              name="projet_id" 
              value={formData.projet_id} 
              onChange={handleInputChange}
              className="km-input"
              required
              disabled={isTracking}
            >
              <option value="">-- Choisir un projet --</option>
              {projets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} ({p.client_nom})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-row">
            <div className="form-group flex-2">
              <label>Distance (km)</label>
              <div className="km-input large-number" style={{backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center'}}>
                {distance.toFixed(2)}
              </div>
            </div>
            <div className="form-group flex-1">
              <label>Taux ($/km)</label>
              <input 
                type="number" 
                step="0.01" 
                name="rate_per_unit" 
                value={formData.rate_per_unit} 
                onChange={handleInputChange}
                className="km-input"
                required
                disabled={isTracking}
              />
            </div>
          </div>

          <div className="total-preview" style={{ marginBottom: isTracking ? '20px' : '0' }}>
            <span>Montant estimé :</span>
            <span className="total-amount">{calculateTotalPreview()} $</span>
          </div>

          {isTracking && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '5px' }}>EN COURS</div>
              <div style={{ fontSize: '2rem', fontVariantNumeric: 'tabular-nums' }}>{elapsedTime}</div>
            </div>
          )}

          {!isTracking ? (
            <>
              <div className="form-group">
                <label>Description (Optionnel)</label>
                <input 
                  type="text" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange}
                  className="km-input"
                  placeholder="Ex: MTL vers Rive-Sud"
                />
              </div>

              <button 
                type="button" 
                className="huge-btn km-submit-btn" 
                onClick={startTracking}
                disabled={loading}
              >
                {loading ? "Chargement..." : "DÉMARRER LE TRAJET"}
              </button>
            </>
          ) : (
            <button 
              type="button" 
              className="huge-btn km-submit-btn" 
              style={{ backgroundColor: '#ef4444' }}
              onClick={() => stopTrackingAndSave(false)}
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "ARRIVÉ (ARRÊTER)"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
