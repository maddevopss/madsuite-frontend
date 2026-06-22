import { render, screen } from "@testing-library/react";
import Dashboard from "../pages/Dashboard";
import { useBillingDashboard } from "../hooks/useBillingDashboard";
import { useEstimates } from "../hooks/useEstimates";
import { MemoryRouter } from "react-router-dom";

/* =========================
   MOCK HOOKS
========================= */
jest.mock("../hooks/useBillingDashboard", () => ({
  useBillingDashboard: jest.fn(() => ({
    loading: false,
    total_paid_this_month: 1500,
    unbilled_hours: 12.5,
    invoiceStatus: {
      sent: { count: 2 },
      overdue: { count: 1 }
    },
    refresh: jest.fn(),
  })),
}));

jest.mock("../hooks/useEstimates", () => ({
  useEstimates: jest.fn(() => ({
    estimates: [
      { id: 1, status: 'draft' },
      { id: 2, status: 'sent' }
    ],
    loading: false,
    loadEstimates: jest.fn(),
  })),
}));

/* =========================
   MOCK COMPONENTS
========================= */
jest.mock("../components/onboarding/SampleDataGenerator", () => () => (
  <div data-testid="sample-data-generator">Sample Data Generator</div>
));

/* =========================
   SETUP
========================= */
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.warn.mockRestore();
  console.error.mockRestore();
});

/* =========================
   TESTS
========================= */
describe("Dashboard page", () => {
  test("affiche le loader quand loading est true", () => {
    useBillingDashboard.mockReturnValue({ loading: true, refresh: jest.fn() });
    useEstimates.mockReturnValue({ estimates: [], loading: false, loadEstimates: jest.fn() });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Chargement du tableau de bord/i)).toBeInTheDocument();
  });

  test("affiche les métriques du dashboard SaaS", () => {
    useBillingDashboard.mockReturnValue({
      loading: false,
      total_paid_this_month: 1500,
      unbilled_hours: 12.5,
      invoiceStatus: {
        sent: { count: 2 },
        overdue: { count: 1 }
      },
      refresh: jest.fn(),
    });

    useEstimates.mockReturnValue({
      estimates: [
        { id: 1, status: 'draft' },
        { id: 2, status: 'sent' }
      ],
      loading: false,
      loadEstimates: jest.fn(),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Tableau de bord/i)).toBeInTheDocument();
    
    // Vérifier les 4 cartes principales
    expect(screen.getByText(/Revenus \(Ce mois\)/i)).toBeInTheDocument();
    expect(screen.getByText("1 500,00 $")).toBeInTheDocument(); // 1500 formatMoney (approx)
    
    expect(screen.getByText(/Factures en attente/i)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // sent(2) + overdue(1) = 3
    
    expect(screen.getByText(/Devis en attente/i)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // 2 estimates in mock
    
    expect(screen.getByText(/Heures Facturables/i)).toBeInTheDocument();
    expect(screen.getByText("12.5h")).toBeInTheDocument();
  });
});
