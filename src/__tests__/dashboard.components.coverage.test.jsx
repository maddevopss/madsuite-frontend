import { render, screen, fireEvent } from "@testing-library/react";

import DashboardMetrics from "../pages/Dashboard/DashboardMetrics";
import DashboardCharts from "../pages/Dashboard/DashboardCharts";
import DashboardClientTime from "../pages/Dashboard/DashboardClientTime";
import DashboardActivityIntelligence from "../pages/Dashboard/DashboardActivityIntelligence";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const restartProject = jest.fn();

jest.mock("../hooks/useReports", () => ({
  useReports: jest.fn(),
}));

jest.mock("../TimerContext", () => ({
  useTimer: jest.fn(),
}));

const { useReports } = require("../hooks/useReports");
const { useTimer } = require("../TimerContext");

describe("Dashboard sub-components", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useReports.mockReturnValue({ activityLogs: [] });
    useTimer.mockReturnValue({ projets: [], restartProject });
  });

  test("DashboardMetrics affiche les indicateurs principaux", () => {
    render(
      <DashboardMetrics
        stats={{
          semaine: 12.34,
          mois: 80,
          facturable: 62.4,
          montant_a_facturer: 1234.56,
        }}
      />,
    );

    expect(screen.getByText("Cette semaine")).toBeInTheDocument();
    expect(screen.getByText("12.3 h")).toBeInTheDocument();
    expect(screen.getByText("Ce mois")).toBeInTheDocument();
    expect(screen.getByText("80.0 h")).toBeInTheDocument();
    expect(screen.getByText("Facturable")).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
    expect(screen.getByText(/1[\s\u00a0]?234,56\s\$|1\s234,56\s\$|1 234,56\s\$/)).toBeInTheDocument();
  });

  test("DashboardCharts affiche un état vide sans données", () => {
    render(<DashboardCharts chartData={[]} />);

    expect(screen.getByText("Aucune donnée")).toBeInTheDocument();
    expect(screen.getByText("Aucune donnée disponible.")).toBeInTheDocument();
  });

  test("DashboardCharts affiche les graphiques avec données", () => {
    render(<DashboardCharts chartData={[{ jour: "Lun", heures: 4 }]} />);

    expect(screen.getByText("Heures par jour")).toBeInTheDocument();
    expect(screen.getByText("Évolution des heures")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  test("DashboardClientTime affiche un état vide", () => {
    render(<DashboardClientTime parClient={[]} maxHeures={0} />);

    expect(screen.getByText("Aucune entrée ce mois.")).toBeInTheDocument();
  });

  test("DashboardClientTime affiche les clients et les heures", () => {
    const { container } = render(<DashboardClientTime parClient={[{ client: "Client A", heures: 5 }]} maxHeures={10} />);

    expect(screen.getByText("Client A")).toBeInTheDocument();
    expect(screen.getByText("5.0h")).toBeInTheDocument();
    expect(container.querySelector(".client-bar")).toHaveStyle({ width: "50%" });
  });

  test("DashboardActivityIntelligence affiche un état vide", () => {
    render(<DashboardActivityIntelligence />);

    expect(screen.getByText("Activité intelligente")).toBeInTheDocument();
    expect(screen.getByText("Aucune activité récente.")).toBeInTheDocument();
  });

  test("DashboardActivityIntelligence propose de reprendre un projet détecté", () => {
    useReports.mockReturnValue({
      activityLogs: [{ id: 1, app_name: "VS Code", window_title: "MADSuite - App.jsx" }],
    });

    useTimer.mockReturnValue({
      restartProject,
      projets: [{ id: 9, client_id: 3, nom: "MADSuite", couleur: "#1884df" }],
    });

    render(<DashboardActivityIntelligence />);

    expect(screen.getByText("VS Code")).toBeInTheDocument();
    expect(screen.getByText("MADSuite - App.jsx")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reprendre madsuite/i }));

    expect(restartProject).toHaveBeenCalledWith(
      expect.objectContaining({
        projet_id: 9,
        client_id: 3,
        projet_nom: "MADSuite",
      }),
    );
  });
});
