import { formatTimer } from "../utils/time.utils";

describe("formatTimer", () => {
  test("formate zéro seconde", () => {
    expect(formatTimer(0)).toBe("00:00:00");
  });

  test("formate secondes et minutes", () => {
    expect(formatTimer(65)).toBe("00:01:05");
  });

  test("formate heures minutes secondes", () => {
    expect(formatTimer(3661)).toBe("01:01:01");
  });

  test("garde les heures au-delà de 24", () => {
    expect(formatTimer(90061)).toBe("25:01:01");
  });
});
