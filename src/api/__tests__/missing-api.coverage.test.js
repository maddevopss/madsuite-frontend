import api from "../api";
import { getActivitySummary, getClientsSummary } from "../activity.api";
import * as activityIntelligence from "../activityIntelligence.api";
import * as projectDetection from "../projectDetection.api";
import { getAccessToken, setAccessToken, clearAccessToken } from "../tokenStore";

jest.mock("../api");

describe("missing API wrappers coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("activity.api expose les appels dashboard et résumé", async () => {
    api.get.mockResolvedValueOnce({ data: [{ client: "A" }] });
    await expect(getClientsSummary()).resolves.toEqual([{ client: "A" }]);
    expect(api.get).toHaveBeenCalledWith("/dashboard/clients-summary");

    api.get.mockResolvedValueOnce({ data: { rows: [] } });
    await expect(getActivitySummary("2026-06-01", "2026-06-06")).resolves.toEqual({ rows: [] });
    expect(api.get).toHaveBeenCalledWith("/activity/summary", {
      params: { date_debut: "2026-06-01", date_fin: "2026-06-06" },
    });
  });

  test("activityIntelligence réussit les principaux endpoints", async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    await expect(activityIntelligence.getActivityInsights()).resolves.toEqual([{ id: 1 }]);

    api.get.mockResolvedValueOnce({ data: [{ id: 2 }] });
    await expect(activityIntelligence.getActivityRules()).resolves.toEqual([{ id: 2 }]);

    api.post.mockResolvedValueOnce({ data: { id: 3 } });
    await expect(activityIntelligence.createActivityRule({ keyword: "code" })).resolves.toEqual({ id: 3 });

    api.put.mockResolvedValueOnce({ data: { id: 3, keyword: "vscode" } });
    await expect(activityIntelligence.updateActivityRule(3, { keyword: "vscode" })).resolves.toEqual({ id: 3, keyword: "vscode" });

    api.delete.mockResolvedValueOnce({ data: null });
    await expect(activityIntelligence.deleteActivityRule(3)).resolves.toEqual({ success: true });

    api.post.mockResolvedValueOnce({ data: { classification: "productive" } });
    await expect(activityIntelligence.classifyActivityContext({ app: "VS Code" })).resolves.toEqual({ classification: "productive" });

    api.post.mockResolvedValueOnce({ data: { success: true } });
    await expect(activityIntelligence.sendActivityFeedback({ id: 1 })).resolves.toEqual({ success: true });
  });

  test("activityIntelligence fallback retourne des valeurs sécuritaires", async () => {
    api.get.mockRejectedValue(new Error("fail"));
    await expect(activityIntelligence.getActivityInsights()).resolves.toEqual([]);
    await expect(activityIntelligence.getActivityRules()).resolves.toEqual([]);
    await expect(activityIntelligence.getBillingIssues()).resolves.toEqual([]);

    api.post.mockRejectedValue(new Error("fail"));
    await expect(activityIntelligence.suggestProject({ appName: "A", windowTitle: "B" })).resolves.toEqual({
      suggestion: null,
      suggestions: [],
    });
    await expect(activityIntelligence.suggestBillingDescription(1)).resolves.toBeNull();

    api.get.mockRejectedValueOnce(new Error("fail"));
    await expect(activityIntelligence.getDaySummary("2026-06-06")).resolves.toEqual(
      expect.objectContaining({ summary_date: "2026-06-06", total_seconds: 0 }),
    );
  });

  test("projectDetection réussit et retourne fallback en erreur", async () => {
    api.post.mockResolvedValueOnce({ data: { suggestion: { id: 1 } } });
    await expect(projectDetection.suggestProjectFromBackend({ appName: "VS Code", windowTitle: "MADSuite" })).resolves.toEqual({
      suggestion: { id: 1 },
    });

    api.post.mockResolvedValueOnce({ data: { id: 2 } });
    await expect(projectDetection.createProjectPattern({ projet_id: 1, keyword: "chrono" })).resolves.toEqual({ id: 2 });

    api.post.mockResolvedValueOnce({ data: { success: true } });
    await expect(
      projectDetection.sendProjectDetectionFeedback({ activityLogId: 1, projet_id: 2, feedback_type: "correct" }),
    ).resolves.toEqual({ success: true });

    api.post.mockRejectedValue(new Error("fail"));
    await expect(projectDetection.createProjectPattern({ projet_id: 1, keyword: "x" })).resolves.toBeNull();
    await expect(projectDetection.sendProjectDetectionFeedback({ activityLogId: 1 })).resolves.toBeNull();
    await expect(projectDetection.suggestProjectFromBackend({ appName: "A", windowTitle: "B" })).resolves.toEqual({
      suggestion: null,
      suggestions: [],
    });
  });


});
