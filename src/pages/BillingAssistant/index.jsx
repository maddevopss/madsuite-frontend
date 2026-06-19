import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { billingAssistantApi } from "../../api/billingAssistant";
import "./BillingAssistant.css";

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function getSuggestionKey(item) {
  if (item?.suggestion?.id != null) return `sugg_${item.suggestion.id}`;
  const base = [item?.app_name, item?.window_title, item?.total_seconds, item?.suggestion?.nom]
    .map((v) => (v == null ? "" : String(v)))
    .join("|");
  return `fallback_${base}`;
}

const SuggestionCard = memo(function SuggestionCard({ item, onApply, canApply }) {
  return (
    <div className="suggestion-card">
      <div className="suggestion-info">
        <span className="app-tag">{item.app_name}</span>
        <h3>{item.window_title}</h3>
        <p className="duration">Durée détectée : {formatDuration(item.total_seconds)}</p>
      </div>

      <div className="suggestion-action">
        {item.suggestion ? (
          <div className="project-badge">
            🚀 Projet suggéré : <strong>{item.suggestion.nom}</strong>
            <span className="confidence">({item.suggestion.confidence}%)</span>
          </div>
        ) : (
          <span className="no-suggestion">Projet inconnu</span>
        )}

        <button className="btn-primary" onClick={() => onApply(item)} disabled={!canApply}>
          Valider et Facturer
        </button>
      </div>
    </div>
  );
});

const BillingAssistant = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const requestSeqRef = useRef(0);

  const fetchSuggestions = useCallback(async () => {
    const requestSeq = ++requestSeqRef.current;
    setLoading(true);
    try {
      const data = await billingAssistantApi.getSuggestions(date);
      if (requestSeq !== requestSeqRef.current) return;
      setSuggestions(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      if (requestSeq !== requestSeqRef.current) return;
      setMessage({ type: "error", text: "Erreur lors du chargement des suggestions." });
    } finally {
      if (requestSeq !== requestSeqRef.current) return;
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleApply = useCallback(
    async (item) => {
      const suggestionId = item?.suggestion?.id;
      if (suggestionId == null) {
        alert("Veuillez assigner un projet manuellement (feature à venir).");
        return;
      }

      try {
        await billingAssistantApi.applySuggestion({
          projet_id: suggestionId,
          app_name: item.app_name,
          window_title: item.window_title,
          total_seconds: item.total_seconds,
          date,
        });

        setSuggestions((prev) =>
          prev.filter((s) => {
            const prevId = s?.suggestion?.id;
            if (prevId != null) return prevId !== suggestionId;
            return getSuggestionKey(s) !== getSuggestionKey(item);
          }),
        );
        setMessage({ type: "success", text: "Entrée de temps ajoutée avec succès !" });
      } catch (err) {
        setMessage({ type: "error", text: "Erreur lors de l'ajout." });
      }
    },
    [date],
  );

  return (
    <div className="billing-assistant-container">
      <header className="page-header">
        <h1>Assistant de Facturation</h1>
        <div className="date-picker">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </header>

      {message && (
        <div className={`alert ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      {loading ? (
        <div className="loader">Analyse de votre activité en cours...</div>
      ) : (
        <div className="suggestions-list">
          {suggestions.length === 0 ? (
            <p className="empty-state">Aucune activité notable détectée pour cette journée.</p>
          ) : (
            suggestions.map((item) => (
              <SuggestionCard
                key={getSuggestionKey(item)}
                item={item}
                onApply={handleApply}
                canApply={Boolean(item.suggestion)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BillingAssistant;
