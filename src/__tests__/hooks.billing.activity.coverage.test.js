import { renderHook, waitFor, act } from "@testing-library/react";

import api from "../api/api";
import { useBillingDashboard } from "../hooks/useBillingDashboard";
import { useRecentActivity } from "../hooks/useRecentActivity";

jest.mock("../api/api", () => ({
  get: jest.fn(),
}));

jest.mock("../RefreshContext", () => ({
  useRefresh: () => ({ refreshKey: 0 }),
}));

const mockShowToast = jest.fn();
jest.mock("../ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

jest.mock("../api/tokenStore", () => ({
  getAccessToken: jest.fn(),
}));

const { getAccessToken } = require("../api/tokenStore");

describe("low coverage hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("useBillingDashboard charge et normalise les données", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        total_to_invoice: "125.50",
        total_invoiced_this_month: "300",
        total_paid_this_month: "200",
        unbilled_hours: "4.5",
        billed_hours: "2.5",
        overdue_count: "1",
        overdue_total: "99",
        due_soon_count: "2",
        due_soon_total: "150",
        invoice_status: { draft: 1 },
        top_clients_to_bill: [{ client_nom: "Client A" }],
        top_projects_to_bill: [{ projet_nom: "Projet A" }],
        recent_invoices: [{ id: 1 }],
        overdue_invoices: [{ id: 2 }],
        due_soon_invoices: [{ id: 3 }],
      },
    });

    const { result } = renderHook(() => useBillingDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(api.get).toHaveBeenCalledWith("/billing/dashboard");
    expect(result.current.total_to_invoice).toBe(125.5);
    expect(result.current.topClients).toHaveLength(1);
    expect(result.current.topProjects).toHaveLength(1);
    expect(result.current.recentInvoices).toHaveLength(1);
    expect(result.current.overdueInvoices).toHaveLength(1);
    expect(result.current.dueSoonInvoices).toHaveLength(1);
  });

  test("useBillingDashboard gère une erreur API", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    api.get.mockRejectedValueOnce(new Error("fail"));

    const { result } = renderHook(() => useBillingDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockShowToast).toHaveBeenCalledWith("Erreur lors du chargement du cockpit de facturation.", "error");
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  test("useRecentActivity ne charge rien sans token", async () => {
    getAccessToken.mockReturnValue(null);

    const { result } = renderHook(() => useRecentActivity());

    await act(async () => {
      const rows = await result.current.loadRecentActivity();
      expect(rows).toEqual([]);
    });

    expect(api.get).not.toHaveBeenCalled();
  });
});
