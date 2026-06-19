import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DesktopPrivacySettings from "./DesktopPrivacySettings";

describe("DesktopPrivacySettings", () => {
  beforeEach(() => {
    window.agentAPI = {
      getPrivacySettings: jest.fn().mockResolvedValue({
        trackingEnabled: true,
        interval: 30,
        ignoredApps: ["Outlook"],
        ignoredKeywords: ["banque"],
        lastCapturedActivity: {
          app_name: "Code",
          window_title: "MADSuite",
        },
        platform: "win32",
      }),
      setPrivacySettings: jest.fn().mockResolvedValue({ success: true, trackingEnabled: false }),
      setTrackingInterval: jest.fn().mockResolvedValue({ success: true }),
      deleteActivityHistory: jest.fn().mockResolvedValue({ success: true }),
    };
  });

  afterEach(() => {
    delete window.agentAPI;
  });

  test("affiche et sauvegarde les exclusions", async () => {
    const showToast = jest.fn();
    render(<DesktopPrivacySettings showToast={showToast} />);

    await screen.findByText("Confidentialité desktop");
    expect(screen.getByText("Code - MADSuite")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Activer le suivi des fenêtres"));
    fireEvent.change(screen.getByLabelText("Applications ignorées"), { target: { value: "Outlook\nTeams" } });
    fireEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));

    await waitFor(() => {
      expect(window.agentAPI.setPrivacySettings).toHaveBeenCalledWith({
        trackingEnabled: false,
        ignoredApps: ["Outlook", "Teams"],
        ignoredKeywords: ["banque"],
      });
    });
  });
});
