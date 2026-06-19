import { classifyActivity, detectProjectFromTitle } from "./activityClassifier";
describe("activityClassifier", () => {
  test("detecte VSCode comme développement", () => {
    const result = classifyActivity("Visual Studio Code", "Dashboard.jsx - MADSuite");

    expect(result.category).toBe("development");
    expect(result.label).toBe("Développement");
  });

  test("detecte Cursor comme développement", () => {
    const result = classifyActivity("Cursor", "useTimer.js - MADSuite");

    expect(result.category).toBe("development");
  });

  test("detecte Figma comme design", () => {
    const result = classifyActivity("Figma", "UI Design");

    expect(result.category).toBe("design");
    expect(result.label).toBe("Design");
  });

  test("detecte Chrome localhost comme développement web", () => {
    const result = classifyActivity("Google Chrome", "localhost:3000/dashboard");

    expect(result.category).toBe("development");
    expect(result.label).toBe("Développement Web");
  });

  test("detecte Github comme code review", () => {
    const result = classifyActivity("Google Chrome", "GitHub - bleeband/MADSuite");

    expect(result.category).toBe("development");
    expect(result.label).toBe("Code Review");
  });

  test("detecte Discord comme communication", () => {
    const result = classifyActivity("Discord", "General Chat");

    expect(result.category).toBe("communication");
  });

  test("retourne fallback pour application inconnue", () => {
    const result = classifyActivity("UnknownApp", "Random Window");

    expect(result.category).toBe("other");
    expect(result.label).toBe("Autre");
  });
});

describe("detectProjectFromTitle", () => {
  const projects = [
    {
      id: 1,
      nom: "MADSuite",
      client_id: 10,
      couleur: "#1884df",
    },
    {
      id: 2,
      nom: "AstraLog",
      client_id: 20,
      couleur: "#ff6600",
    },
  ];

  test("detecte projet depuis window title", () => {
    const result = detectProjectFromTitle("Dashboard.jsx - MADSuite - VSCode", projects);

    expect(result).not.toBeNull();

    expect(result.id).toBe(1);
    expect(result.nom).toBe("MADSuite");
  });

  test("detecte AstraLog dans le titre", () => {
    const result = detectProjectFromTitle("MissionCard.jsx - AstraLog", projects);

    expect(result).not.toBeNull();

    expect(result.id).toBe(2);
    expect(result.nom).toBe("AstraLog");
  });

  test("ignore la casse dans le titre", () => {
    const result = detectProjectFromTitle("madsuite - vscode", projects);

    expect(result).not.toBeNull();

    expect(result.nom).toBe("MADSuite");
  });

  test("retourne null si aucun projet détecté", () => {
    const result = detectProjectFromTitle("Random Window", projects);

    expect(result).toBeNull();
  });

  test("retourne null si liste vide", () => {
    const result = detectProjectFromTitle("MADSuite", []);

    expect(result).toBeNull();
  });
});
