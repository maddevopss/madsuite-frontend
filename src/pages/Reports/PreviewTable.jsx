import { Card, EmptyState } from "../../components/ui";

export default function PreviewTable({ title, data = [] }) {
  if (data.length === 0) {
    return (
      <Card className="preview-card" style={{ marginTop: 20 }}>
        <div className="card-title">{title}</div>

        <EmptyState message="Aucune donnée." />
      </Card>
    );
  }

  const columns = Object.keys(data[0] || {});

  return (
    <Card className="preview-card" style={{ marginTop: 20 }}>
      <div className="card-title">{title}</div>

      <div
        className="preview-table-wrapper"
        style={{
          overflowX: "auto",
          fontSize: "12px",
        }}>
        <table className="report-table">
          <thead>
            <tr>
              {columns.map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.slice(0, 10).map((row, i) => (
              <tr key={row.id || i}>
                {columns.map((key) => (
                  <td key={key}>{typeof row[key] === "object" ? JSON.stringify(row[key]) : String(row[key] ?? "—")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
