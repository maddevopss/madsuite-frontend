import { renderHook, act } from "@testing-library/react";

import { useUsers } from "./useUsers";

// --- Mocks ---
const mockConfirm = jest.fn();
const mockShowToast = jest.fn();
const mockRefreshAppData = jest.fn();

jest.mock("../RefreshContext", () => ({
  useRefresh: () => ({ refreshAppData: mockRefreshAppData }),
}));

jest.mock("../ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

jest.mock("./useConfirm", () => ({
  useConfirm: () => ({
    confirmProps: {},
    confirm: mockConfirm,
  }),
}));

jest.mock("./useUsers.api", () => ({
  loadTimesheetProjets: jest.fn(),
  loadUserHistoryEntries: jest.fn(),
  loadUsersList: jest.fn(),
  createUserRequest: jest.fn(),
  deleteUserRequest: jest.fn(),
  changeUserPasswordRequest: jest.fn(),
  updateHistoryEntryRequest: jest.fn(),
}));

jest.mock("./useUsers.helpers", () => ({
  buildCreateUserPayload: jest.fn((data) => data),
  validateCreateUserPayload: jest.fn(() => null),
  normalizePassword: jest.fn((pw) => pw),
  getClientIdForEntry: jest.fn(() => "client-1"),
  getClientsEdit: jest.fn(() => []),
  getProjetsForClient: jest.fn(() => []),
  getEditHistoryFormFromEntry: jest.fn(() => ({ projet_id: "p-1" })),
  getEmptyEditForm: jest.fn(() => ({ projet_id: "" })),
  buildHistoryEntryPayload: jest.fn((form) => form),
}));

// helpers/js imports are hoisted, so we can import after mocks
import {
  loadUsersList,
  loadTimesheetProjets,
  loadUserHistoryEntries,
  createUserRequest,
  deleteUserRequest,
  changeUserPasswordRequest,
  updateHistoryEntryRequest,
} from "./useUsers.api";

import { validateCreateUserPayload, normalizePassword } from "./useUsers.helpers";

describe("useUsers hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // defaults
    mockConfirm.mockResolvedValue(true);

    loadUsersList.mockResolvedValue([{ id: "u1", nom: "A", email: "a@x", role: "admin" }]);
    loadTimesheetProjets.mockResolvedValue([{ id: "p1", client_id: "c1" }]);
    loadUserHistoryEntries.mockResolvedValue([{ id: "h1" }]);

    createUserRequest.mockResolvedValue({});
    deleteUserRequest.mockResolvedValue({});
    changeUserPasswordRequest.mockResolvedValue({});
    updateHistoryEntryRequest.mockResolvedValue({});

    validateCreateUserPayload.mockReturnValue(null);
    normalizePassword.mockImplementation((pw) => pw);

    // jsdom timers
    jest.useRealTimers();
  });

  it("loadUsers/loadProjets set loading flags and populate state", async () => {
    const { result } = renderHook(() => useUsers());

    // initial effect triggers loads; let promises resolve
    await act(async () => {
      // flush
      await Promise.resolve();
    });

    expect(loadUsersList).toHaveBeenCalledTimes(1);
    expect(loadTimesheetProjets).toHaveBeenCalledTimes(1);

    expect(result.current.users).toHaveLength(1);
    expect(result.current.projets).toHaveLength(1);
    expect(result.current.isLoadingUsers).toBe(false);
    expect(result.current.isLoadingProjets).toBe(false);
  });

  it("createUser returns false if validation fails", async () => {
    validateCreateUserPayload.mockReturnValue("payload invalide");

    const { result } = renderHook(() => useUsers());

    let ok;
    await act(async () => {
      ok = await result.current.createUser({ nom: "A" });
    });

    expect(ok).toBe(false);
    expect(createUserRequest).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalled();
  });

  it("createUser reloads users and returns true", async () => {
    const { result } = renderHook(() => useUsers());

    await act(async () => {
      const ok = await result.current.createUser({ nom: "A" });
      expect(ok).toBe(true);
    });

    expect(createUserRequest).toHaveBeenCalledTimes(1);
    expect(loadUsersList).toHaveBeenCalled();
    expect(mockRefreshAppData).toHaveBeenCalled();
  });

  it("deleteUser returns false if confirm is refused", async () => {
    mockConfirm.mockResolvedValue(false);

    const { result } = renderHook(() => useUsers());

    let ok;
    await act(async () => {
      ok = await result.current.deleteUser("u1", "A");
    });

    expect(ok).toBe(false);
    expect(deleteUserRequest).not.toHaveBeenCalled();
  });

  it("deleteUser deletes and returns true", async () => {
    const { result } = renderHook(() => useUsers());

    await act(async () => {
      const ok = await result.current.deleteUser("u1", "A");
      expect(ok).toBe(true);
    });

    expect(deleteUserRequest).toHaveBeenCalledWith("u1");
    expect(mockRefreshAppData).toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith("Utilisateur supprimé avec succès.", "success");
  });

  it("changePassword returns false when targetUserId is missing", async () => {
    const { result } = renderHook(() => useUsers());

    let ok;
    await act(async () => {
      ok = await result.current.changePassword({ password: "newpw" });
    });

    expect(ok).toBe(false);
    expect(changeUserPasswordRequest).not.toHaveBeenCalled();
  });

  it("changePassword normalizes and calls API", async () => {
    const { result } = renderHook(() => useUsers());

    act(() => {
      result.current.preparePasswordChange("u1");
    });

    await act(async () => {
      const ok = await result.current.changePassword({ password: "newpw" });
      expect(ok).toBe(true);
    });

    expect(normalizePassword).toHaveBeenCalled();
    expect(changeUserPasswordRequest).toHaveBeenCalledWith("u1", "newpw");
  });

  it("loadHistory sets history user and entries", async () => {
    const { result } = renderHook(() => useUsers());

    const user = { id: "u1", nom: "A" };

    await act(async () => {
      const ok = await result.current.loadHistory(user);
      expect(ok).toBe(true);
    });

    expect(loadUserHistoryEntries).toHaveBeenCalledWith("u1");
    expect(result.current.historyUser).toEqual(user);
    expect(result.current.historyEntries).toEqual([{ id: "h1" }]);
  });

  it("saveHistoryEntry returns false if entryId missing", async () => {
    const { result } = renderHook(() => useUsers());
    let ok;
    await act(async () => {
      ok = await result.current.saveHistoryEntry(null);
    });
    expect(ok).toBe(false);
    expect(updateHistoryEntryRequest).not.toHaveBeenCalled();
  });

  it("saveHistoryEntry returns false if editForm.projet_id missing", async () => {
    const { result } = renderHook(() => useUsers());

    act(() => {
      result.current.setEditForm({ projet_id: "" });
    });

    let ok;
    await act(async () => {
      ok = await result.current.saveHistoryEntry("h1");
    });

    expect(ok).toBe(false);
    expect(updateHistoryEntryRequest).not.toHaveBeenCalled();
  });
});
