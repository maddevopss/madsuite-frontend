import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { TimerProvider, useTimer } from "./TimerContext";
import api from "./api/api";
import { getClientsDashboard } from "./api/clients.api";
import { getProjects } from "./api/projets.api";
import { setAccessToken, clearAccessToken } from "./api/tokenStore";

jest.mock("canvas-confetti", () => jest.fn());
jest.mock("./api/api");
jest.mock("./api/clients.api");
jest.mock("./api/projets.api");

function TestTimer() {
  const {
    isRunning,
    elapsedFormatted,
    selectedClient,
    setSelectedClient,
    selectedProjet,
    setSelectedProjet,
    description,
    setDescription,
    toggleTimer,
    clients,
    projets,
  } = useTimer();

  return (
    <div>
      <div data-testid="running">{String(isRunning)}</div>
      <div data-testid="elapsed">{elapsedFormatted}</div>
      <div data-testid="clients-count">{clients.length}</div>
      <div data-testid="projets-count">{projets.length}</div>

      <input data-testid="description" value={description} onChange={(e) => setDescription(e.target.value)} />

      <button onClick={() => setSelectedClient("1")}>Set Client</button>
      <button onClick={() => setSelectedProjet("10")}>Set Projet</button>
      <button onClick={toggleTimer}>Toggle</button>

      <div data-testid="selected-client">{selectedClient}</div>
      <div data-testid="selected-projet">{selectedProjet}</div>
    </div>
  );
}

jest.mock("./RefreshContext", () => ({
  useRefresh: () => ({
    refreshKey: 0,
    refreshAppData: jest.fn(),
  }),
}));

const mockShowToast = jest.fn();
jest.mock("./ToastContext", () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Mock localStorage
beforeEach(() => {
  jest.clearAllMocks();
  setAccessToken("fake-token");
  localStorage.setItem("token", "fake-token");

  getClientsDashboard.mockResolvedValue([
    {
      id: 1,
      nom: "Client Test",
      hourly_rate_defaut: 75,
    },
  ]);

  getProjects.mockResolvedValue([
    {
      id: 10,
      client_id: 1,
      nom: "Projet Test",
      taux_horaire: 90,
      status: "actif",
      couleur: "#1884df",
    },
  ]);

  api.get.mockImplementation((url) => {
    if (url === "/timer/active") {
      return Promise.resolve({ data: null });
    }

    return Promise.resolve({ data: null });
  });

  api.post.mockResolvedValue({
    data: {
      id: 100,
      projet_id: 10,
      description: "Travail test",
      start_time: new Date().toISOString(),
      end_time: null,
    },
  });

  api.patch.mockResolvedValue({
    data: {
      id: 100,
      projet_id: 10,
      end_time: new Date().toISOString(),
    },
  });
});

afterEach(() => {
  clearAccessToken();
  localStorage.clear();
});

// Mock de useNavigate
describe("TimerContext", () => {
  test("charge clients et projets", async () => {
    render(
      <TimerProvider>
        <TestTimer />
      </TimerProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("clients-count").textContent).toBe("1");
    });

    await waitFor(() => {
      expect(screen.getByTestId("projets-count").textContent).toBe("1");
    });
  });

  test("démarre le timer", async () => {
    render(
      <TimerProvider>
        <TestTimer />
      </TimerProvider>,
    );

    fireEvent.click(screen.getByText("Set Client"));
    fireEvent.click(screen.getByText("Set Projet"));

    fireEvent.change(screen.getByTestId("description"), {
      target: { value: "Travail test" },
    });

    fireEvent.click(screen.getByText("Toggle"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/timer/start", {
        projet_id: 10,
        description: "Travail test",
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("running").textContent).toBe("true");
    });
  });

  test("arrête le timer", async () => {
    render(
      <TimerProvider>
        <TestTimer />
      </TimerProvider>,
    );

    fireEvent.click(screen.getByText("Set Client"));
    fireEvent.click(screen.getByText("Set Projet"));

    fireEvent.click(screen.getByText("Toggle"));

    await waitFor(() => {
      expect(screen.getByTestId("running").textContent).toBe("true");
    });

    fireEvent.click(screen.getByText("Toggle"));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/timer/stop");
    });

    await waitFor(() => {
      expect(screen.getByTestId("running").textContent).toBe("false");
    });
  });
});
