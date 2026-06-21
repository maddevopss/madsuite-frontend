import React from "react";
import { useParams } from "react-router-dom";
import { useKioskTracker } from "../../hooks/useKioskTracker";
import "../Kiosk/Kiosk.css"; // Réutilisation des styles Kiosk

export default function KioskKm() {
  const { kioskToken } = useParams();
  const {
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
  } = useKioskTracker(kioskToken);

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
