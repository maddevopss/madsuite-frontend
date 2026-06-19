import { formatHours, formatMoney, formatDate } from "../utils/formatters";

describe("formatHours", () => {
  test("convertit des heures décimales", () => {
    expect(formatHours(2.5)).toBe("2h 30");
  });

  test("retourne 0h 00 si valeur vide", () => {
    expect(formatHours()).toBe("0h 00");
  });

  test("arrondit correctement les minutes", () => {
    expect(formatHours(1.75)).toBe("1h 45");
  });

  test("gère les nombres entiers", () => {
    expect(formatHours(4)).toBe("4h 00");
  });
});

describe("formatMoney", () => {
  test("formate en dollars canadiens", () => {
    const resultat = formatMoney(1234.56);

    expect(resultat).toContain("$");

    expect(resultat).toContain("1");
  });

  test("retourne 0$ si valeur vide", () => {
    const resultat = formatMoney();

    expect(resultat).toContain("$");
  });
});

describe("formatDate", () => {
  test("formate une date", () => {
    const result = formatDate("2026-05-21T12:00:00");

    expect(result).toContain("2026");
  });

  test("retourne vide si aucune date", () => {
    expect(formatDate()).toBe("");
  });
});
