import { useState, useEffect } from "react";
import "../../styles/dashboard.css";

import { Loader } from "../../components/ui";
import { ResponsiveLineChart } from "../../components/charts/ResponsiveLineChart";

import { useDashboard } from "../../hooks/useDashboard";
import { useMonthlyData } from "../../hooks/useReportData";

import DashboardActiveTimer from "./DashboardActiveTimer";
import DashboardMetrics from "./DashboardMetrics";
import DashboardClientTime from "./DashboardClientTime";
import DashboardCharts from "./DashboardCharts";
import DashboardActivityIntelligence from "./DashboardActivityIntelligence";
import ActivitySummary from "../../components/activity/ActivitySummary";
import PurgeNotification from "../../components/PurgeNotification";
import BillingDashboardCockpit from "./BillingDashboardCockpit";
import RescueModal from "./RescueModal";
import BrainDumpInput from "./BrainDumpInput";
import RecoveryModal from "./RecoveryModal";
import DopamineLog from "./DopamineLog";
import RealitySplitBar from "./RealitySplitBar";

export default function Dashboard() {

  // Main dashboard data (local state + timers)
  const { stats, loading, parClient, maxHeures, chartData } = useDashboard();

  // Monthly data with caching (from React Query)
  const { data, isLoading: monthlyLoading, error: monthlyError } = useMonthlyData(new Date().getFullYear());

  // Zen Mode
  const [zenMode, setZenMode] = useState(false);
  // Rescue & Recovery
  const [showRescue, setShowRescue] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("zenMode");
    if (saved === "true") setZenMode(true);
  }, []);
  const toggleZenMode = () => {
    const newZen = !zenMode;
    setZenMode(newZen);
    localStorage.setItem("zenMode", String(newZen));
  };

  // Show loading state if either hook is loading
  const isLoading = loading || monthlyLoading;
  const hasError = monthlyError;

  if (isLoading) {
    return <Loader label="Chargement du tableau de bord..." variant="dashboard" />;
  }

  if (hasError) {
    return (
      <div className="dashboard-page">
        <h1>Bienvenue sur le tableau de bord</h1>
        <div className="error-message">Erreur lors du chargement des données: {monthlyError.message}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Bienvenue sur le tableau de bord</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setShowRecovery(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid var(--color-primary)',
              background: 'transparent',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
            }}
          >
            🔄 Je reviens
          </button>
          <button 
            onClick={() => setShowRescue(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: 'var(--color-danger)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            🛟 Je suis éparpillé
          </button>
          <button 
            onClick={toggleZenMode}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid var(--color-border)',
            background: zenMode ? 'var(--color-primary)' : 'var(--color-surface)',
            color: zenMode ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold'
          }}
        >
          {zenMode ? '🧘‍♂️ Quitter le Mode Zen' : '🧘‍♂️ Mode Zen'}
        </button>
        </div>
      </div>

      <RescueModal show={showRescue} onClose={() => setShowRescue(false)} />
      <RecoveryModal show={showRecovery} onClose={() => setShowRecovery(false)} />

      <div className="view active" id="view-dashboard">
        {loading ? (
          <Loader label="Chargement du tableau de bord..." variant="dashboard" />
        ) : (
          <>
            <PurgeNotification />
            <div className="dashboard-content">
              {!zenMode && <RealitySplitBar chartData={chartData} />}
            {!zenMode && <DashboardMetrics stats={stats} />}
            </div>

            <div className="dashboard-sidebar">
              <DopamineLog />
              <BrainDumpInput />
              <DashboardActivityIntelligence />
              <ActivitySummary />
            </div>

            <DashboardActiveTimer />

            {!zenMode && (
              <>
                <BillingDashboardCockpit />

                <div className="two-col">
                  <DashboardClientTime parClient={parClient} maxHeures={maxHeures} />
                  <DashboardCharts chartData={chartData} />
                </div>

                <div className="monthly-chart-section">
                  <h2>Données mensuelles</h2>
                  {data?.monthly && data.monthly.length > 0 ? (
                    <>
                      <ResponsiveLineChart data={data.monthly} />
                      <p className="text-sm text-gray-500">
                        📊 Données {data._cached ? "en cache" : "fraîches"}
                        {data._cacheAge && ` (${data._cacheAge})`}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400">Aucune donnée disponible pour ce mois</p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
