import { renderHook, act, waitFor } from "@testing-library/react";
import { useTimesheet } from "../hooks/useTimesheet";
const mockRefreshAppData = jest.fn();
jest.mock("../RefreshContext", () => ({
  useRefresh: () => ({ refreshAppData: mockRefreshAppData, refreshKey: 0 }),
}));

const mockShowToast = jest.fn();
jest.mock("../ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

jest.mock("../hooks/useConfirm.js", () => ({
  useConfirm: () => ({
    confirmProps: { isOpen: false, message: "", onConfirm: jest.fn(), onCancel: jest.fn() },
    confirm: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock("../api/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../pages/Timesheet/timesheet.utils", () => ({
  startOfWeek: (d) => d,
  endOfWeek: (d) => d,
  toDatetimeLocal: (s) => s || "",
  toLocalDateString: (d) => {
    if (!d) return "";
    return new Date(d).toISOString().slice(0, 10);
  },
}));

const api = require("../api/api").default;

const mockProjets = [
  { id: 1, nom: "Projet A", client_id: 10, client: "Client A" },
  { id: 2, nom: "Projet B", client_id: 11, client: "Client B" },
];

const mockEntries = [
  {
    id: 100,
    projet_id: 1,
    description: "Travail",
    start_time: "2026-05-20T08:00:00Z",
    end_time: "2026-05-20T10:00:00Z",
    heures: "2",
    is_billed: false,
    hourly_rate_used: 100,
    duration_seconds: 7200,
  },
];

const mockPagination = { page: 1, limit: 50, total: 1, totalPages: 1, hasNext: false, hasPrev: false };

async function waitForInitialLoad(result) {
  await waitFor(() => {
    expect(result.current.projets).toHaveLength(2);
    expect(result.current.clients).toHaveLength(2);
  });

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.pagination).toEqual(mockPagination);
  });
}

async function flushReactUpdates() {
  await act(async () => {
    await Promise.resolve();
  });
}

async function waitForTimesheetIdle(result) {
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  await flushReactUpdates();
}

async function renderUseTimesheet(filterUser = "") {
  const rendered = renderHook(() => useTimesheet(filterUser));

  await waitForInitialLoad(rendered.result);

  return rendered;
}

async function expectOnlyExpectedConsoleErrors(action, allowedMessages) {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  try {
    await action(consoleErrorSpy);

    const unexpectedCalls = consoleErrorSpy.mock.calls.filter(([firstArg]) => {
      const message = String(firstArg || "");
      return !allowedMessages.some((allowed) => message.includes(allowed));
    });

    expect(unexpectedCalls).toEqual([]);
  } finally {
    consoleErrorSpy.mockRestore();
  }
}

describe("useTimesheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url.includes("/timesheet/projets")) return Promise.resolve({ data: mockProjets });
      if (url.includes("/timesheet/entries"))
        return Promise.resolve({ data: { data: mockEntries, pagination: mockPagination } });
      return Promise.resolve({ data: [] });
    });
  });

  // ── Chargement initial ──────────────────────────────────────────────────────

  test("charge les projets et les entrées au montage", async () => {
    const { result } = await renderUseTimesheet();

    expect(result.current.projets).toHaveLength(2);
    expect(result.current.entries).toHaveLength(1);
  });

  test("déduplique les clients à partir des projets", async () => {
    const { result } = await renderUseTimesheet();

    expect(result.current.clients).toHaveLength(2);
    expect(result.current.clients[0].nom).toBe("Client A");
  });

  test("affiche un toast si le chargement des projets échoue", async () => {
    await expectOnlyExpectedConsoleErrors(async () => {
      api.get.mockImplementation((url) => {
        if (url.includes("/timesheet/projets")) return Promise.reject(new Error("fail"));
        return Promise.resolve({ data: { data: [], pagination: mockPagination } });
      });

      const { result } = renderHook(() => useTimesheet());

      await waitFor(() => expect(result.current.loading).toBe(false));
      await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith("Erreur lors du chargement des projets.", "error"));
      await flushReactUpdates();
    }, ["LOAD TIMESHEET PROJETS:"]);
  });

  test("affiche un toast si le chargement des entrées échoue", async () => {
    await expectOnlyExpectedConsoleErrors(async () => {
      api.get.mockImplementation((url) => {
        if (url.includes("/timesheet/projets")) return Promise.resolve({ data: mockProjets });
        return Promise.reject(new Error("fail"));
      });

      const { result } = renderHook(() => useTimesheet());

      await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith("Erreur lors du chargement des entrées.", "error"));
      await waitFor(() => expect(result.current.loading).toBe(false));
      await flushReactUpdates();
    }, ["FETCH ENTRIES:"]);
  });

  // ── Navigation semaine ──────────────────────────────────────────────────────

  test("prevWeek recule d'une semaine", async () => {
    const { result } = await renderUseTimesheet();

    const before = result.current.weekDate.getTime();

    await act(async () => {
      result.current.prevWeek();
    });

    await waitForTimesheetIdle(result);

    expect(result.current.weekDate.getTime()).toBe(before - 7 * 24 * 60 * 60 * 1000);
  });

  test("nextWeek avance d'une semaine", async () => {
    const { result } = await renderUseTimesheet();

    const before = result.current.weekDate.getTime();

    await act(async () => {
      result.current.nextWeek();
    });

    await waitForTimesheetIdle(result);

    expect(result.current.weekDate.getTime()).toBe(before + 7 * 24 * 60 * 60 * 1000);
  });

  test("la navigation et les filtres remettent la pagination a la page 1", async () => {
    const { result } = await renderUseTimesheet();

    act(() => {
      result.current.setPagination({
        page: 3,
        limit: 50,
        total: 10,
        totalPages: 4,
        hasNext: true,
        hasPrev: true,
      });
    });

    await waitForTimesheetIdle(result);

    act(() => {
      result.current.prevWeek();
    });

    await waitForTimesheetIdle(result);

    expect(result.current.pagination.page).toBe(1);

    act(() => {
      result.current.setPagination({
        page: 4,
        limit: 50,
        total: 10,
        totalPages: 4,
        hasNext: false,
        hasPrev: true,
      });
      result.current.setFilterClient("10");
    });

    await waitForTimesheetIdle(result);

    expect(result.current.pagination.page).toBe(1);
    expect(result.current.filterClient).toBe("10");
  });

  // ── Formulaires ─────────────────────────────────────────────────────────────

  test("resetAddForm vide le formulaire d'ajout", async () => {
    const { result } = await renderUseTimesheet();

    act(() => result.current.setAddForm({ projet_id: 1, description: "test", start_time: "T1", end_time: "T2" }));
    act(() => result.current.resetAddForm());

    expect(result.current.addForm).toEqual({ projet_id: "", description: "", start_time: "", end_time: "" });
  });

  test("prepareEditForm remplit le formulaire avec une entrée", async () => {
    const { result } = await renderUseTimesheet();

    act(() => result.current.prepareEditForm(mockEntries[0]));

    expect(result.current.editForm.projet_id).toBe(1);
    expect(result.current.editForm.description).toBe("Travail");
  });

  // ── saveNewEntry ─────────────────────────────────────────────────────────────

  test("saveNewEntry crée une entrée et recharge", async () => {
    api.post = jest.fn().mockResolvedValue({ data: {} });
    const { result } = await renderUseTimesheet();

    act(() =>
      result.current.setAddForm({
        projet_id: 1,
        description: "X",
        start_time: "2026-05-20T08:00",
        end_time: "2026-05-20T10:00",
      }),
    );

    let success;
    await act(async () => {
      success = await result.current.saveNewEntry();
    });

    await flushReactUpdates();

    expect(success).toBe(true);
    expect(api.post).toHaveBeenCalledWith("/timesheet/manual", expect.objectContaining({ projet_id: 1 }));
    expect(mockShowToast).toHaveBeenCalledWith("Entrée ajoutée avec succès.", "success");
  });

  test("saveNewEntry refuse si les champs requis sont vides", async () => {
    const { result } = await renderUseTimesheet();

    let success;
    await act(async () => {
      success = await result.current.saveNewEntry();
    });

    expect(success).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith("Projet, début et fin sont requis.", "warning");
  });

  test("saveNewEntry gère l'erreur API", async () => {
    await expectOnlyExpectedConsoleErrors(async () => {
      api.post = jest.fn().mockRejectedValue(new Error("fail"));
      const { result } = await renderUseTimesheet();

      act(() => result.current.setAddForm({ projet_id: 1, description: "", start_time: "T", end_time: "T2" }));

      let success;
      await act(async () => {
        success = await result.current.saveNewEntry();
      });

      await flushReactUpdates();

      expect(success).toBe(false);
      expect(mockShowToast).toHaveBeenCalledWith("Erreur lors de la création de l'entrée.", "error");
    }, ["CREATE ENTRY:"]);
  });

  // ── saveEditEntry ────────────────────────────────────────────────────────────

  test("saveEditEntry met à jour une entrée", async () => {
    api.patch = jest.fn().mockResolvedValue({});
    const { result } = await renderUseTimesheet();

    act(() => result.current.prepareEditForm(mockEntries[0]));

    let success;
    await act(async () => {
      success = await result.current.saveEditEntry(100);
    });

    await flushReactUpdates();

    expect(success).toBe(true);
    expect(api.patch).toHaveBeenCalledWith("/timesheet/entries/100", expect.any(Object));
    expect(mockShowToast).toHaveBeenCalledWith("Entrée modifiée avec succès.", "success");
  });

  test("saveEditEntry refuse sans entryId", async () => {
    const { result } = await renderUseTimesheet();

    let success;
    await act(async () => {
      success = await result.current.saveEditEntry(null);
    });

    expect(success).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith("Entrée introuvable.", "error");
  });

  // ── toggleBilled ─────────────────────────────────────────────────────────────

  test("toggleBilled inverse le statut de facturation", async () => {
    api.patch = jest.fn().mockResolvedValue({});
    const { result } = await renderUseTimesheet();
    await act(async () => {
      await result.current.toggleBilled(mockEntries[0]);
    });

    await flushReactUpdates();

    expect(api.patch).toHaveBeenCalledWith(`/timesheet/entries/${mockEntries[0].id}/facturer`, { is_billed: true });
    expect(mockShowToast).toHaveBeenCalledWith("Statut de facturation mis à jour.", "success");
  });

  // ── deleteEntry ──────────────────────────────────────────────────────────────

  test("deleteEntry supprime après confirmation", async () => {
    api.delete = jest.fn().mockResolvedValue({});
    const { result } = await renderUseTimesheet();
    let success;
    await act(async () => {
      success = await result.current.deleteEntry(100);
    });

    await flushReactUpdates();

    expect(success).toBe(true);
    expect(api.delete).toHaveBeenCalledWith("/timesheet/entries/100");
    expect(mockShowToast).toHaveBeenCalledWith("Entrée supprimée avec succès.", "success");
  });

  // ── Stats calculées ──────────────────────────────────────────────────────────

  test("weekStats calcule le total des secondes", async () => {
    const { result } = await renderUseTimesheet();

    expect(result.current.weekStats.totalSeconds).toBeGreaterThanOrEqual(0);
    expect(typeof result.current.weekStats.montant).toBe("number");
  });

  test("totalHeures est la somme des heures des entrées", async () => {
    const { result } = await renderUseTimesheet();

    expect(result.current.totalHeures).toBe(2);
  });

  test("groupedEntries regroupe les entrées par date", async () => {
    const { result } = await renderUseTimesheet();

    const keys = Object.keys(result.current.groupedEntries);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toBe("2026-05-20");
  });

  test("pagination est exposée correctement", async () => {
    const { result } = await renderUseTimesheet();

    expect(result.current.pagination.page).toBe(1);
    expect(result.current.pagination.total).toBe(1);
  });
});
