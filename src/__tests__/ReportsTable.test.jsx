import { render, screen } from "@testing-library/react";
import ReportsTable from "../pages/Reports/ReportsTable";

describe("ReportsTable", () => {
  const rows = [
    {
      client: "Client Test",
      projet: "Projet Test",
      utilisateur: "User Test",
      heures: 3,
      heures_facturables: 2,
      montant_estime: 180,
      montant_facture: 120,
    },
  ];

  const total = {
    heures: 3,
    heures_facturables: 2,
    montant_estime: 180,
    montant_facture: 120,
  };

  test("affiche lignes", () => {
    render(<ReportsTable rows={rows} total={total} />);

    expect(screen.getByText("Client Test")).toBeInTheDocument();
  });

  test("affiche état vide", () => {
    render(<ReportsTable rows={[]} total={total} />);

    expect(screen.getByText("Aucune donnée")).toBeInTheDocument();
  });
});
