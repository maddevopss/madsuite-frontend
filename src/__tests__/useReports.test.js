import { act, renderHook, waitFor } from "@testing-library/react";
import { useReports } from "../hooks/useReports";
import api from "../api/api";
import TestAuthProvider from "../testUtils/TestAuthProvider";
import { setAccessToken, clearAccessToken } from "../api/tokenStore";

jest.mock("../api/api");

jest.mock("../RefreshContext", () => ({
  useRefresh: () => ({
    refreshKey: 0,
    refreshAppData: jest.fn(),
  }),
}));

jest.mock("../ToastContext", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  setAccessToken("fake-token");

  api.get.mockImplementation((url) => {
    if (url === "/reports") {
      return Promise.resolve({
        data: {
          rows: [
            {
              client: "Client Test",
              projet: "Projet Test",
              utilisateur: "User Test",
              heures: 3,
              heures_facturables: 2,
              montant_estime: 180,
              montant_facture: 120,
            },
          ],
          total: {
            heures: 3,
            heures_facturables: 2,
            montant_estime: 180,
            montant_facture: 120,
          },
        },
      });
    }

    if (url === "/reports/debug/time_entries") {
      return Promise.resolve({
        data: [{ id: 1 }],
      });
    }

    if (url === "/reports/debug/activity_logs") {
      return Promise.resolve({
        data: [{ id: 2 }],
      });
    }

    if (url === "/reports/debug/window_logs") {
      return Promise.resolve({
        data: [{ id: 3 }],
      });
    }

    return Promise.resolve({ data: [] });
  });
});

afterEach(() => {
  localStorage.clear();
  clearAccessToken();
});

describe("useReports", () => {
  test("charge le rapport", async () => {
    const { result } = renderHook(() => useReports(), {
      wrapper: TestAuthProvider,
    });

    await waitFor(() => {
      expect(result.current.rows.length).toBe(1);
    });

    expect(result.current.rows[0].client).toBe("Client Test");
    expect(result.current.total.heures).toBe(3);
    expect(result.current.total.heures_facturables).toBe(2);
    expect(result.current.total.montant_estime).toBe(180);
    expect(result.current.total.montant_facture).toBe(120);
  });

  test("charge les tables debug", async () => {
    const { result } = renderHook(() => useReports(), {
      wrapper: TestAuthProvider,
    });

    act(() => {
      result.current.loadDebugTables();
    });

    await waitFor(() => {
      expect(result.current.timeEntries.length).toBe(1);
    });

    expect(result.current.activityLogs.length).toBe(1);
    expect(result.current.windowsLogs.length).toBe(1);
  });
});
