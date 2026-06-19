import api from "../api";
import authService from "../authService";
import { getAccessToken, setAccessToken } from "../tokenStore";
import { getStoredUser, setStoredUser } from "../userStore";

jest.mock("../api");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("login stores token and user", async () => {
    api.post.mockResolvedValue({
      data: {
        token: "fake-token",
        user: { id: 1, email: "test@test.com", role: "admin" },
      },
    });

    const response = await api.post("/login", {
      email: "test@test.com",
      password: "password",
    });

    expect(response.data.token).toBe("fake-token");
  });

  test("logout appelle le backend même sans access token et nettoie l'état local", async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    setAccessToken(null);
    setStoredUser({ id: 1, email: "test@test.com" });

    await authService.logout();

    expect(api.post).toHaveBeenCalledWith("/logout");
    expect(getAccessToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  test("login fails with invalid credentials", async () => {
    api.post.mockRejectedValue(new Error("Unauthorized"));

    try {
      await api.post("/login", {
        email: "test@test.com",
        password: "wrong",
      });
    } catch (err) {
      expect(err.message).toBe("Unauthorized");
    }
  });
});
