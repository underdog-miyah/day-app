import { describe, expect, it } from "vitest";
import { evaluate } from "../src/businessDay";

describe("evaluate", () => {
  it("marks a plain weekday as a business day", () => {
    expect(evaluate("2026-08-17")).toEqual({
      date: "2026-08-17",
      isBusinessDay: true,
      weekday: "Mon",
      isWeekend: false,
      isHoliday: false,
      holidayName: null,
    });
  });

  it("marks weekends as non-business days", () => {
    expect(evaluate("2026-08-15").isBusinessDay).toBe(false);
    expect(evaluate("2026-08-16").isBusinessDay).toBe(false);
  });

  it("marks holidays as non-business days with their name", () => {
    expect(evaluate("2026-01-01")).toMatchObject({
      isBusinessDay: false,
      isHoliday: true,
      holidayName: "元日",
    });
    expect(evaluate("2026-05-06")).toMatchObject({
      isBusinessDay: false,
      isWeekend: false,
      isHoliday: true,
      holidayName: "休日",
    });
  });

  it("reports a holiday that falls on a weekend as both", () => {
    expect(evaluate("2025-05-03")).toMatchObject({
      weekday: "Sat",
      isWeekend: true,
      isHoliday: true,
      isBusinessDay: false,
    });
  });
});
