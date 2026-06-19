import { AuthContext } from "../api/authContext";

export default function TestAuthProvider({ children }) {
  const mockAuth = {
    user: {
      id: 1,
      nom: "Test User",
      email: "test@test.com",
      role: "admin",
    },

    token: "fake-jwt-token",

    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
    isAuthenticated: true,
  };

  return <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>;
}
