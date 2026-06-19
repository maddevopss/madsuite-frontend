import { render, screen, fireEvent } from "@testing-library/react";
import TimesheetEntry from "./TimesheetEntry";

const mockRestartProject = jest.fn();

jest.mock("../../TimerContext", () => ({
  useTimer: () => ({
    restartProject: mockRestartProject,
  }),
}));

const entry = {
  id: 1,
  client: "Client Test",
  projet: "Projet Test",
  utilisateur: "User Test",
  description: "Travail test",
  heures: 0.5,
  is_billed: false,
  start_time: "2026-05-18T09:00:00.000Z",
  end_time: "2026-05-18T09:30:00.000Z",
  projet_id: 10,
  client_id: 1,
  projet_couleur: "#1884df",
};

describe("TimesheetEntry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("affiche les informations de l'entrée", () => {
    render(<TimesheetEntry entry={entry} onToggleBilled={jest.fn()} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("Client Test")).toBeInTheDocument();
    expect(screen.getByText("Projet Test")).toBeInTheDocument();
    expect(screen.getByText("Travail test")).toBeInTheDocument();
    expect(screen.getByText("0.50h")).toBeInTheDocument();
  });

  test("affiche les badges non facturée et minimum 30 min", () => {
    render(<TimesheetEntry entry={entry} onToggleBilled={jest.fn()} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("Non facturée")).toBeInTheDocument();
    expect(screen.getByText("Minimum 30 min")).toBeInTheDocument();
  });

  test("affiche le badge facturée", () => {
    render(
      <TimesheetEntry
        entry={{
          ...entry,
          is_billed: true,
        }}
        onToggleBilled={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("Facturée")).toBeInTheDocument();
  });

  test("affiche une entrée réservée et désactive sa facturation manuelle", () => {
    render(
      <TimesheetEntry
        entry={{ ...entry, invoice_id: 42 }}
        onToggleBilled={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("Réservée dans un brouillon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Facturer" })).toBeDisabled();
  });

  test("appelle reprendre avec le bon projet", () => {
    render(<TimesheetEntry entry={entry} onToggleBilled={jest.fn()} onEdit={jest.fn()} onDelete={jest.fn()} />);

    fireEvent.click(screen.getByText("Reprendre"));

    expect(mockRestartProject).toHaveBeenCalledWith({
      projet_id: 10,
      client_id: 1,
      description: "Travail test",
      projet_nom: "Projet Test",
      client_nom: "Client Test",
      projet_couleur: "#1884df",
    });
  });

  test("appelle les actions", () => {
    const onToggleBilled = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(<TimesheetEntry entry={entry} onToggleBilled={onToggleBilled} onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByText("Facturer"));
    fireEvent.click(screen.getByText("Modifier"));
    fireEvent.click(screen.getByText("Supprimer"));

    expect(onToggleBilled).toHaveBeenCalledWith(entry);
    expect(onEdit).toHaveBeenCalledWith(entry);
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
