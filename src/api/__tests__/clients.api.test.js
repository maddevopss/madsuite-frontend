import api from "../api";
import * as clientsAPI from "../clients.api";

jest.mock("../api");

describe("Clients API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getClients fetches client list", async () => {
    api.get.mockResolvedValue({
      data: [{ id: 1, nom: "Client 1", email: "client@test.com" }],
    });

    const response = await api.get("/clients");
    expect(response.data.length).toBe(1);
    expect(response.data[0].nom).toBe("Client 1");
  });

  test("createClient sends POST request", async () => {
    const newClient = { nom: "New Client", email: "new@test.com" };
    api.post.mockResolvedValue({ data: { id: 2, ...newClient } });

    const response = await api.post("/clients", newClient);
    expect(response.data.id).toBe(2);
    expect(api.post).toHaveBeenCalledWith("/clients", newClient);
  });

  test("updateClient sends PUT request", async () => {
    const updatedData = { nom: "Updated Client" };
    api.put.mockResolvedValue({ data: { id: 1, ...updatedData } });

    const response = await api.put("/clients/1", updatedData);
    expect(response.data.nom).toBe("Updated Client");
    expect(api.put).toHaveBeenCalledWith("/clients/1", updatedData);
  });

  test("deleteClient sends DELETE request", async () => {
    api.delete.mockResolvedValue({ data: { success: true } });

    const response = await api.delete("/clients/1");
    expect(response.data.success).toBe(true);
    expect(api.delete).toHaveBeenCalledWith("/clients/1");
  });

  test("handles API errors", async () => {
    api.get.mockRejectedValue(new Error("Network error"));

    try {
      await api.get("/clients");
    } catch (err) {
      expect(err.message).toBe("Network error");
    }
  });
});
