import { renderHook, act, waitFor } from "@testing-library/react";
import { useDashboard } from "../hooks/useDashboard";

jest.mock("../RefreshContext", () => ({
  useRefresh: () => ({ refreshKey: 0 }),
}));

const mockShowToast = jest.fn();
jest.mock("../ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

jest.mock("../api/api.jsx", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock("../api/activity.api.jsx", () => ({
  getActivitySummary: jest.fn().mockResolvedValue([]),
}));

const api = require("../api/api").default;

const mockStats = {
  semaine: 10,
  mois: 40,
  facturable: 8,
  montant_a_facturer: 800,
  par_client: [{ nom: "Client A", heures: "5.5" }],
  par_jour: [{ jour: "2026-05-20", heures: "3" }],
};

describe("useDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: mockStats });
  });

  test("charge les stats au montage", async () => {
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(api.get).toHaveBeenCalledWith("/timesheet/dashboard");
    expect(result.current.stats.semaine).toBe(10);
    expect(result.current.stats.mois).toBe(40);
  });

  test("loading est true puis false après le fetch", async () => {
    const { result } = renderHook(() => useDashboard());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  test("parClient est un tableau sécurisé", async () => {
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(Array.isArray(result.current.parClient)).toBe(true);
    expect(result.current.parClient[0].nom).toBe("Client A");
  });

  test("parJour est un tableau sécurisé", async () => {
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(Array.isArray(result.current.parJour)).toBe(true);
  });

  test("maxHeures vaut au moins 1 même si parClient est vide", async () => {
    api.get.mockResolvedValue({ data: { ...mockStats, par_client: [] } });
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.maxHeures).toBeGreaterThanOrEqual(1);
  });

  test("chartData mappe correctement parJour", async () => {
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.chartData).toHaveLength(1);
    expect(result.current.chartData[0].heures).toBe(3);
  });

  test("affiche un toast d'erreur si le fetch échoue", async () => {
    api.get.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockShowToast).toHaveBeenCalledWith("Erreur lors du chargement des statistiques.", "error");
  });

  test("parClient et parJour sont [] si la réponse ne contient pas de tableaux", async () => {
    api.get.mockResolvedValue({ data: { semaine: 5, par_client: null, par_jour: "invalide" } });
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.parClient).toEqual([]);
    expect(result.current.parJour).toEqual([]);
  });

  test("fetchStats expose la fonction et est ré-appelable", async () => {
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.fetchStats();
    });

    expect(api.get).toHaveBeenCalledTimes(2);
  });
});
