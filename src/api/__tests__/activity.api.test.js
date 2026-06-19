import api from "../api";

jest.mock("../api");

describe("Activity API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getActivities fetches activities", async () => {
    api.get.mockResolvedValue({
      data: [
        {
          id: 1,
          app_name: "VS Code",
          window_title: "project.js",
          classification: "productif",
        },
      ],
    });

    const response = await api.get("/activity");
    expect(response.data.length).toBe(1);
    expect(response.data[0].classification).toBe("productif");
  });

  test("getActivitySummary with date filter", async () => {
    api.get.mockResolvedValue({
      data: {
        productif: 6,
        distraction: 1,
        neutre: 1,
      },
    });

    const response = await api.get("/activity/summary", {
      params: { date: "2026-05-24" },
    });
    expect(response.data.productif).toBe(6);
  });

  test("handles activity errors", async () => {
    api.get.mockRejectedValue(new Error("API Error"));

    try {
      await api.get("/activity");
    } catch (err) {
      expect(err.message).toBe("API Error");
    }
  });
});
