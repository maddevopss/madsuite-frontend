import { fireEvent, render, screen } from "@testing-library/react";

import ClientCard from "../components/clients/ClientCard";
import ClientStats from "../components/clients/ClientStats";
import ViewClientDetails from "../pages/Clients/ViewClientDetails";
import ViewProjectDetails from "../pages/Projets/ViewProjectDetails";
import ComingSoon from "../components/soon";
import ActivityChart from "../components/activityChart";
import TimesheetTimeline from "../pages/Timesheet/TimesheetTimeline";
import PreviewTable from "../pages/Reports/PreviewTable";
import { getClientsFromProjects, toDatetimeLocal } from "../pages/Users/users.utils";

describe("missing simple components coverage", () => {
  test("ClientStats affiche les valeurs avec fallback", () => {
    render(<ClientStats client={{ projets_total: 2, heures_total: 3.25, hourly_rate_defaut: 95 }} />);

    expect(screen.getByText("2 projets")).toBeInTheDocument();
    expect(screen.getByText("3.3 h")).toBeInTheDocument();
    expect(screen.getByText("95.00 $ / h")).toBeInTheDocument();
  });

  test("ClientCard affiche les informations et déclenche les actions", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const onAddProject = jest.fn();
    const client = { id: 7, nom: "Client Test", projets_total: 1, heures_total: 2, hourly_rate_defaut: 80 };

    render(<ClientCard client={client} onEdit={onEdit} onDelete={onDelete} onAddProject={onAddProject} />);

    expect(screen.getByText("Client Test")).toBeInTheDocument();
    expect(screen.getByText("Client #7")).toBeInTheDocument();

    fireEvent.click(screen.getByText("+ Projet"));
    fireEvent.click(screen.getByText("Modifier"));
    fireEvent.click(screen.getByText("Supprimer"));

    expect(onAddProject).toHaveBeenCalledWith(client);
    expect(onEdit).toHaveBeenCalledWith(client);
    expect(onDelete).toHaveBeenCalledWith(7);
  });

  test("ViewClientDetails affiche null sans client et les projets avec client", () => {
    const onClose = jest.fn();
    const { container, rerender } = render(<ViewClientDetails client={null} onClose={onClose} />);

    expect(container.firstChild).toBeNull();

    rerender(
      <ViewClientDetails
        onClose={onClose}
        client={{
          nom: "Client ABC",
          hourly_rate_defaut: 100,
          projets: [{ id: 1, nom: "Projet ABC", taux_horaire: 120, status: "actif", couleur: "#123456" }],
        }}
      />,
    );

    expect(screen.getByText("Client ABC")).toBeInTheDocument();
    expect(screen.getByText("Projet ABC")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Fermer"));
    expect(onClose).toHaveBeenCalled();
  });

  test("ViewProjectDetails affiche les détails et fallback", () => {
    const onClose = jest.fn();
    const { container, rerender } = render(<ViewProjectDetails project={null} onClose={onClose} />);

    expect(container.firstChild).toBeNull();

    rerender(
      <ViewProjectDetails
        onClose={onClose}
        project={{
          nom: "Projet X",
          client_nom: "Client X",
          status: "pause",
          taux_horaire: 110,
          budget: 5000,
          date_fin: "2026-06-06T00:00:00.000Z",
          couleur: "#abc",
          note: "Description projet",
          created_at: "2026-01-01T00:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByText("Projet X")).toBeInTheDocument();
    expect(screen.getByText("Client X")).toBeInTheDocument();
    expect(screen.getByText("Aucune description.")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Fermer"));
    expect(onClose).toHaveBeenCalled();
  });

  test("ComingSoon affiche le titre personnalisé", () => {
    render(<ComingSoon title="Module magique" />);

    expect(screen.getByText("Module magique")).toBeInTheDocument();
    expect(screen.getByText("En construction")).toBeInTheDocument();
    expect(screen.getByText(/lapins sous caféine/i)).toBeInTheDocument();
  });

  test("ActivityChart rend les libellés de jours et axes", () => {
    render(
      <ActivityChart svgPoints="0,90 50,40 100,70" svgFill="0,100 0,90 50,40 100,70 100,100" jours={["L", "M", "M"]} />,
    );

    expect(screen.getByText("Activité des 7 derniers jours")).toBeInTheDocument();
    expect(screen.getByText("8h")).toBeInTheDocument();
    expect(screen.getByText("6h")).toBeInTheDocument();
    expect(screen.getByText("L")).toBeInTheDocument();
  });

  test("TimesheetTimeline rend la barre quand les dates sont présentes", () => {
    const { container, rerender } = render(<TimesheetTimeline entry={{}} />);

    expect(container.firstChild).toBeNull();

    rerender(
      <TimesheetTimeline
        entry={{
          start_time: "2026-06-06T08:00:00",
          end_time: "2026-06-06T10:30:00",
          couleur: "#00ff00",
        }}
      />,
    );

    const bar = container.querySelector(".timeline-bar");
    expect(bar).toBeInTheDocument();
    expect(bar.style.width).toBeTruthy();
  });

  test("PreviewTable affiche empty state et tableau", () => {
    const { rerender } = render(<PreviewTable title="Aperçu" data={[]} />);

    expect(screen.getByText("Aperçu")).toBeInTheDocument();
    expect(screen.getByText("Aucune donnée.")).toBeInTheDocument();

    rerender(<PreviewTable title="Aperçu" data={[{ id: 1, nom: "Ligne", meta: { ok: true }, vide: null }]} />);

    expect(screen.getByText("nom")).toBeInTheDocument();
    expect(screen.getByText("Ligne")).toBeInTheDocument();
    expect(screen.getByText(JSON.stringify({ ok: true }))).toBeInTheDocument();
    expect(screen.getByText("null")).toBeInTheDocument();
  });

  test("users.utils formate les dates et déduplique les clients", () => {
    expect(toDatetimeLocal(null)).toBe("");
    expect(toDatetimeLocal("pas-une-date")).toBe("");
    expect(toDatetimeLocal("2026-06-06T13:05:00.000Z")).toMatch(/^2026-06-06T/);

    expect(
      getClientsFromProjects([
        { client_id: 1, client: "Client A" },
        { client_id: 1, client: "Client A bis" },
        { client_id: 2, client_nom: "Client B" },
      ]),
    ).toEqual([
      { id: 1, nom: "Client A bis" },
      { id: 2, nom: "Client B" },
    ]);
  });
});
