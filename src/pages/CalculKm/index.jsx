import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getProjets } from "../../api/projets.api";
import { createExpense } from "../../api/expenses.api";
import { useToast } from "../../ToastContext";
import { useGpsTracker } from "./useGpsTracker";
import "./calculKm.css";
import { AiOutlineLeft, AiOutlineCar } from "../../assets/Icon/idx_icon";

export default function CalculKm() {
  const { showToast } = useToast();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAutoStop = useCallback(() => {
    stopTrackingAndSave(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    isTracking,
    distance,
    elapsedTime,
    formData,
    updateFormData,
    startTracking,
    stopTracking,
    setDistance,
    setFormData
  } = useGpsTracker(handleAutoStop);

  useEffect(() => {
    fetchProjects();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  const stopTrackingAndSave = async (isAuto = false) => {
    const finalDistance = stopTracking();

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
