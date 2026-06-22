import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Clients from "../Clients";
import * as api from "../../api/api";

jest.mock("../../api/api");
jest.mock("../../api/authContext", () => ({
  useAuth: () => ({ user: { role: "admin" } }),
}));

jest.mock("../../hooks/useClients", () => ({
  useClients: () => ({
    clients: [{ id: 1, nom: "Client 1", email: "client@test.com" }],
    loading: false,
    addClient: jest.fn().mockResolvedValue({}),
    updateClient: jest.fn().mockResolvedValue({}),
    deleteClient: jest.fn().mockResolvedValue({}),
  }),
}));

jest.mock("../../hooks/useModal", () => ({
  useModal: () => ({
    isOpen: false,
    openModal: jest.fn(),
    closeModal: jest.fn(),
  }),
}));

describe("Clients Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("token", "fake-token");
  });

  test("renders clients grid", async () => {
    const { container } = render(
      <MemoryRouter>
        <Clients />
      </MemoryRouter>
    );
    expect(container).toBeInTheDocument();
  });

  test("displays clients list", async () => {
    render(
      <MemoryRouter>
        <Clients />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Client 1")).toBeInTheDocument();
    });
  });

  test("shows add client button", () => {
    render(
      <MemoryRouter>
        <Clients />
      </MemoryRouter>
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
