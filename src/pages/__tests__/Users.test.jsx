import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Users from "../Users";
import { useUsers } from "../../hooks/useUsers";

let mockAuthUser = { role: "admin" };

jest.mock("../../api/authContext", () => ({
  useAuth: () => ({ user: mockAuthUser }),
}));

jest.mock("../../hooks/useUsers", () => ({
  useUsers: jest.fn(),
}));

const mockUseUsers = useUsers;

function buildUsersHook(overrides = {}) {
  return {
    users: [
      { id: 1, nom: "Alice", email: "alice@test.com", role: "admin" },
      { id: 2, nom: "Bob", email: "bob@test.com", role: "employe" },
    ],
    nom: "",
    setNom: jest.fn(),
    email: "",
    setEmail: jest.fn(),
    role: "employe",
    setRole: jest.fn(),
    password: "",
    setPassword: jest.fn(),
    preparePasswordChange: jest.fn(),
    resetPasswordForm: jest.fn(),
    changePassword: jest.fn().mockResolvedValue(true),
    editForm: {
      description: "",
      projet_id: "",
      start_time: "",
      end_time: "",
    },
    setEditForm: jest.fn(),
    editClientId: "",
    setEditClientId: jest.fn(),
    clientsEdit: [{ id: 10, nom: "Client A" }],
    projetsEditFiltres: [{ id: 100, nom: "Projet A" }],
    createUser: jest.fn().mockResolvedValue(true),
    deleteUser: jest.fn().mockResolvedValue(true),
    historyUser: { id: 1, nom: "Alice" },
    historyEntries: [
      {
        id: 50,
        client: "Client A",
        projet: "Projet A",
        description: "Travail",
        start_time: "2026-05-20T08:00:00Z",
        end_time: "2026-05-20T10:00:00Z",
        heures: "2",
      },
    ],
    loadHistory: jest.fn().mockResolvedValue(true),
    prepareEditHistoryEntry: jest.fn(),
    saveHistoryEntry: jest.fn().mockResolvedValue(true),
    confirmProps: { isOpen: false, message: "", onConfirm: jest.fn(), onCancel: jest.fn() },
    ...overrides,
  };
}

describe("Users Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockAuthUser = { role: "admin" };
    mockUseUsers.mockReturnValue(buildUsersHook());
  });

  test("refuse l'acces aux non-admins", () => {
    mockAuthUser = { role: "employe" };

    render(<Users />);

    expect(screen.getByText(/refus/i)).toBeInTheDocument();
    expect(mockUseUsers).not.toHaveBeenCalled();
  });

  test("affiche la liste des utilisateurs pour un admin", () => {
    render(<Users />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  test("ouvre le modal d'ajout et soumet le formulaire", async () => {
    const hook = buildUsersHook();
    mockUseUsers.mockReturnValue(hook);

    render(<Users />);

    fireEvent.click(screen.getByText("+ Ajouter"));
    fireEvent.change(screen.getByPlaceholderText("Ex: Jean Dupont"), { target: { value: "Charlie" } });
    fireEvent.change(screen.getByPlaceholderText("jean.dupont@madsuite.com"), {
      target: { value: "charlie@test.com" },
    });
    fireEvent.change(document.querySelector('input[name="password"]'), { target: { value: "Secret123!" } });
    fireEvent.click(screen.getByRole("button", { name: /Cr/i }));

    await waitFor(() =>
      expect(hook.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          nom: "Charlie",
          email: "charlie@test.com",
          password: "Secret123!",
        }),
      ),
    );
  });

  test("ouvre le modal de mot de passe et sauvegarde", async () => {
    const hook = buildUsersHook();
    mockUseUsers.mockReturnValue(hook);

    render(<Users />);

    fireEvent.click(screen.getAllByText("Mot de passe")[0]);
    fireEvent.change(screen.getByPlaceholderText("Nouveau mot de passe"), { target: { value: "NewPass123!" } });
    fireEvent.click(screen.getByRole("button", { name: /Sauvegarder/i }));

    await waitFor(() => expect(hook.changePassword).toHaveBeenCalledWith("NewPass123!"));
    expect(hook.preparePasswordChange).toHaveBeenCalledWith(1);
  });

  test("ouvre l'historique et permet de preparer une edition", async () => {
    const hook = buildUsersHook();
    mockUseUsers.mockReturnValue(hook);

    render(<Users />);

    fireEvent.click(screen.getAllByText("Historique")[0]);

    await waitFor(() => expect(hook.loadHistory).toHaveBeenCalledWith(expect.objectContaining({ id: 1 })));
    expect(screen.getByText(/Travail/)).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Modifier"));

    expect(hook.prepareEditHistoryEntry).toHaveBeenCalledWith(expect.objectContaining({ id: 50 }));
  });
});
