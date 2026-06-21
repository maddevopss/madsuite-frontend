import { render, screen, waitFor } from "@testing-library/react";
import ActivitySummary from "../ActivitySummary";
import api from "../../../api/api";

jest.mock("../../../api/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock("recharts", () => ({
  Bar: () => <div data-testid="bar" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Tooltip: () => <div data-testid="tooltip" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
}));

const emptySummaryResponse = { data: [] };

beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockResolvedValue(emptySummaryResponse);
});

describe("ActivitySummary Component", () => {
  test("charge le résumé au montage et affiche l'état vide", async () => {
    render(<ActivitySummary />);

    expect(screen.getByText("Résumé d'activité")).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/activity/summary", expect.objectContaining({ params: expect.any(Object) }));
    });

    expect(await screen.findByText("Aucune activité trouvée pour cette période.")).toBeInTheDocument();
  });

  test("affiche les applications productives et les distractions", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { app_name: "VS Code", category: "productif", total_seconds: 7200 },
        { app_name: "YouTube", category: "distraction", total_seconds: 3600 },
        { app_name: "Chrome", category: "neutre", total_seconds: 1800 },
      ],
    });

    render(<ActivitySummary />);

    expect(await screen.findByText("VS Code")).toBeInTheDocument();
    expect(screen.getByText("YouTube")).toBeInTheDocument();
    expect(screen.getByText("Neutre")).toBeInTheDocument();
    expect(screen.getByText("Score de productivité")).toBeInTheDocument();
    expect(screen.getByText((_, node) => node?.textContent === "57%")).toBeInTheDocument();
  });

  test("affiche une erreur quand le chargement échoue", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    api.get.mockRejectedValueOnce(new Error("fail"));

    render(<ActivitySummary />);

    expect(await screen.findByText("Impossible de charger le résumé d'activité.")).toBeInTheDocument();

    const unexpectedConsoleErrors = consoleErrorSpy.mock.calls.filter(
      ([firstArg]) => !String(firstArg).includes("Erreur chargement activity summary:"),
    );

    expect(unexpectedConsoleErrors).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Erreur chargement activity summary:", expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  test("ignore proprement un rate limit 429", async () => {
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    api.get.mockRejectedValueOnce({ response: { status: 429 } });

    render(<ActivitySummary />);

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith("Activity summary rate limited.");
    });

    expect(screen.queryByText("Impossible de charger le résumé d'activité.")).not.toBeInTheDocument();

    consoleWarnSpy.mockRestore();
  });
});
