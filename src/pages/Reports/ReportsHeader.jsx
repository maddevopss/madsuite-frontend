import { Button, Select } from "../../components/ui";

export default function ReportsHeader({
  period,
  setPeriod,
  groupBy,
  setGroupBy,
  isBilled,
  setIsBilled,
  onExportCSV,
  onExportPDF,
  onToggleTimeEntries,
  onToggleActivityLogs,
  onToggleWindowsLogs,
}) {
  return (
    <div className="reports-header">
      <div>
        <h1>Rapports</h1>

        <p className="page-subtitle">Consultez et exportez les données de suivi.</p>
      </div>

      <div className="reports-actions">
        <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="week">Cette semaine</option>

          <option value="month">Ce mois</option>

          <option value="year">Cette année</option>
        </Select>

        <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
          <option value="">Sans groupement</option>

          <option value="month">Par mois</option>

          <option value="week">Par semaine</option>
        </Select>

        <Select value={isBilled} onChange={(e) => setIsBilled(e.target.value)}>
          <option value="">Tous</option>

          <option value="true">Facturés</option>

          <option value="false">Non facturés</option>
        </Select>

        <Button type="button" variant="secondary" onClick={onExportCSV}>
          Export CSV
        </Button>

        <Button type="button" variant="secondary" onClick={onExportPDF}>
          Export PDF
        </Button>

        <Button type="button" variant="primary" onClick={onToggleTimeEntries}>
          time_entries
        </Button>

        <Button type="button" variant="primary" onClick={onToggleActivityLogs}>
          activity_logs
        </Button>

        <Button type="button" variant="primary" onClick={onToggleWindowsLogs}>
          windows_logs
        </Button>
      </div>
    </div>
  );
}
