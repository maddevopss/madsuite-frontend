import { useState } from "react";

import "../../styles/reports.css";

import ReportsHeader from "./ReportsHeader";
import ReportsTable from "./ReportsTable";
import PreviewTable from "./PreviewTable";
import AnalyticsView from "./AnalyticsView";

import { useReports } from "../../hooks/useReports";
import { exportReportsCSV, exportReportsPDF } from "../../utils/reportsExcel.utils";
import { Button } from "../../components/ui";
import { useAuth } from "../../api/authContext";

export default function Reports() {
  const {
    period,
    setPeriod,
    groupBy,
    setGroupBy,
    isBilled,
    setIsBilled,
    rows = [],
    total = {},
    timeEntries = [],
    activityLogs = [],
    windowsLogs = [],
    loadDebugTables,
  } = useReports();

  const [activeTab, setActiveTab] = useState("analytics"); // 'analytics' | 'table'
  const [showTimeEntriesPreview, setShowTimeEntriesPreview] = useState(false);
  const [showActivityLogsPreview, setShowActivityLogsPreview] = useState(false);
  const [showWindowsLogsPreview, setShowWindowsLogsPreview] = useState(false);

  const togglePreview = async (setter) => {
    await loadDebugTables();
    setter((prev) => !prev);
  };

  const { user } = useAuth();

  const handleExportPDF = async () => {
    await exportReportsPDF(rows, total, period, groupBy, user?.nom);
  };

  return (
    <div className="reports-page">
      <ReportsHeader
        period={period}
        setPeriod={setPeriod}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        isBilled={isBilled}
        setIsBilled={setIsBilled}
        onExportCSV={() => exportReportsCSV(rows, period, groupBy, user?.nom)}
        onExportPDF={handleExportPDF}
        onToggleTimeEntries={() => togglePreview(setShowTimeEntriesPreview)}
        onToggleActivityLogs={() => togglePreview(setShowActivityLogsPreview)}
        onToggleWindowsLogs={() => togglePreview(setShowWindowsLogsPreview)}
      />

      <div className="reports-tabs">
        <Button 
          variant={activeTab === "analytics" ? "primary" : "secondary"} 
          onClick={() => setActiveTab("analytics")}
        >
          Tableau de bord Analytique
        </Button>
        <Button 
          variant={activeTab === "table" ? "primary" : "secondary"} 
          onClick={() => setActiveTab("table")}
        >
          Tableau des Données
        </Button>
      </div>

      <div className="reports-content">
        {activeTab === "analytics" ? (
          <AnalyticsView rows={rows} total={total} />
        ) : (
          <ReportsTable rows={rows} total={total} groupBy={groupBy} />
        )}
      </div>

      {showTimeEntriesPreview && <PreviewTable title="time_entries.head(10)" data={timeEntries} />}

      {showActivityLogsPreview && <PreviewTable title="activity_logs.head(10)" data={activityLogs} />}

      {showWindowsLogsPreview && <PreviewTable title="windows_logs.head(10)" data={windowsLogs} />}
    </div>
  );
}
