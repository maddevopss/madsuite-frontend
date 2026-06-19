import React from "react";
import "./actChart.module.css";

function ActivityChart({ svgPoints, svgFill, jours }) {
  const yLabels = [8, 6, 4, 2];

  const width = 260;
  const height = 100;

  const paddingTop = 10;
  const paddingBottom = 20;

  const chartHeight = height - paddingTop - paddingBottom;

  const maxHours = 8;

  return (
    <div className="card">
      <div className="card-title">Activité des 7 derniers jours</div>

      <svg viewBox={`0 0 ${width} ${height}`} width="100%">
        <polygon points={svgFill} fill="url(#g)" />
        {yLabels.map((h) => {
          const y = paddingTop + chartHeight - (h / maxHours) * chartHeight;

          return (
            <React.Fragment key={h}>
              <line x1="25" x2="250" y1={y} y2={y} />
              <text x="6.5" y={y + 3}>
                {h}h
              </text>
            </React.Fragment>
          );
        })}

        <polyline points={svgPoints} />

        {jours.map((j, i) => (
          <text key={j + i} x={18 + i * 37} y="100">
            {j}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default ActivityChart;
