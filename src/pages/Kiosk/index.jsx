import { useState } from "react";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./Kiosk.css";

export default function Kiosk() {
  const { kioskToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data
  const [org, setOrg] = useState(null);
  const [employes, setEmployes] = useState([]);
  const [projets, setProjets] = useState([]);
  
  // State Machine
  const [step, setStep] = useState("SELECT_USER"); // SELECT_USER, PIN_PAD, DASHBOARD
  const [selectedUserId, setSelectedUserId] = useState("");
  const [pin, setPin] = useState("");
  const [activeTimer, setActiveTimer] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [timerElapsed, setTimerElapsed] = useState("00:00:00");

  useEffect(() => {
    fetchKioskInfo();
  }, [kioskToken]);

  const fetchKioskInfo = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/punch/kiosk/${kioskToken}`);
      setOrg(res.data.organisation);
      setEmployes(res.data.employes);
      setProjets(res.data.projets);
      if (res.data.projets.length > 0) {
        setSelectedProjectId(res.data.projets[0].id);
      }
    } catch (err) {
      setError("Ce lien Kiosque est invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (currentPin) => {
    try {
      setLoading(true);
      const res = await api.post("/punch/status", {
        kiosk_token: kioskToken,
        utilisateur_id: selectedUserId,
        pin: currentPin
      });
      setActiveTimer(res.data.active_timer);
      setStep("DASHBOARD");
    } catch (err) {
      setError("NIP invalide. Veuillez réessayer.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = () => {
    if (pin.length !== 4) return;
    checkStatus(pin);
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

  const handlePunchIn = async () => {
    if (!selectedProjectId && projets.length > 0) {
      setError("Veuillez sélectionner un projet.");
      return;
    }
    try {
      setLoading(true);
      await api.post("/punch/in", {
        kiosk_token: kioskToken,
        utilisateur_id: selectedUserId,
        pin: pin,
        projet_id: selectedProjectId || null
      });
      resetKiosk();
    } catch (err) {
      setError("Erreur lors du Punch In.");
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    try {
      setLoading(true);
      await api.post("/punch/out", {
        kiosk_token: kioskToken,
        utilisateur_id: selectedUserId,
        pin: pin
      });
      resetKiosk();
    } catch (err) {
      setError("Erreur lors du Punch Out.");
      setLoading(false);
    }
  };

  const resetKiosk = () => {
    setStep("SELECT_USER");
    setSelectedUserId("");
    setPin("");
    setActiveTimer(null);
    setError(null);
    setLoading(false);
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (activeTimer) {
      const start = new Date(activeTimer.start_time).getTime();
      interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = now - start;
        const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
        setTimerElapsed(`${h}:${m}:${s}`);
      }, 1000);
    } else {
      setTimerElapsed("00:00:00");
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  if (loading && step === "SELECT_USER") return <div className="kiosk-container">Chargement...</div>;
  if (error && step === "SELECT_USER") return <div className="kiosk-container"><div className="kiosk-card"><p>{error}</p></div></div>;

  return (
    <div className="kiosk-container">
      <div className="kiosk-card">
        <div className="kiosk-header">
          <h1>{org?.nom}</h1>
          <p>Terminal de pointage</p>
        </div>

        {error && <div style={{color: 'red', marginBottom: '15px'}}>{error}</div>}

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
              onClick={() => { setError(null); setStep("PIN_PAD"); }}
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

        {step === "DASHBOARD" && (
          <div>
            <div className="clock-display">
              <div className={`status-badge ${activeTimer ? 'active' : 'idle'}`}>
                {activeTimer ? "EN COURS" : "HORS LIGNE"}
              </div>
              <div className="time-huge">{timerElapsed}</div>
            </div>

            {!activeTimer ? (
              <div>
                {projets.length > 0 && (
                  <select 
                    className="kiosk-select"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                  >
                    <option value="">-- Choisir un projet --</option>
                    {projets.map(p => (
                      <option key={p.id} value={p.id}>{p.nom}</option>
                    ))}
                  </select>
                )}
                <button 
                  className="kiosk-btn btn-success"
                  onClick={handlePunchIn}
                  disabled={loading}
                >
                  {loading ? "..." : "PUNCH IN"}
                </button>
              </div>
            ) : (
              <div>
                <button 
                  className="kiosk-btn btn-danger"
                  onClick={handlePunchOut}
                  disabled={loading}
                >
                  {loading ? "..." : "PUNCH OUT"}
                </button>
              </div>
            )}
            
            <div style={{marginTop: '20px'}}>
              <button className="kiosk-btn btn-secondary" onClick={resetKiosk}>
                Terminer / Autre employé
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
