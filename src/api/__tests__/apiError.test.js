import { getApiErrorMessage } from "../apiError";

describe("getApiErrorMessage", () => {
  test("lit le message du format ApiResponse", () => {
    const error = {
      response: {
        data: {
          success: false,
          code: "VALIDATION_ERROR",
          data: null,
          errors: {
            message: "Donnees invalides.",
          },
        },
      },
    };

    expect(getApiErrorMessage(error)).toBe("Donnees invalides.");
  });

  test("reste compatible avec l'ancien format", () => {
    const error = {
      response: {
        data: {
          message: "Ancienne erreur.",
        },
      },
    };

    expect(getApiErrorMessage(error)).toBe("Ancienne erreur.");
  });
});
