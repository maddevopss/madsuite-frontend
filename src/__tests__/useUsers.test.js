import { renderHook, act, waitFor } from "@testing-library/react";
import { useUsers } from "../hooks/useUsers";

const mockRefreshAppData = jest.fn();
jest.mock("../RefreshContext", () => ({
  useRefresh: () => ({ refreshAppData: mockRefreshAppData }),
}));

const mockShowToast = jest.fn();
jest.mock("../ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const mockConfirm = jest.fn().mockResolvedValue(true);

jest.mock("../hooks/useConfirm", () => ({
  useConfirm: () => ({
    confirm: mockConfirm,
  }),
}));

jest.mock("../api/api.jsx", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../pages/Users/users.utils.js", () => ({
  toDatetimeLocal: (s) => s || "",
  getClientsFromProjects: (projets) => [
    ...new Map(projets.map((p) => [p.client_id, { id: p.client_id, nom: p.client }])).values(),
  ],
}));

const api = require("../api/api").default;

const mockUsers = [
  { id: 1, nom: "Alice", email: "alice@test.com", role: "admin" },
  { id: 2, nom: "Bob", email: "bob@test.com", role: "employe" },
];

const mockProjets = [
  { id: 10, nom: "Projet Alpha", client_id: 5, client: "Client X" },
  { id: 11, nom: "Projet Beta", client_id: 6, client: "Client Y" },
];

async function renderUseUsersReady() {
  const rendered = renderHook(() => useUsers());

  await waitFor(() => {
    expect(rendered.result.current.users).toHaveLength(2);
  });

  await waitFor(() => {
    expect(rendered.result.current.projets).toHaveLength(2);
  });

  return rendered;
}

function muteExpectedConsoleError() {
  return jest.spyOn(console, "error").mockImplementation(() => {});
}

describe("useUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === "/users") return Promise.resolve({ data: mockUsers });
      if (url === "/timesheet/projets") return Promise.resolve({ data: mockProjets });
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── Chargement initial ──────────────────────────────────────────────────────

  test("charge les utilisateurs et les projets au montage", async () => {
    const { result } = await renderUseUsersReady();

    await waitFor(() => expect(result.current.users).toHaveLength(2));

    expect(result.current.users[0].nom).toBe("Alice");
    expect(result.current.projets).toHaveLength(2);
  });

  test("affiche un toast si le chargement des users échoue", async () => {
    const consoleErrorSpy = muteExpectedConsoleError();
    api.get.mockImplementation((url) => {
      if (url === "/users") return Promise.reject(new Error("fail"));
      return Promise.resolve({ data: mockProjets });
    });

    renderHook(() => useUsers());

    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith("Erreur lors du chargement des utilisateurs.", "error"));
    expect(consoleErrorSpy).toHaveBeenCalledWith("Erreur chargement users:", "fail");
  });

  test("affiche un toast si le chargement des projets échoue", async () => {
    const consoleErrorSpy = muteExpectedConsoleError();
    api.get.mockImplementation((url) => {
      if (url === "/users") return Promise.resolve({ data: mockUsers });
      return Promise.reject(new Error("fail"));
    });

    renderHook(() => useUsers());

    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith("Erreur lors du chargement des projets.", "error"));
    expect(consoleErrorSpy).toHaveBeenCalledWith("Erreur chargement projets:", "fail");
  });

  // ── Création d'utilisateur ───────────────────────────────────────────────────

  test("createUser crée un utilisateur valide", async () => {
    api.post.mockResolvedValue({ data: { id: 3, nom: "Charlie" } });
    const { result } = await renderUseUsersReady();
    await waitFor(() => expect(result.current.users).toHaveLength(2));

    let success;
    await act(async () => {
      success = await result.current.createUser({
        nom: "Charlie",
        email: "charlie@test.com",
        password: "Secret123!",
        role: "employe",
      });
    });

    expect(success).toBe(true);
    expect(api.post).toHaveBeenCalledWith("/users", expect.objectContaining({ nom: "Charlie" }));
    expect(mockShowToast).toHaveBeenCalledWith("Utilisateur créé avec succès.", "success");
  });

  test("createUser refuse si le nom est vide", async () => {
    const { result } = await renderUseUsersReady();

    let success;
    await act(async () => {
      success = await result.current.createUser({ nom: "", email: "", password: "", role: "employe" });
    });

    expect(success).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith("Le nom est requis.", "warning");
  });

  test("createUser refuse si le courriel est vide", async () => {
    const { result } = await renderUseUsersReady();

    let success;
    await act(async () => {
      success = await result.current.createUser({ nom: "Charlie", email: "", password: "", role: "employe" });
    });

    expect(success).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith("Le courriel est requis.", "warning");
  });

  test("createUser refuse si le mot de passe est vide", async () => {
    const { result } = await renderUseUsersReady();

    let success;
    await act(async () => {
      success = await result.current.createUser({
        nom: "Charlie",
        email: "charlie@test.com",
        password: "",
        role: "employe",
      });
    });

    expect(success).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith("Le mot de passe est requis.", "warning");
  });

  test("createUser gère l'erreur API", async () => {
    const consoleErrorSpy = muteExpectedConsoleError();
    api.post.mockRejectedValue({ response: { data: { message: "Email déjà utilisé" } } });
    const { result } = await renderUseUsersReady();

    let success;
    await act(async () => {
      success = await result.current.createUser({
        nom: "X",
        email: "x@test.com",
        password: "password",
        role: "employe",
      });
    });

    expect(success).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Erreur création user:", { message: "Email déjà utilisé" });
    expect(mockShowToast).toHaveBeenCalledWith("Email déjà utilisé", "error");
  });

  // ── Changement de mot de passe ───────────────────────────────────────────────

  test("changePassword met à jour le mot de passe", async () => {
    api.put.mockResolvedValue({});
    const { result } = await renderUseUsersReady();

    act(() => result.current.preparePasswordChange(1));

    let success;
    await act(async () => {
      success = await result.current.changePassword("NewPass123!");
    });

    expect(success).toBe(true);
    expect(api.put).toHaveBeenCalledWith("/users/1/password", { mot_de_passe: "NewPass123!" });
    expect(mockShowToast).toHaveBeenCalledWith("Mot de passe modifié avec succès.", "success");
  });

  test("changePassword refuse sans utilisateur sélectionné", async () => {
    const { result } = await renderUseUsersReady();

    let success;
    await act(async () => {
      success = await result.current.changePassword("NewPass123!");
    });

    expect(success).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith("Utilisateur introuvable.", "error");
  });

  test("changePassword refuse si le mot de passe est vide", async () => {
    const { result } = await renderUseUsersReady();
    act(() => result.current.preparePasswordChange(1));

    let success;
    await act(async () => {
      success = await result.current.changePassword("");
    });

    expect(success).toBe(false);
    expect(mockShowToast).toHaveBeenCalledWith("Le nouveau mot de passe est requis.", "warning");
  });

  // ── Suppression d'utilisateur ────────────────────────────────────────────────

  test("deleteUser supprime après confirmation", async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true } });
    mockConfirm.mockResolvedValueOnce(true);

    const { result } = await renderUseUsersReady();

    let success;

    await act(async () => {
      success = await result.current.deleteUser(2);
    });

    expect(mockConfirm).toHaveBeenCalled();
    expect(api.delete).toHaveBeenCalledWith("/users/2");
    expect(success).toBe(true);
    expect(mockShowToast).toHaveBeenCalledWith("Utilisateur supprimé avec succès.", "success");
  });

  test("deleteUser annule si l'utilisateur refuse", async () => {
    mockConfirm.mockResolvedValueOnce(false);
    const { result } = await renderUseUsersReady();

    let success;
    await act(async () => {
      success = await result.current.deleteUser(2, "Bob");
    });

    expect(success).toBe(false);
    expect(api.delete).not.toHaveBeenCalled();
  });

  // ── Historique ───────────────────────────────────────────────────────────────

  test("loadHistory charge les entrées d'un utilisateur", async () => {
    const entries = [{ id: 50, note: "Travail" }];
    api.get.mockImplementation((url) => {
      if (url.includes("/time-entries/recent")) return Promise.resolve({ data: entries });
      if (url === "/users") return Promise.resolve({ data: mockUsers });
      return Promise.resolve({ data: mockProjets });
    });

    const { result } = await renderUseUsersReady();

    let success;
    await act(async () => {
      success = await result.current.loadHistory({ id: 1, nom: "Alice" });
    });

    expect(success).toBe(true);
    expect(result.current.historyEntries).toHaveLength(1);
    expect(result.current.historyUser.nom).toBe("Alice");
    expect(mockShowToast).toHaveBeenCalledWith("Historique chargé.", "success");
  });

  test("loadHistory gère l'erreur API", async () => {
    const consoleErrorSpy = muteExpectedConsoleError();
    api.get.mockImplementation((url) => {
      if (url.includes("/time-entries/recent")) return Promise.reject(new Error("fail"));
      if (url === "/users") return Promise.resolve({ data: mockUsers });
      return Promise.resolve({ data: mockProjets });
    });

    const { result } = await renderUseUsersReady();

    let success;
    await act(async () => {
      success = await result.current.loadHistory({ id: 1 });
    });

    expect(success).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Erreur historique user:", "fail");
    expect(mockShowToast).toHaveBeenCalledWith("Erreur lors du chargement de l'historique.", "error");
  });

  // ── Computed ─────────────────────────────────────────────────────────────────

  test("clientsEdit déduplique les clients depuis les projets", async () => {
    const { result } = await renderUseUsersReady();

    await waitFor(() => expect(result.current.projets).toHaveLength(2));

    expect(result.current.clientsEdit).toHaveLength(2);
  });

  test("projetsEditFiltres filtre par client sélectionné", async () => {
    const { result } = await renderUseUsersReady();
    await waitFor(() => expect(result.current.projets).toHaveLength(2));

    act(() => result.current.setEditClientId("5"));

    expect(result.current.projetsEditFiltres).toHaveLength(1);
    expect(result.current.projetsEditFiltres[0].nom).toBe("Projet Alpha");
  });
});
