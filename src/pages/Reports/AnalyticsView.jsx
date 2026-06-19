import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, EmptyState } from "../../components/ui";
import { formatMoney } from "../../utils/formatters";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1"];

export default function AnalyticsView({ rows = [], total = {} }) {
  // Transformation des données pour les graphiques
  const clientData = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      const clientName = r.client || "Inconnu";
      const amount = Number(r.montant_estime || 0);
      const billed = Number(r.montant_facture || 0);
      if (!map.has(clientName)) {
        map.set(clientName, { name: clientName, value: 0, billed: 0 });
      }
      map.get(clientName).value += amount;
      map.get(clientName).billed += billed;
    });
    return Array.from(map.values())
      .filter((d) => d.value > 0 || d.billed > 0)
      .sort((a, b) => b.value - a.value); // Sort par revenu estimé
  }, [rows]);

  const heuresFacturables = Number(total.heures_facturables || 0);
  const heuresNonFacturables = Math.max(0, Number(total.heures || 0) - heuresFacturables);

  const pieData = [
    { name: "Facturable", value: heuresFacturables, color: "#10b981" },
    { name: "Non facturable", value: heuresNonFacturables, color: "#94a3b8" },
  ].filter(d => d.value > 0);

  const totalEstime = Number(total.montant_estime || 0);
  const totalFacture = Number(total.montant_facture || 0);
  const nonFacture = Math.max(0, totalEstime - totalFacture);
  
  const utilisationRate = total.heures > 0 
    ? ((heuresFacturables / total.heures) * 100).toFixed(1) 
    : 0;

  if (rows.length === 0) {
    return (
      <div className="analytics-empty">
        <EmptyState message="Aucune donnée à analyser pour cette période." />
      </div>
    );
  }

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="analytics-tooltip">
          <p className="tooltip-label">{payload[0].payload.name}</p>
          <p className="tooltip-value">Montant généré : {formatMoney(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const renderPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="analytics-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">{Number(payload[0].value).toFixed(1)} heures</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-kpi-grid">
        <Card className="analytics-kpi-card highlight">
          <div className="kpi-label">Revenus Projetés</div>
          <div className="kpi-value">{formatMoney(totalEstime)}</div>
          <div className="kpi-sub">Total du travail accompli</div>
        </Card>
        
        <Card className="analytics-kpi-card warning">
          <div className="kpi-label">Reste à Facturer</div>
          <div className="kpi-value">{formatMoney(nonFacture)}</div>
          <div className="kpi-sub">Potentiel de facturation latent</div>
        </Card>

        <Card className="analytics-kpi-card">
          <div className="kpi-label">Taux d'utilisation</div>
          <div className="kpi-value">{utilisationRate}%</div>
          <div className="kpi-sub">Ratio d'heures facturables</div>
        </Card>
        
        <Card className="analytics-kpi-card default">
          <div className="kpi-label">Heures totales</div>
          <div className="kpi-value">{Number(total.heures || 0).toFixed(1)}h</div>
          <div className="kpi-sub">Investissement temps</div>
        </Card>
      </div>

      <div className="analytics-charts-grid">
        <Card className="analytics-chart-card">
          <h3>Répartition des revenus par Client</h3>
          {clientData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clientData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${value} $`} tick={{ fontSize: 12 }} />
                <Tooltip content={renderCustomTooltip} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {clientData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <EmptyState message="Pas de revenus associés" />
          )}
        </Card>

        <Card className="analytics-chart-card">
          <h3>Ratio Facturable vs Non Facturable</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={renderPieTooltip} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Pas d'heures enregistrées" />
          )}
        </Card>
      </div>
    </div>
  );
}
