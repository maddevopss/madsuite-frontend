import { render, screen } from "@testing-library/react";
import Dashboard from "../pages/Dashboard";
import { useDashboard } from "../hooks/useDashboard";

jest.mock("../hooks/useDashboard");

jest.mock("../hooks/useReportData", () => ({
  useMonthlyData: jest.fn().mockReturnValue({ data: null, isLoading: false, error: null }),
}));

jest.mock("../pages/Dashboard/DashboardMetrics", () => (props) => (
  <div>
    <h2>Metrics</h2>
    <span data-testid="semaine">{props.stats.semaine}</span>
  </div>
));

jest.mock("../pages/Dashboard/DashboardCharts", () => () => (
  <div>
    <h2>Charts</h2>
  </div>
));

jest.mock("../pages/Dashboard/DashboardClientTime", () => () => (
  <div>
    <h2>Clients</h2>
  </div>
));

jest.mock("../pages/Dashboard/DashboardActiveTimer", () => () => (
  <div>
    <h2>Timer actif</h2>
  </div>
));

jest.mock("../pages/Dashboard/DashboardActivityIntelligence", () => () => (
  <div>
    <h2>Activité</h2>
  </div>
));

jest.mock("../components/activity/ActivitySummary", () => () => (
  <div>
    <h2>Résumé activité</h2>
  </div>
));

jest.mock("../pages/Dashboard/BillingDashboardCockpit", () => () => (
  <div>
    <h2>Facturation</h2>
  </div>
));

beforeEach(() => {
  jest.clearAllMocks();

  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});

  useDashboard.mockReturnValue({
    stats: {
      semaine: 10,
      mois: 40,
      facturable: 8,
      montant_a_facturer: 600,
    },

    loading: false,

    parClient: [
      {
        client: "Client Test",
        heures: 5,
      },
    ],

    parJour: [
      {
        jour: "2026-05-20",
        heures: 2.5,
      },
    ],

    maxHeures: 5,

    chartData: [
      {
        jour: "mer.",
        heures: 2.5,
      },
    ],

    activitySummary: [
      {
        app_name: "VSCode",
        duration_seconds: 3600,
      },
    ],

    fetchStats: jest.fn(),
  });
});

afterEach(() => {
  console.warn.mockRestore();
  console.error.mockRestore();
});

describe("Dashboard page", () => {
  test("affiche dashboard", () => {
    render(<Dashboard />);

    expect(screen.getByText("Bienvenue sur le tableau de bord")).toBeInTheDocument();

    expect(screen.getByText("Metrics")).toBeInTheDocument();

    expect(screen.getByText("Timer actif")).toBeInTheDocument();

    expect(screen.getByText("Activité")).toBeInTheDocument();

    expect(screen.getByText("Résumé activité")).toBeInTheDocument();
  });

  test("transmet statistiques", () => {
    render(<Dashboard />);

    expect(screen.getByTestId("semaine").textContent).toBe("10");
  });
});
