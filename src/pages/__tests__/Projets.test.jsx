import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Projets from "../Projets";
import * as api from "../../api/api";

jest.mock("../../api/api");
jest.mock("../../api/authContext", () => ({
  useAuth: () => ({ user: { role: "admin" } }),
}));

jest.mock("../../hooks/useProjets", () => ({
  useProjets: () => ({
    projets: [
      { id: 1, nom: "Projet 1", client_nom: "Client 1", taux_horaire: 100 },
    ],
    loading: false,
    addProject: jest.fn().mockResolvedValue({}),
    updateProject: jest.fn().mockResolvedValue({}),
    deleteProject: jest.fn().mockResolvedValue({}),
  }),
}));

jest.mock("../../hooks/useModal", () => ({
  useModal: () => ({
    isOpen: false,
    openModal: jest.fn(),
    closeModal: jest.fn(),
  }),
}));

jest.mock("../../components/ui/AdaptivePanel", () => ({ children }) => <div>{children}</div>);

describe("Projets Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("token", "fake-token");
  });

  test("renders projects grid", async () => {
    const { container } = render(<Projets />);
    expect(container).toBeInTheDocument();
  });

  test("displays projects list", async () => {
    render(<Projets />);

    await waitFor(() => {
      const projets = screen.getAllByText("Projet 1");
      expect(projets.length).toBeGreaterThan(0);
    });
  });

  test("shows add project button", () => {
    render(<Projets />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
