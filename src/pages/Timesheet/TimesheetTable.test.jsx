import { render, screen, fireEvent } from "@testing-library/react";
import TimesheetTable from "./TimesheetTable";

jest.mock("../../TimerContext", () => ({
  useTimer: () => ({
    resumeProject: jest.fn(),
  }),
}));

const entries = [
  {
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
  },
];

describe("TimesheetTable", () => {
  test("affiche le loading", () => {
    render(
      <TimesheetTable
        entries={[]}
        loading={true}
        totalHeures={0}
        onToggleBilled={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  test("affiche le message vide", () => {
    render(
      <TimesheetTable
        entries={[]}
        loading={false}
        totalHeures={0}
        onToggleBilled={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText("Aucune entrée cette semaine.")).toBeInTheDocument();
  });

  test("affiche une entrée", () => {
    render(
      <TimesheetTable
        entries={entries}
        loading={false}
        totalHeures={0.5}
        onToggleBilled={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText("Client Test")).toBeInTheDocument();
    expect(screen.getByText("Projet Test")).toBeInTheDocument();
    expect(screen.getByText("Travail test")).toBeInTheDocument();
  });

  test("appelle modifier et supprimer", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <TimesheetTable
        entries={entries}
        loading={false}
        totalHeures={0.5}
        onToggleBilled={jest.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByText("Modifier"));
    fireEvent.click(screen.getByText("Supprimer"));

    expect(onEdit).toHaveBeenCalledWith(entries[0]);
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
