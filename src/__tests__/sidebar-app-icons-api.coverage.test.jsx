import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockOnLogout = jest.fn();
let mockAuthUser = { nom: "Admin MAD", role: "admin" };

jest.mock(
  "react-router-dom",
  () => ({
    BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
    Routes: ({ children }) => <div data-testid="routes">{children}</div>,
    Route: ({ element }) => <div data-testid="route">{element}</div>,
    Navigate: ({ to }) => <div>Navigate:{to}</div>,
    NavLink: ({ to, children, className }) => (
      <a href={to} className={typeof className === "function" ? className({ isActive: false }) : className}>
        {children}
      </a>
    ),
    Outlet: () => <div data-testid="outlet">Outlet</div>,
    useNavigate: () => jest.fn(),
  }),
  { virtual: true },
);

jest.mock(
  "framer-motion",
  () => ({
    AnimatePresence: ({ children }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
  }),
  { virtual: true },
);

jest.mock("../api/authContext", () => ({
  useAuth: () => ({ user: mockAuthUser, onLogout: mockOnLogout }),
}));
jest.mock("../TimerContext", () => ({
  useTimer: () => ({
    isRunning: false,
    elapsedFormatted: "00:00:00",
    activeEntry: null,
  }),
}));

jest.mock("../components/Layout", () => () => <div>Layout mock</div>);
jest.mock("../routes/ProtectedRoute", () => () => <div>ProtectedRoute mock</div>);
jest.mock("../pages/Login", () => () => <div>Login mock</div>);
jest.mock("../pages/Dashboard", () => () => <div>Dashboard mock</div>);
jest.mock("../pages/Users", () => () => <div>Users mock</div>);
jest.mock("../pages/Reports", () => () => <div>Reports mock</div>);
jest.mock("../pages/Timesheet", () => () => <div>Timesheet mock</div>);
jest.mock("../pages/Clients", () => () => <div>Clients mock</div>);
jest.mock("../pages/Projets", () => () => <div>Projets mock</div>);
jest.mock("../pages/Settings", () => () => <div>Settings mock</div>);
jest.mock("../pages/Invoices", () => () => <div>Invoices mock</div>);
jest.mock("../pages/Innovation/Innovation", () => () => <div>Innovation mock</div>);
jest.mock("../components/soon", () => ({ title }) => <div>{title}</div>);

import App from "../pages/App";
import Sidebar from "../components/Sidebar";
import DashboardIcon from "../assets/Icon/DashboardIcon";
import KmIcon from "../assets/Icon/KmIcon";
import MobpunchIcon from "../assets/Icon/MobpunchIcon";
import PauseIcon from "../assets/Icon/PauseIcon";
import PlayIcon from "../assets/Icon/Play";
import ReportsIcon from "../assets/Icon/ReportsIcon";
import TimeIcon from "../assets/Icon/TimeIcon";
import UserIcon from "../assets/Icon/UserIcon";

describe("sidebar, app and icons coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthUser = { nom: "Admin MAD", role: "admin" };
    delete process.env.VITE_ENABLE_V1_NON_CORE_FEATURES;
    delete window.agentAPI;
  });

  test("Sidebar affiche les liens et déconnecte", () => {
    process.env.VITE_ENABLE_V1_NON_CORE_FEATURES = "false";

    render(<Sidebar />);

    expect(screen.getByText("Gestion du temps")).toBeInTheDocument();
    expect(screen.getByText("Admin MAD")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("Tableau de bord")).toBeInTheDocument();
    expect(screen.getByText("Facturation")).toBeInTheDocument();
    expect(screen.queryByText("Assistant Facture")).not.toBeInTheDocument();
    expect(screen.queryByText("Innovation IA")).not.toBeInTheDocument();
    expect(screen.queryByText("MobilePunch")).not.toBeInTheDocument();
    expect(screen.queryByText("Calcul du km")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Déconnexion"));
    expect(mockOnLogout).toHaveBeenCalled();
  });

  test("Sidebar masque le module innovation pour non-admin", () => {
    process.env.VITE_ENABLE_V1_NON_CORE_FEATURES = "true";
    mockAuthUser = { nom: "Employe MAD", role: "employe" };

    render(<Sidebar />);

    expect(screen.queryByText("TEAM")).not.toBeInTheDocument();
    expect(screen.queryByText("Innovation IA")).not.toBeInTheDocument();
  });

  test("App rend les routes et nettoie le listener agentAPI", async () => {
    const cleanup = jest.fn();
    window.agentAPI = {
      onAppClose: jest.fn(() => cleanup),
    };

    let unmount;
    await act(async () => {
      ({ unmount } = render(<App />));
      await Promise.resolve();
    });

    expect(screen.getByTestId("browser-router")).toBeInTheDocument();
    await waitFor(() => expect(window.agentAPI.onAppClose).toHaveBeenCalled());

    await act(async () => {
      unmount();
      await Promise.resolve();
    });
    expect(cleanup).toHaveBeenCalled();
  });

  test("les icônes rendent un svg", () => {
    const icons = [DashboardIcon, KmIcon, MobpunchIcon, PauseIcon, PlayIcon, ReportsIcon, TimeIcon, UserIcon];

    icons.forEach((Icon) => {
      const { container, unmount } = render(<Icon className="test-icon" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
      unmount();
    });
  });
});
