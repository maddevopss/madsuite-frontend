import { memo, useCallback, useEffect, useState } from "react";
import { Bar, BarChart, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import api from "../../api/api";
import { categorizeUnclassifiedAi } from "../../api/activity.api";
import { toast } from "react-toastify";
import "./activitySummary.css";

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultDateRange() {
  const end = new Date();
  const start = new Date(end);

  start.setDate(start.getDate() - 20);

  return {
    dateDebut: toDateInputValue(start),
    dateFin: toDateInputValue(end),
  };
}

function ActivitySummary() {
  const defaultRange = getDefaultDateRange();
  const [rows, setRows] = useState([]);
  const [categoryRows, setCategoryRows] = useState([]);
  const [dateDebut, setDateDebut] = useState(defaultRange.dateDebut);
  const [dateFin, setDateFin] = useState(defaultRange.dateFin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productivityScore, setProductivityScore] = useState(0);
  const [topDistractions, setTopDistractions] = useState([]);
  const [topProductive, setTopProductive] = useState([]);
  const [categorizingAi, setCategorizingAi] = useState(false);

  const handleCategorizeAi = async () => {
    setCategorizingAi(true);
    try {
      const res = await categorizeUnclassifiedAi();
      if (res.success) {
        toast.success(`Catégorisation IA terminée : ${res.data?.categorized?.length || 0} activités classées.`);
        loadActivitySummary();
      }
    } catch (err) {
      toast.error(err.response?.data?.errors?.message || "Erreur lors de la catégorisation IA.");
    } finally {
      setCategorizingAi(false);
    }
  };

  const loadActivitySummary = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/activity/summary", {
        params: {
          date_debut: dateDebut,
          date_fin: dateFin,
        },
      });

      const data = Array.isArray(res?.data) ? res.data : [];

      const formatted = data.map((item) => ({
        name: item.app_name || "Inconnu",
        category: item.category || "neutre",
        heures: Number(item.total_seconds || 0) / 3600,
      }));

      const sortedFormatted = [...formatted].sort((a, b) => b.heures - a.heures);
      let displayRows = sortedFormatted;
      
      if (sortedFormatted.length > 15) {
        const top15 = sortedFormatted.slice(0, 15);
        const others = sortedFormatted.slice(15);
        const othersHeures = others.reduce((acc, curr) => acc + curr.heures, 0);
        displayRows = [...top15, { name: "Autres", category: "neutre", heures: othersHeures }];
      }

      const totalsByCategory = formatted.reduce(
        (acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + item.heures;
          return acc;
        },
        {
          productif: 0,
          neutre: 0,
          distraction: 0,
        },
      );

      const totalHours = totalsByCategory.productif + totalsByCategory.neutre + totalsByCategory.distraction;

      const score = totalHours > 0 ? (totalsByCategory.productif / totalHours) * 100 : 0;

      setProductivityScore(score);
      setRows(displayRows);

      setCategoryRows([
        { name: "Focus", heures: totalsByCategory.productif },
        { name: "Neutre", heures: totalsByCategory.neutre },
        { name: "Exploration", heures: totalsByCategory.distraction },
      ]);

      const distractions = formatted
        .filter((item) => item.category === "distraction")
        .sort((a, b) => b.heures - a.heures)
        .slice(0, 5);

      setTopDistractions(distractions);

      const productiveApps = formatted
        .filter((item) => item.category === "productif")
        .sort((a, b) => b.heures - a.heures)
        .slice(0, 5);

      setTopProductive(productiveApps);
    } catch (err) {
      if (err.response?.status === 429) {
        console.warn("Activity summary rate limited.");
        return;
      }
      console.error("Erreur chargement activity summary:", err);
      setError("Impossible de charger le résumé d'activité.");
      setRows([]);
      setCategoryRows([]);
      setTopDistractions([]);
      setTopProductive([]);
      setProductivityScore(0);
    } finally {
      setLoading(false);
    }
  }, [dateDebut, dateFin]);

  useEffect(() => {
    loadActivitySummary();
  }, [loadActivitySummary]);

  return (
    <div className="card activity-summary-card">
      <div className="card-title">Résumé d'activité</div>

      <div className="filters">
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />

        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />

        <button type="button" onClick={loadActivitySummary} disabled={loading || categorizingAi}>
          {loading ? "Chargement..." : "Filtrer"}
        </button>

        <button type="button" onClick={handleCategorizeAi} disabled={loading || categorizingAi} className="btn-ai-categorize" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', cursor: 'pointer', marginLeft: 'auto' }}>
          ✨ {categorizingAi ? "Catégorisation..." : "Catégoriser avec l'IA"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {!loading && rows.length === 0 && !error && <p>Aucune activité trouvée pour cette période.</p>}

      {topProductive.length > 0 && (
        <div className="top-productive">
          <h3>Top Sessions de Focus</h3>

          {topProductive.map((item) => (
            <div className="top-productive-row" key={`productive-${item.name}`}>
              <span>{item.name}</span>
              <strong>{item.heures.toFixed(2)} h</strong>
            </div>
          ))}
        </div>
      )}

      {topDistractions.length > 0 && (
        <div className="top-distractions">
          <h3>Exploration Libre</h3>

          {topDistractions.map((item) => (
            <div className="top-distraction-row" key={`distraction-${item.name}`}>
              <span>{item.name}</span>
              <strong>{item.heures.toFixed(2)} h</strong>
            </div>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <div className="productivity-score">
          <span>Score de Focus</span>
          <strong>{productivityScore.toFixed(0)}%</strong>
        </div>
      )}

      {categoryRows.length > 0 && (
        <div className="activity-kpi-grid">
          {categoryRows.map((row) => (
            <div className="activity-kpi-card" key={row.name}>
              <span>{row.name}</span>
              <strong>{row.heures.toFixed(2)} h</strong>
            </div>
          ))}
        </div>
      )}

      {categoryRows.length > 0 && (
        <>
          <h3>Temps par catégorie</h3>

          <div className="activity-chart-wrapper activity-chart-wrapper-small" style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryRows}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)} h`} />
                <Bar dataKey="heures" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {rows.length > 0 && (
        <>
          <h3>Temps par application</h3>

          <div className="activity-chart-wrapper activity-chart-wrapper-large" style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)} h`} />
                <Bar dataKey="heures" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(ActivitySummary);
