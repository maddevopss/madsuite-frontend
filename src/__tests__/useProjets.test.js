import { renderHook, waitFor, act } from "@testing-library/react";
import { useProjets } from "../hooks/useProjets";

import { getProjects, createProject, updateProject, deleteProject } from "../api/projets.api";

import { getClientsDashboard } from "../api/clients.api";

jest.mock("../api/projets.api");
jest.mock("../api/clients.api");

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

const mockConfirm = jest.fn();
jest.mock("../hooks/useConfirm", () => ({
  useConfirm: () => ({
    confirmProps: { isOpen: false, message: "", onConfirm: jest.fn(), onCancel: jest.fn() },
    confirm: mockConfirm,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockConfirm.mockResolvedValue(true);

  getProjects.mockResolvedValue([
    {
      id: 1,
      client_id: 1,
      nom: "Projet Test",
      note: "Description test",
      budget: 1000,
      taux_horaire: 75,
      status: "actif",
      couleur: "#3366ff",
    },
  ]);

  getClientsDashboard.mockResolvedValue([
    {
      id: 1,
      nom: "Client Test",
    },
  ]);

  createProject.mockResolvedValue({});
  updateProject.mockResolvedValue({});
  deleteProject.mockResolvedValue({});
});

describe("useProjets", () => {
  test("charge les projets", async () => {
    const { result } = renderHook(() => useProjets());

    await waitFor(() => {
      expect(result.current.projets.length).toBe(1);
    });

    expect(result.current.projets[0].nom).toBe("Projet Test");

    expect(result.current.clients.length).toBe(1);
  });

  test("retourne un projet par id", async () => {
    const { result } = renderHook(() => useProjets());

    await waitFor(() => {
      expect(result.current.projets.length).toBe(1);
    });

    const projet = result.current.getProjetById(1);

    expect(projet.nom).toBe("Projet Test");
  });

  test("crée un projet", async () => {
    const { result } = renderHook(() => useProjets());

    act(() => {
      result.current.setForm({
        client_id: 1,
        nom: "Nouveau Projet",
        note: "Description",
        date_fin: "",
        budget: 1500,
        taux_horaire: 100,
        status: "actif",
        couleur: "#ff0000",
      });
    });

    await act(async () => {
      await result.current.addProjet();
    });

    expect(createProject).toHaveBeenCalledWith({
      client_id: 1,
      nom: "Nouveau Projet",
      description: null,
      date_fin: null,
      budget: 1500,
      taux_horaire: 100,
      status: "actif",
      couleur: "#ff0000",
    });
  });

  test("modifie un projet", async () => {
    const { result } = renderHook(() => useProjets());

    act(() => {
      result.current.setEditForm({
        client_id: 1,
        nom: "Projet Modifié",
        note: "Nouvelle description",
        date_fin: "",
        budget: 2000,
        taux_horaire: 120,
        status: "actif",
        couleur: "#00ff00",
      });
    });

    await act(async () => {
      await result.current.saveProjet(1);
    });

    expect(updateProject).toHaveBeenCalledWith(1, {
      client_id: 1,
      nom: "Projet Modifié",
      description: null,
      date_fin: null,
      budget: 2000,
      taux_horaire: 120,
      status: "actif",
      couleur: "#00ff00",
    });
  });

  test("supprime un projet", async () => {
    const { result } = renderHook(() => useProjets());

    await act(async () => {
      await result.current.removeProjet(1);
    });

    expect(deleteProject).toHaveBeenCalledWith(1);
  });
});
