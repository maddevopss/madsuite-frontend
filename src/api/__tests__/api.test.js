const handlers = {};

const mockApiInstance = jest.fn((config) => Promise.resolve({ config, retried: true }));
mockApiInstance.post = jest.fn();
mockApiInstance.interceptors = {
  request: {
    use: jest.fn((handler) => {
      handlers.request = handler;
    }),
  },
  response: {
    use: jest.fn((successHandler, errorHandler) => {
      handlers.responseSuccess = successHandler;
      handlers.responseError = errorHandler;
    }),
  },
};

jest.mock("axios", () => ({
  create: jest.fn(() => mockApiInstance),
}));

const tokenStore = require("../tokenStore");
require("../api.jsx").default;

const makeJwt = (exp) => {
  const payload = Buffer.from(JSON.stringify({ exp }), "utf8").toString("base64url");
  return `header.${payload}.signature`;
};

describe("api interceptors", () => {
  beforeEach(() => {
    mockApiInstance.mockClear();
    mockApiInstance.mockImplementation((config) => Promise.resolve({ config, retried: true }));
    mockApiInstance.post.mockReset();
    tokenStore.clearAccessToken();
  });

  test("n'injecte plus de Bearer et garde les cookies actifs", () => {
    tokenStore.setAccessToken("access-token");

    const config = handlers.request({ headers: {} });

    return Promise.resolve(config).then((resolved) => {
      expect(resolved.headers.Authorization).toBeUndefined();
    });
  });

  test("refresh apres access token expire, stocke le nouveau token et rejoue la requete", async () => {
    tokenStore.setAccessToken(makeJwt(Math.floor(Date.now() / 1000) - 60));
    mockApiInstance.post.mockResolvedValue({
      data: {
        token: "new-token",
      },
    });

    const originalRequest = {
      url: "/clients",
      headers: {},
    };

    const result = await handlers.responseError({
      config: originalRequest,
      response: {
        status: 401,
        data: {
          message: "Token expire",
        },
      },
    });

    expect(mockApiInstance.post).toHaveBeenCalledWith("/refresh");
    expect(tokenStore.getAccessToken()).toBe("new-token");
    expect(mockApiInstance).toHaveBeenCalledWith(expect.objectContaining({ url: "/clients", _retry: true }));
    expect(result.retried).toBe(true);
  });

  test("ne tente pas de refresh si logout retourne 401", async () => {
    const error = {
      config: { url: "/logout", headers: {} },
      response: { status: 401 },
    };

    await expect(handlers.responseError(error)).rejects.toBe(error);
    expect(mockApiInstance.post).not.toHaveBeenCalledWith("/refresh");
  });
});
