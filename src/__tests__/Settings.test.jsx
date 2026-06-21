import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Settings from "../pages/Settings";
import { useSettings } from "../hooks/useSettings";
import { AuthProvider } from "../api/authContext";
import { clearAccessToken, setAccessToken } from "../api/tokenStore";

jest.mock("../hooks/useSettings");

jest.mock("../ToastContext", () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

jest.mock("../pages/Settings/SettingsHeader", () => () => <h1>Paramètres</h1>);

jest.mock("../pages/Settings/SettingsUserCard", () => (props) => (
  <div>
    <h2>Utilisateur</h2>
    <span>{props.user?.nom}</span>
  </div>
));

jest.mock("../pages/Settings/SettingsPreferencesCard", () => () => (
  <div>
    <h2>Préférences</h2>
  </div>
));

jest.mock("../pages/Settings/SettingsGeneral", () => () => (
  <div>
    <h2>Général</h2>
  </div>
));

beforeEach(() => {
  jest.clearAllMocks();
  setAccessToken("fake-token");
  jest.spyOn(require("../api/authContext"), "useAuth").mockReturnValue({
    user: {
      id: 1,
      nom: "User Test",
      role: "admin",
    },
    token: "fake-token",
  });

  useSettings.mockReturnValue({
    settings: {
      theme: "light",
      language: "fr",
    },
    updateSetting: jest.fn(),
    saveSettings: jest.fn(),
  });
});

afterEach(() => {
  clearAccessToken();
  localStorage.clear();
});

describe("Settings page", () => {
  test("affiche les paramètres", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Settings />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("Paramètres")).toBeInTheDocument();
    expect(screen.getByText("Utilisateur")).toBeInTheDocument();
    expect(screen.getByText("User Test")).toBeInTheDocument();
    expect(screen.getByText("Général")).toBeInTheDocument();
  });

  test("charge les settings", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Settings />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(useSettings).toHaveBeenCalled();
  });
});
