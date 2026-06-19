import {
  toLocalDateString,
  startOfWeek,
  endOfWeek,
  formatWeekLabel,
  formatDuration,
  formatDate,
  toDatetimeLocal,
} from "../pages/Timesheet/timesheet.utils";

describe("toLocalDateString", () => {
  test("retourne vide si aucune date", () => {
    expect(toLocalDateString()).toBe("");
  });

  test("retourne vide si date invalide", () => {
    expect(toLocalDateString("pas-une-date")).toBe("");
  });

  test("formate une date locale", () => {
    expect(toLocalDateString("2026-05-20T12:00:00")).toBe("2026-05-20");
  });
});

describe("startOfWeek", () => {
  test("retourne le lundi de la semaine", () => {
    expect(
      toLocalDateString(startOfWeek("2026-05-20T12:00:00"))
    ).toBe("2026-05-18");
  });

  test("gère le dimanche comme fin de semaine", () => {
    expect(
      toLocalDateString(startOfWeek("2026-05-24T12:00:00"))
    ).toBe("2026-05-18");
  });

  test("retourne une date si valeur invalide", () => {
    expect(startOfWeek("date-invalide")).toBeInstanceOf(Date);
  });
});

describe("endOfWeek", () => {
  test("retourne le dimanche de la semaine", () => {
    expect(
      toLocalDateString(endOfWeek("2026-05-20T12:00:00"))
    ).toBe("2026-05-24");
  });
});

describe("formatWeekLabel", () => {
  test("retourne un libellé de semaine", () => {
    const label = formatWeekLabel("2026-05-20T12:00:00");

    expect(label).toContain("Semaine du");
    expect(label).toContain("2026");
  });
});

describe("formatDuration", () => {
  test("formate zéro heure", () => {
    expect(formatDuration(0)).toBe("0h 00");
  });

  test("formate des heures décimales", () => {
    expect(formatDuration(2.5)).toBe("2h 30");
  });

  test("arrondit les minutes", () => {
    expect(formatDuration(1.75)).toBe("1h 45");
  });
});

describe("formatDate", () => {
  test("retourne tiret si vide", () => {
    expect(formatDate()).toBe("—");
  });

  test("retourne tiret si invalide", () => {
    expect(formatDate("non-date")).toBe("—");
  });

  test("formate une date lisible", () => {
    const result = formatDate("2026-05-20T12:00:00");

    expect(result).toContain("20");
  });
});

describe("toDatetimeLocal", () => {
  test("retourne vide si aucune date", () => {
    expect(toDatetimeLocal()).toBe("");
  });

  test("retourne vide si invalide", () => {
    expect(toDatetimeLocal("pas-bon")).toBe("");
  });

  test("convertit en format datetime-local", () => {
    expect(toDatetimeLocal("2026-05-20T09:15:00")).toContain("2026-05-20T09:15");
  });
});