import { fireEvent, render, screen } from "@testing-library/react";

import TimesheetStats from "../pages/Timesheet/TimesheetStats";
import TimesheetWeekStats from "../pages/Timesheet/TimesheetWeekStats";
import TimesheetHeader from "../pages/Timesheet/TimesheetHeader";
import TimesheetFilters from "../pages/Timesheet/TimesheetFilters";
import ReportsHeader from "../pages/Reports/ReportsHeader";
import SettingsGeneral from "../pages/Settings/SettingsGeneral";
import SettingsHeader from "../pages/Settings/SettingsHeader";
import SettingsPreferencesCard from "../pages/Settings/SettingsPreferencesCard";
import SettingsUserCard from "../pages/Settings/SettingsUserCard";

const mockFormatTime = jest.fn((seconds) => `${seconds}s`);

jest.mock("../TimerContext", () => ({
  useTimer: () => ({ formatTime: mockFormatTime }),
}));

jest.mock("../ToastContext", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

describe("timesheet, reports and settings missing coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("TimesheetStats retourne null sans stats et affiche les stats", () => {
    const { container, rerender } = render(<TimesheetStats stats={null} />);

    expect(container.firstChild).toBeNull();

    rerender(
      <TimesheetStats
        stats={{
          today: "1 h",
          billable: "30 min",
          projects: 3,
        }}
      />,
    );

    expect(screen.getByText("Aujourd'hui")).toBeInTheDocument();
    expect(screen.getByText("Facturable")).toBeInTheDocument();
    expect(screen.getByText("Projets")).toBeInTheDocument();
  });

  test("TimesheetWeekStats retourne null sans stats", () => {
    const { container } = render(<TimesheetWeekStats weekStats={null} />);

    expect(container.firstChild).toBeNull();
  });

  test("TimesheetHeader déclenche navigation de semaine", () => {
    const onPrevWeek = jest.fn();
    const onNextWeek = jest.fn();

    render(<TimesheetHeader weekDate="2026-06-06" onPrevWeek={onPrevWeek} onNextWeek={onNextWeek} />);

    fireEvent.click(screen.getByText("<"));
    fireEvent.click(screen.getByText(">"));

    expect(onPrevWeek).toHaveBeenCalled();
    expect(onNextWeek).toHaveBeenCalled();
  });

  test("TimesheetFilters met à jour les filtres et ouvre l'ajout", () => {
    const setFilterClient = jest.fn();
    const setFilterBilled = jest.fn();
    const onAdd = jest.fn();

    render(
      <TimesheetFilters
        clients={[{ id: 1, nom: "Client A" }]}
        filterClient=""
        setFilterClient={setFilterClient}
        filterBilled=""
        setFilterBilled={setFilterBilled}
        onAdd={onAdd}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("Tous les clients"), { target: { value: "1" } });
    fireEvent.change(screen.getByDisplayValue("Tous les statuts"), { target: { value: "true" } });
    fireEvent.click(screen.getByText("+ Ajouter"));

    expect(setFilterClient).toHaveBeenCalledWith("1");
    expect(setFilterBilled).toHaveBeenCalledWith("true");
    expect(onAdd).toHaveBeenCalled();
  });

  test("ReportsHeader met à jour les filtres et lance les exports", () => {
    const props = {
      period: "week",
      setPeriod: jest.fn(),
      groupBy: "",
      setGroupBy: jest.fn(),
      isBilled: "",
      setIsBilled: jest.fn(),
      onExportCSV: jest.fn(),
      onExportPDF: jest.fn(),
      onToggleTimeEntries: jest.fn(),
      onToggleActivityLogs: jest.fn(),
      onToggleWindowsLogs: jest.fn(),
    };

    render(<ReportsHeader {...props} />);

    fireEvent.change(screen.getByDisplayValue("Cette semaine"), { target: { value: "month" } });
    fireEvent.change(screen.getByDisplayValue("Sans groupement"), { target: { value: "week" } });
    fireEvent.change(screen.getByDisplayValue("Tous"), { target: { value: "false" } });

    fireEvent.click(screen.getByText("Export CSV"));
    fireEvent.click(screen.getByText("Export PDF"));
    fireEvent.click(screen.getByText("time_entries"));
    fireEvent.click(screen.getByText("activity_logs"));
    fireEvent.click(screen.getByText("windows_logs"));

    expect(props.setPeriod).toHaveBeenCalledWith("month");
    expect(props.setGroupBy).toHaveBeenCalledWith("week");
    expect(props.setIsBilled).toHaveBeenCalledWith("false");
    expect(props.onExportCSV).toHaveBeenCalled();
    expect(props.onExportPDF).toHaveBeenCalled();
    expect(props.onToggleTimeEntries).toHaveBeenCalled();
    expect(props.onToggleActivityLogs).toHaveBeenCalled();
    expect(props.onToggleWindowsLogs).toHaveBeenCalled();
  });

  test("Settings components affichent et mettent à jour les valeurs", () => {
    const updateSetting = jest.fn();
    const onSave = jest.fn();

    render(
      <SettingsGeneral
        settings={{
          companyName: "MADSuite",
          defaultRate: 90,
          theme: "dark",
          autoPauseEnabled: true,
          idleWarningSeconds: 300,
          idleAutoPauseSeconds: 600,
        }}
        updateSetting={updateSetting}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Nom de l'entreprise"), { target: { value: "MAD Inc" } });
    fireEvent.change(screen.getByPlaceholderText("Taux horaire par défaut"), { target: { value: "100" } });
    fireEvent.change(screen.getByDisplayValue("Sombre"), { target: { value: "light" } });
    fireEvent.click(screen.getByLabelText(/Auto-pause/i));
    fireEvent.change(screen.getByPlaceholderText("Alerte inactivité (secondes)"), { target: { value: "420" } });
    fireEvent.click(screen.getByText("Sauvegarder"));

    expect(updateSetting).toHaveBeenCalledWith("companyName", "MAD Inc");
    expect(updateSetting).toHaveBeenCalledWith("defaultRate", 100);
    expect(updateSetting).toHaveBeenCalledWith("theme", "light");
    expect(updateSetting).toHaveBeenCalledWith("autoPauseEnabled", false);
    expect(updateSetting).toHaveBeenCalledWith("idleWarningSeconds", 420);
    expect(onSave).toHaveBeenCalled();
  });

  test("SettingsHeader, PreferencesCard et UserCard affichent leur contenu", () => {
    render(
      <>
        <SettingsHeader />
        <SettingsPreferencesCard companyName="MAD Company" defaultRate={123} />
        <SettingsUserCard user={{ nom: "Admin MAD", role: "admin" }} theme="dark" />
        <SettingsUserCard user={null} theme="light" />
      </>,
    );

    expect(screen.getByText("Paramètres")).toBeInTheDocument();
    expect(screen.getByText("MAD Company")).toBeInTheDocument();
    expect(screen.getByText("Taux défaut : 123.00$ / h")).toBeInTheDocument();
    expect(screen.getByText("Admin MAD")).toBeInTheDocument();
    expect(screen.getByText("Rôle : admin")).toBeInTheDocument();
    expect(screen.getByText("Utilisateur inconnu")).toBeInTheDocument();
  });
});
