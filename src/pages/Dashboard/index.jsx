import "../../styles/dashboard.css";

import { Loader } from "../../components/ui";

import { useDashboard } from "../../hooks/useDashboard";

import DashboardActiveTimer from "./DashboardActiveTimer";
import DashboardMetrics from "./DashboardMetrics";
import DashboardClientTime from "./DashboardClientTime";
import DashboardCharts from "./DashboardCharts";
import DashboardActivityIntelligence from "./DashboardActivityIntelligence";
import ActivitySummary from "../../components/activity/ActivitySummary";
import PurgeNotification from "../../components/PurgeNotification";
import BillingDashboardCockpit from "./BillingDashboardCockpit";

export default function Dashboard() {
  const { stats, loading, parClient, maxHeures, chartData } = useDashboard();

  return (
    <div className="dashboard-page">
      <h1>Bienvenue sur le tableau de bord</h1>

      <div className="view active" id="view-dashboard">
        {loading ? (
          <Loader label="Chargement du tableau de bord..." variant="dashboard" />
        ) : (
          <>
            <PurgeNotification />

            <DashboardMetrics stats={stats} />

            <DashboardActiveTimer />

            <DashboardActivityIntelligence />

            <ActivitySummary />

            <BillingDashboardCockpit />

            <div className="two-col">
              <DashboardClientTime parClient={parClient} maxHeures={maxHeures} />

              <DashboardCharts chartData={chartData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
