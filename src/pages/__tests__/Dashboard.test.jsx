import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "../Dashboard";
import * as api from "../../api/api";

jest.mock("../../api/api");
jest.mock("../../hooks/useDashboard", () => ({
  useDashboard: () => ({
    stats: { semaine: 40, mois: 160, total: 1000 },
    clients: [{ id: 1, nom: "Client 1", heures: 20 }],
    loading: false,
    error: null,
  }),
}));

jest.mock("../../hooks/useReportData", () => ({
  useMonthlyData: jest.fn().mockReturnValue({ data: null, isLoading: false, error: null }),
}));

jest.mock("../../RefreshContext", () => ({
  useRefresh: () => ({
    refreshKey: 0,
    refreshAppData: jest.fn(),
  }),
}));

jest.mock("../../ToastContext", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

jest.mock("../Dashboard/DashboardMetrics", () => () => <div>Metrics Mock</div>);
jest.mock("../Dashboard/DashboardCharts", () => () => <div>Charts Mock</div>);
jest.mock("../Dashboard/DashboardActiveTimer", () => () => <div>Timer Mock</div>);
jest.mock("../Dashboard/DashboardActivityIntelligence", () => () => <div>Activity Mock</div>);
jest.mock("../Dashboard/DashboardClientTime", () => () => <div>ClientTime Mock</div>);
jest.mock("../../components/activity/ActivitySummary", () => () => <div>ActivitySummary Mock</div>);
jest.mock("../Dashboard/BillingDashboardCockpit", () => () => <div>Billing Mock</div>);

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("token", "fake-token");
  });

  test("renders without crashing", () => {
    const { container } = render(<Dashboard />);
    expect(container).toBeInTheDocument();
  });

  test("component renders", () => {
    const { container } = render(<Dashboard />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
