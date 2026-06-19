import api from "../api";
import {
  getActiveTimer,
  getTodayProjects,
  startTimer,
  stopTimer,
  updateActiveNote,
} from "../timer.api";

jest.mock("../api");

describe("Timer API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("deballe le timer actif standardise", async () => {
    const timer = { id: 1, projet_id: 10 };
    api.get.mockResolvedValue({
      data: { success: true, code: "TIMER_ACTIVE", data: timer },
    });

    await expect(getActiveTimer()).resolves.toEqual(timer);
    expect(api.get).toHaveBeenCalledWith("/timer/active");
  });

  test("retourne null lorsqu'il n'y a aucun timer actif", async () => {
    api.get.mockResolvedValue({
      data: { success: true, code: "NO_ACTIVE_TIMER", data: null },
    });

    await expect(getActiveTimer()).resolves.toBeNull();
  });

  test("deballe les projets du jour", async () => {
    const projects = [{ projet_id: 10 }];
    api.get.mockResolvedValue({
      data: { success: true, code: "TIMER_TODAY_PROJECTS", data: projects },
    });

    await expect(getTodayProjects()).resolves.toEqual(projects);
  });

  test("demarre un timer et retourne les donnees metier", async () => {
    const timer = { id: 1, projet_id: 10, start_time: new Date().toISOString() };
    api.post.mockResolvedValue({
      data: { success: true, code: "TIMER_STARTED", data: timer },
    });

    await expect(startTimer({ projet_id: 10 })).resolves.toEqual(timer);
    expect(api.post).toHaveBeenCalledWith("/timer/start", { projet_id: 10 });
  });

  test("arrete un timer et retourne les donnees metier", async () => {
    const timer = { id: 1, end_time: new Date().toISOString() };
    api.patch.mockResolvedValue({
      data: { success: true, code: "TIMER_STOPPED", data: timer },
    });

    await expect(stopTimer()).resolves.toEqual(timer);
    expect(api.patch).toHaveBeenCalledWith("/timer/stop");
  });

  test("met a jour la note et retourne les donnees metier", async () => {
    const updated = { id: 1, note: "Suivi" };
    api.patch.mockResolvedValue({
      data: { success: true, code: "TIMER_NOTE_UPDATED", data: updated },
    });

    await expect(updateActiveNote("Suivi")).resolves.toEqual(updated);
    expect(api.patch).toHaveBeenCalledWith("/timer/active/note", { note: "Suivi" });
  });

  test("reste compatible avec une reponse non enveloppee", async () => {
    const timer = { id: 1 };
    api.get.mockResolvedValue({ data: timer });

    await expect(getActiveTimer()).resolves.toEqual(timer);
  });
});
