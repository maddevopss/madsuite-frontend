import { render, screen, fireEvent } from "@testing-library/react";
import Reports from "../pages/Reports";
import { useReports } from "../hooks/useReports";
import { exportReportsCSV, exportReportsPDF } from "../utils/reportsExcel.utils";

jest.mock("../hooks/useReports");

jest.mock("../utils/reportsExcel.utils", () => ({
  exportReportsCSV: jest.fn(),
  exportReportsPDF: jest.fn(),
}));

jest.mock("../api/authContext", () => ({
  useAuth: () => ({ user: { prenom: "Test", nom: "User" } }),
}));

jest.mock("../pages/Reports/ReportsHeader", () => (props) => (
  <div>
    <h1>Rapports</h1>

    <select aria-label="period" value={props.period} onChange={(e) => props.setPeriod(e.target.value)}>
      <option value="month">Mois</option>
      <option value="year">Année</option>
    </select>

    <button onClick={props.onExportCSV}>Exporter CSV</button>
    <button onClick={props.onExportPDF}>Exporter PDF</button>
  </div>
));

jest.mock("../pages/Reports/ReportsTable", () => (props) => (
  <div>
    <h2>Table rapports</h2>
    <span data-testid="rows-count">{props.rows.length}</span>
  </div>
));

beforeEach(() => {
  jest.clearAllMocks();

  useReports.mockReturnValue({
    period: "month",
    setPeriod: jest.fn(),
    rows: [{ client: "Client Test", projet: "Projet Test", utilisateur: "User Test", heures: 3 }],
    total: { heures: 3, heures_facturables: 2, montant_estime: 180, montant_facture: 120 },
    timeEntries: [{ id: 1 }],
    activityLogs: [{ id: 2 }],
    windowsLogs: [{ id: 3 }],
    loadingReport: false,
    loadingDebug: false,
    loadDebugTables: jest.fn(),
  });
});

describe("Reports page", () => {
  test("affiche les rapports", () => {
    render(<Reports />);

    expect(screen.getByText("Rapports")).toBeInTheDocument();
    
    // On doit basculer sur l'onglet Tableau des Données pour afficher la table
    fireEvent.click(screen.getByText("Tableau des Données"));
    
    expect(screen.getByText("Table rapports")).toBeInTheDocument();
    expect(screen.getByTestId("rows-count").textContent).toBe("1");
  });

  test("exporte CSV et PDF", () => {
    render(<Reports />);

    fireEvent.click(screen.getByText("Exporter CSV"));
    fireEvent.click(screen.getByText("Exporter PDF"));

    expect(exportReportsCSV).toHaveBeenCalled();
    expect(exportReportsPDF).toHaveBeenCalled();
  });
});
