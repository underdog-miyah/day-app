import { describe, expect, it } from "vitest";
import { HOLIDAYS, findHoliday, getHolidays, isSupportedYear } from "../src/holidays";

describe("holiday data", () => {
  it("has 19 holidays in 2025 and 18 in 2026", () => {
    expect(getHolidays(2025)).toHaveLength(19);
    expect(getHolidays(2026)).toHaveLength(18);
  });

  it("stores every date as YYYY-MM-DD within its own year, sorted ascending", () => {
    for (const [year, list] of Object.entries(HOLIDAYS)) {
      const dates = list.map((h) => h.date);
      expect(dates).toEqual([...dates].sort());
      expect(new Set(dates).size).toBe(dates.length);
      for (const date of dates) {
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(date.slice(0, 4)).toBe(year);
      }
    }
  });

  it("returns undefined for unsupported years", () => {
    expect(getHolidays(2024)).toBeUndefined();
    expect(getHolidays(2027)).toBeUndefined();
    expect(isSupportedYear(2025)).toBe(true);
    expect(isSupportedYear(2030)).toBe(false);
  });
});

describe("findHoliday", () => {
  it("finds holidays across both years", () => {
    expect(findHoliday("2025-01-01")).toEqual({ date: "2025-01-01", name: "元日" });
    expect(findHoliday("2026-09-22")).toEqual({ date: "2026-09-22", name: "国民の休日" });
  });

  it("returns undefined for a non-holiday", () => {
    expect(findHoliday("2026-08-17")).toBeUndefined();
  });
});
