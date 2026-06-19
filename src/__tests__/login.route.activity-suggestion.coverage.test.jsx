import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import Login from "../pages/Login";
import ProtectedRoute from "../routes/ProtectedRoute";
import ActivitySuggestionBadge from "../components/activity-intelligence/ActivitySuggestionBadge";
import ActivitySuggestionPopup from "../components/activity-intelligence/ActivitySuggestionPopup";

import authService from "../api/authService";
import { useAuth } from "../api/authContext";
import { useTimer } from "../TimerContext";
import { useActivitySuggestionContext } from "../components/activity-intelligence/ActivitySuggestionContext";

const mockNavigate = jest.fn();
const mockGetToken = jest.fn();
const mockSetToken = jest.fn();
const mockClearToken = jest.fn();

const mockReloadTimerData = jest.fn();
const mockRestartProject = jest.fn();
const mockOnLogin = jest.fn();
const mockDismissSuggestion = jest.fn();

jest.mock(
  "react-router-dom",
  () => ({
    MemoryRouter: ({ children }) => <div data-testid="memory-router">{children}</div>,
    Navigate: ({ to }) => <div>Navigate:{to}</div>,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
    Outlet: () => <div data-testid="outlet">Outlet</div>,
  }),
  { virtual: true },
);

jest.mock("../api/tokenStore", () => ({
  getToken: () => mockGetToken(),
  setToken: (...args) => mockSetToken(...args),
  clearToken: (...args) => mockClearToken(...args),
}));

jest.mock("../api/authService", () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock("../api/authContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../TimerContext", () => ({
  useTimer: jest.fn(),
}));

jest.mock("../components/activity-intelligence/ActivitySuggestionContext", () => ({
  useActivitySuggestionContext: jest.fn(),
}));

function fillLoginForm(container, email, password) {
  const emailInput = container.querySelector('input[type="email"]');
  const passwordInput = container.querySelector('input[type="password"]');

  fireEvent.change(emailInput, { target: { value: email } });
  fireEvent.change(passwordInput, { target: { value: password } });
}

describe("Login, ProtectedRoute and activity suggestions", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    localStorage.clear();
    sessionStorage.clear();

    mockGetToken.mockReturnValue(null);

    useAuth.mockReturnValue({
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      onLogin: mockOnLogin,
    });

    useTimer.mockReturnValue({
      reloadTimerData: mockReloadTimerData,
      restartProject: mockRestartProject,
    });

    useActivitySuggestionContext.mockReturnValue({
      suggestion: null,
      dismissSuggestion: mockDismissSuggestion,
    });
  });

  test("Login affiche et efface le message de sessionStorage", () => {
    sessionStorage.setItem("auth_notice", "Session expirée");

    render(<Login />);

    expect(screen.getByText("Session expirée")).toBeInTheDocument();
    expect(sessionStorage.getItem("auth_notice")).toBeNull();
  });

  test("Login connecte et navigue vers dashboard", async () => {
    authService.login.mockResolvedValue({
      token: "fake-token",
      user: {
        id: 1,
        nom: "Admin Test",
        role: "admin",
      },
    });

    mockReloadTimerData.mockResolvedValue();

    const { container } = render(<Login />);

    fillLoginForm(container, "admin@test.com", "Password123!");

    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith("admin@test.com", "Password123!");
    });

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });

    expect(mockReloadTimerData).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  test("Login affiche une erreur API", async () => {
    authService.login.mockRejectedValue({
      response: {
        data: {
          message: "Utilisateur invalide",
        },
      },
    });

    const { container } = render(<Login />);

    fillLoginForm(container, "bad@test.com", "bad");

    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText("Utilisateur invalide")).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  test("ProtectedRoute redirige sans token", () => {
    mockGetToken.mockReturnValue(null);

    useAuth.mockReturnValue({
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      onLogin: mockOnLogin,
    });

    render(<ProtectedRoute />);

    expect(screen.getByText("Navigate:/login")).toBeInTheDocument();
  });

  test("ProtectedRoute affiche Outlet avec token", () => {
    mockGetToken.mockReturnValue("fake-token");

    useAuth.mockReturnValue({
      user: {
        id: 1,
        nom: "Admin Test",
        role: "admin",
      },
      token: "fake-token",
      loading: false,
      isAuthenticated: true,
      onLogin: mockOnLogin,
    });

    render(<ProtectedRoute />);

    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  test("ActivitySuggestionBadge ne rend rien sans suggestion", () => {
    const { container } = render(<ActivitySuggestionBadge suggestion={null} />);

    expect(container.firstChild).toBeNull();
  });

  test("ActivitySuggestionPopup permet de reprendre ou ignorer", () => {
    useActivitySuggestionContext.mockReturnValue({
      suggestion: {
        activity: {
          icon: "💻",
        },
        project: {
          id: 12,
          nom: "Projet Test",
        },
        source: {
          app_name: "VS Code",
        },
      },
      dismissSuggestion: mockDismissSuggestion,
    });

    render(<ActivitySuggestionPopup />);

    expect(screen.getByText("💻")).toBeInTheDocument();
    expect(screen.getByText("Projet Test")).toBeInTheDocument();
    expect(screen.getByText("VS Code")).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");

    expect(buttons.length).toBeGreaterThan(0);

    fireEvent.click(buttons[0]);
    expect(mockRestartProject).toHaveBeenCalled();
  });
});
