import api from "../api";

jest.mock("../api");

describe("Projets API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getProjets fetches projects list", async () => {
    api.get.mockResolvedValue({
      data: [{ id: 1, nom: "Projet 1", client_id: 1, taux_horaire: 100 }],
    });

    const response = await api.get("/projets");
    expect(response.data.length).toBe(1);
    expect(response.data[0].nom).toBe("Projet 1");
  });

  test("createProject sends POST request", async () => {
    const newProject = { nom: "New Project", client_id: 1 };
    api.post.mockResolvedValue({ data: { id: 2, ...newProject } });

    const response = await api.post("/projets", newProject);
    expect(response.data.id).toBe(2);
    expect(api.post).toHaveBeenCalledWith("/projets", newProject);
  });

  test("updateProject sends PUT request", async () => {
    const updatedData = { nom: "Updated Project" };
    api.put.mockResolvedValue({ data: { id: 1, ...updatedData } });

    const response = await api.put("/projets/1", updatedData);
    expect(response.data.nom).toBe("Updated Project");
  });

  test("deleteProject sends DELETE request", async () => {
    api.delete.mockResolvedValue({ data: { success: true } });

    const response = await api.delete("/projets/1");
    expect(response.data.success).toBe(true);
  });

  test("handles project not found", async () => {
    api.get.mockRejectedValue(new Error("404 Not Found"));

    try {
      await api.get("/projets/999");
    } catch (err) {
      expect(err.message).toBe("404 Not Found");
    }
  });
});
