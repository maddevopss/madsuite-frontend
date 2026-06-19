import { render, screen } from "@testing-library/react";
import PreviewTable from "../pages/Reports/PreviewTable";

describe("PreviewTable", () => {
  test("affiche état vide", () => {
    render(<PreviewTable timeEntries={[]} activityLogs={[]} windowsLogs={[]} loadingDebug={false} />);

    const emptyStates = screen.getAllByText(/aucune donnée/i);

    expect(emptyStates.length).toBeGreaterThan(0);
  });

  test("gère loadingDebug", () => {
    render(<PreviewTable timeEntries={[]} activityLogs={[]} windowsLogs={[]} loadingDebug={true} />);

    const emptyStates = screen.getAllByText(/aucune donnée/i);

    expect(emptyStates.length).toBeGreaterThan(0);
  });
});
