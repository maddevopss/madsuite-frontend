import { renderHook, act, waitFor } from "@testing-library/react";
import { useSettings } from "../hooks/useSettings";

describe("useSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("utilise les paramètres par défaut", () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.settings.companyName).toBe("MADSuite");
    expect(result.current.settings.defaultRate).toBe("");
    expect(result.current.settings.theme).toBe("dark");
  });

  test("met à jour un paramètre", async () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updateSetting("companyName", "MADSuite");
    });

    await waitFor(() => {
      expect(result.current.settings.companyName).toBe("MADSuite");
    });
  });

  test("sauvegarde les paramètres dans localStorage", async () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.updateSetting("companyName", "MADSuite");
    });

    await waitFor(() => {
      expect(result.current.settings.companyName).toBe("MADSuite");
    });

    act(() => {
      result.current.saveSettings();
    });

    const saved = JSON.parse(localStorage.getItem("settings"));

    expect(saved.companyName).toBe("MADSuite");
  });
});
