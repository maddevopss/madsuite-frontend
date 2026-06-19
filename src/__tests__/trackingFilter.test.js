import { shouldIgnoreActivity, getActivitySignature } from "../utils/trackingFilter";

describe("shouldIgnoreActivity", () => {
  test("ignore si app et titre sont vides", () => {
    expect(
      shouldIgnoreActivity({
        app_name: "",
        window_title: "",
      }),
    ).toBe(true);
  });

  test("ignore une application système", () => {
    expect(
      shouldIgnoreActivity({
        app_name: "Electron",
        window_title: "MADSuite",
      }),
    ).toBe(true);
  });

  test("ignore un titre système", () => {
    expect(
      shouldIgnoreActivity({
        app_name: "Chrome",
        window_title: "Developer Tools",
      }),
    ).toBe(true);
  });

  test("ignore une fenêtre sans titre", () => {
    expect(
      shouldIgnoreActivity({
        app_name: "Chrome",
        window_title: "   ",
      }),
    ).toBe(true);
  });

  test("n’ignore pas une activité valide", () => {
    expect(
      shouldIgnoreActivity({
        app_name: "Visual Studio Code",
        window_title: "Projet MADSuite",
      }),
    ).toBe(false);
  });
});

describe("getActivitySignature", () => {
  test("retourne une signature app + titre", () => {
    expect(
      getActivitySignature({
        app_name: "VS Code",
        window_title: "index.jsx",
      }),
    ).toBe("VS Code::index.jsx");
  });

  test("gère les valeurs manquantes", () => {
    expect(
      getActivitySignature({
        app_name: null,
        window_title: undefined,
      }),
    ).toBe("::");
  });
});
