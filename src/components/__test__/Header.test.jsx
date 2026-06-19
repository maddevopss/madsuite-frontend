import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Header from "../Header";
import { useTimer } from "../../TimerContext";
import api from "../../api/api";

jest.mock("../../TimerContext", () => ({
  useTimer: jest.fn(),
}));

jest.mock("../../api/api", () => ({
  get: jest.fn(),
}));

jest.mock("../../assets/logo.png", () => "logo.png");

jest.mock("../../assets/Icon/idx_icon", () => ({
  PlayIcon: () => <span data-testid="play-icon">Play</span>,
  PauseIcon: () => <span data-testid="pause-icon">Pause</span>,
}));

jest.mock("../activity-intelligence/ActivitySuggestionBadge", () => {
  return function MockActivitySuggestionBadge() {
    return <div data-testid="activity-suggestion-badge" />;
  };
});

function makeTimerContext(overrides = {}) {
  return {
    isRunning: false,
    description: "",
    setDescription: jest.fn(),
    selectedClient: "",
    setSelectedClient: jest.fn(),
    selectedProjet: "",
    setSelectedProjet: jest.fn(),
    clients: [],
    projetsFiltres: [],
    toggleTimer: jest.fn(),
    elapsedFormatted: "00:00:00",
    setProjets: jest.fn(),
    activeEntry: null,
    todayProjects: [],
    resumeProject: jest.fn(),
    note: "",
    updateNote: jest.fn(),
    setNote: jest.fn(),
    isLongRunning: false,
    activeTimerWarning: null,
    stopActiveTimer: jest.fn(),
    ...overrides,
  };
}

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    api.get.mockResolvedValue({
      data: [],
    });
  });

  test("affiche le bouton play quand aucun timer ne roule", async () => {
    useTimer.mockReturnValue(
      makeTimerContext({
        isRunning: false,
        selectedProjet: "",
      }),
    );

    render(<Header />);

    expect(screen.getByTestId("play-icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /play/i })).toBeDisabled();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/timesheet/projets");
    });
  });

  test("affiche le bouton pause quand le timer roule", () => {
    useTimer.mockReturnValue(
      makeTimerContext({
        isRunning: true,
        activeEntry: {
          id: 1,
          client_nom: "Client Test",
          projet_nom: "Projet Test",
          projet_couleur: "#38bdf8",
        },
      }),
    );

    render(<Header />);

    expect(screen.getByTestId("pause-icon")).toBeInTheDocument();
    expect(screen.getByText("Client Test / Projet Test")).toBeInTheDocument();
  });

  test("affiche l'alerte long timer et le bouton Terminer maintenant", () => {
    const stopActiveTimer = jest.fn();

    useTimer.mockReturnValue(
      makeTimerContext({
        isRunning: true,
        isLongRunning: true,
        activeTimerWarning: "Timer en cours depuis plus de 8 heures. Vérifie si tu l'as oublié.",
        stopActiveTimer,
        activeEntry: {
          id: 1,
          client_nom: "Client Test",
          projet_nom: "Projet Test",
          projet_couleur: "#f59e0b",
        },
      }),
    );

    render(<Header />);

    expect(screen.getByText(/Timer en cours depuis plus de 8 heures/i)).toBeInTheDocument();

    const stopButton = screen.getByRole("button", {
      name: /terminer maintenant/i,
    });

    expect(stopButton).toBeInTheDocument();

    fireEvent.click(stopButton);

    expect(stopActiveTimer).toHaveBeenCalledTimes(1);
  });

  test("n'affiche pas l'alerte long timer si isLongRunning est false", () => {
    useTimer.mockReturnValue(
      makeTimerContext({
        isRunning: true,
        isLongRunning: false,
        activeTimerWarning: "Timer en cours depuis plus de 8 heures.",
        activeEntry: {
          id: 1,
          client_nom: "Client Test",
          projet_nom: "Projet Test",
        },
      }),
    );

    render(<Header />);

    expect(screen.queryByText(/Timer en cours depuis plus de 8 heures/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /terminer maintenant/i })).not.toBeInTheDocument();
  });

  test("affiche la note rapide quand le timer roule et sauvegarde la note", () => {
    const setNote = jest.fn();
    const updateNote = jest.fn();

    useTimer.mockReturnValue(
      makeTimerContext({
        isRunning: true,
        note: "Note initiale",
        setNote,
        updateNote,
        activeEntry: {
          id: 1,
          client_nom: "Client Test",
          projet_nom: "Projet Test",
        },
      }),
    );

    render(<Header />);

    const noteInput = screen.getByPlaceholderText(/note rapide sur le timer actif/i);

    expect(noteInput).toBeInTheDocument();
    expect(noteInput).toHaveValue("Note initiale");

    fireEvent.change(noteInput, {
      target: {
        value: "Nouvelle note",
      },
    });

    expect(setNote).toHaveBeenCalledWith("Nouvelle note");

    fireEvent.click(screen.getByRole("button", { name: /sauvegarder/i }));

    expect(updateNote).toHaveBeenCalledWith("Note initiale");
  });

  test("affiche les projets à reprendre quand aucun timer ne roule", () => {
    const resumeProject = jest.fn();

    useTimer.mockReturnValue(
      makeTimerContext({
        isRunning: false,
        todayProjects: [
          {
            projet_id: 10,
            client_nom: "Client A",
            projet_nom: "Projet A",
            projet_couleur: "#22c55e",
          },
        ],
        resumeProject,
      }),
    );

    render(<Header />);

    const resumeButton = screen.getByRole("button", {
      name: /reprendre client a \/ projet a/i,
    });

    expect(resumeButton).toBeInTheDocument();

    fireEvent.click(resumeButton);

    expect(resumeProject).toHaveBeenCalledWith({
      projet_id: 10,
      client_nom: "Client A",
      projet_nom: "Projet A",
      projet_couleur: "#22c55e",
    });
  });
});
