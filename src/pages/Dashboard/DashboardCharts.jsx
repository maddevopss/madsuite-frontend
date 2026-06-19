import { memo, useMemo } from "react";
import { Card, EmptyState } from "../../components/ui";

import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

function DashboardCharts({ chartData = [] }) {
  const normalizedData = useMemo(
    () =>
      chartData.map((row) => ({
        ...row,
        jour: row.jour || "",
        heures: Number(row.heures || 0),
      })),
    [chartData],
  );

  if (normalizedData.length === 0) {
    return (
      <div className="dashboard-grid">
        <Card className="chart-card">
          <EmptyState message="Aucune donnée disponible." />
        </Card>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      <Card className="chart-card">
        <h3>Heures par jour</h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={normalizedData}>
            <XAxis dataKey="jour" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="heures" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="chart-card">
        <h3>Évolution des heures</h3>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={normalizedData}>
            <XAxis dataKey="jour" />

            <YAxis />

            <Tooltip />

            <Line type="monotone" dataKey="heures" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

export default memo(DashboardCharts);
