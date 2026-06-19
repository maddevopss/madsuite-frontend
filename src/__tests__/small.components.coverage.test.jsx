import { render, screen, fireEvent } from "@testing-library/react";

import ConfirmModal from "../components/ui/Modal/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/PageHeader/PageHeader";
import StatCard from "../components/ui/StatCard/StatCard";

jest.mock("../routes/ProtectedRoute", () => {
  return function MockProtectedRoute({ children }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});
jest.mock(
  "react-router-dom",
  () => ({
    Outlet: () => <div data-testid="outlet">Outlet</div>,
  }),
  { virtual: true },
);

import Layout from "../components/Layout";

jest.mock("../components/Header", () => () => <header>Header mock</header>);
jest.mock("../components/Sidebar", () => () => <aside>Sidebar mock</aside>);
jest.mock("../components/activity-intelligence/ActivitySuggestionPopup", () => () => <div>Suggestion popup mock</div>);

jest.mock("../TimerContext", () => ({
  useTimer: jest.fn(),
}));

const { useTimer } = require("../TimerContext");

describe("Small UI components", () => {
  beforeEach(() => {
    useTimer.mockReturnValue({ isRunning: false, elapsedFormatted: "00:00:00", activeEntry: null });
  });

  test("ConfirmModal ne rend rien quand fermé", () => {
    const { container } = render(
      <ConfirmModal isOpen={false} message="Confirmer ?" onConfirm={jest.fn()} onCancel={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("ConfirmModal déclenche confirmer et annuler", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    render(<ConfirmModal isOpen message="Supprimer ?" onConfirm={onConfirm} onCancel={onCancel} danger={false} />);

    fireEvent.click(screen.getByRole("button", { name: /confirmer/i }));
    fireEvent.click(screen.getByRole("button", { name: /annuler/i }));

    expect(onConfirm).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  test("EmptyState affiche titre, message et action", () => {
    render(<EmptyState title="Vide" message="Rien ici" action={<button>Créer</button>} />);

    expect(screen.getByText("Vide")).toBeInTheDocument();
    expect(screen.getByText("Rien ici")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /créer/i })).toBeInTheDocument();
  });

  test("StatCard affiche label, valeur et sous-texte", () => {
    render(<StatCard label="Heures" value="12h" sub="Cette semaine" />);

    expect(screen.getByText("Heures")).toBeInTheDocument();
    expect(screen.getByText("12h")).toBeInTheDocument();
    expect(screen.getByText("Cette semaine")).toBeInTheDocument();
  });

  test("PageHeader affiche le timer actif", () => {
    useTimer.mockReturnValue({
      isRunning: true,
      elapsedFormatted: "01:02:03",
      activeEntry: {
        client_nom: "Client A",
        projet_nom: "Projet B",
        projet_couleur: "#123456",
      },
    });

    render(<PageHeader title="Titre" subtitle="Sous-titre" action={<button>Action</button>} />);

    expect(screen.getByText("01:02:03")).toBeInTheDocument();
    expect(screen.getByText("Client A / Projet B")).toBeInTheDocument();
    expect(screen.getByText("Titre")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /action/i })).toBeInTheDocument();
  });

  test("Layout affiche les zones principales", () => {
    render(<Layout />);

    expect(screen.getByText("Header mock")).toBeInTheDocument();
    expect(screen.getByText("Sidebar mock")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });
});
