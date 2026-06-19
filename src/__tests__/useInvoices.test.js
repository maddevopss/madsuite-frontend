import { act, renderHook, waitFor } from "@testing-library/react";

const mockShowToast = jest.fn();

jest.mock("../ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

jest.mock("../RefreshContext", () => ({
  useRefresh: () => ({ refreshAppData: jest.fn(), refreshKey: 0 }),
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

const api = require("../api/api").default;
const { useInvoices } = require("../hooks/useInvoices");

describe("useInvoices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loadInvoices charge les factures depuis l'API", async () => {
    api.get.mockResolvedValue({
      data: [{ id: 1, invoice_number: "INV-2026-0001" }],
    });

    const { result } = renderHook(() => useInvoices());

    await act(async () => {
      await result.current.loadInvoices({ status: "draft" });
    });

    expect(api.get).toHaveBeenCalledWith("/invoices", { params: { status: "draft" } });
    expect(result.current.invoices).toHaveLength(1);
    expect(result.current.loading).toBe(false);
  });

  test("addInvoice affiche le message d'erreur API", async () => {
    api.post.mockRejectedValue({
      response: {
        data: {
          message: "Entrées invalides.",
        },
      },
    });

    const { result } = renderHook(() => useInvoices());

    let ok;
    await act(async () => {
      ok = await result.current.addInvoice({ client_id: 1, time_entry_ids: [99] });
    });

    expect(ok).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith("Entrées invalides.", "error");
  });

  test("saveInvoice affiche les détails de validation utiles", async () => {
    api.patch.mockRejectedValue({
      response: {
        data: {
          message: "Données invalides.",
          errors: {
            fieldErrors: {
              status: ["Statut non reconnu."],
            },
          },
        },
      },
    });

    const { result } = renderHook(() => useInvoices());

    await act(async () => {
      await result.current.saveInvoice(10, { status: "inconnu" });
    });

    expect(mockShowToast).toHaveBeenCalledWith("Données invalides. status: Statut non reconnu.", "error");
  });

  test("removeInvoice mentionne les entrees liberees", async () => {
    api.delete.mockResolvedValue({
      data: {
        success: true,
        released_entries: 2,
      },
    });

    const { result } = renderHook(() => useInvoices());

    await act(async () => {
      await result.current.removeInvoice(10);
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining("2"), "success");
    });
  });
});
