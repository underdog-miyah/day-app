import { describe, expect, it } from "vitest";
import { evaluate, getWeekday, isWeekend, parseDate } from "../src/businessDay";

const check = (date: string) => {
  const d = parseDate(date);
  if (d === undefined) throw new Error(`unexpected parse failure: ${date}`);
  return evaluate(date, d);
};

describe("parseDate", () => {
  it("accepts a valid date", () => {
    expect(parseDate("2026-08-17")?.toISOString()).toBe("2026-08-17T00:00:00.000Z");
  });

  it.each(["abc", "2026-13-01", "2026-02-30", "2026-8-17", "2026/08/17", "", "2026-08-17T00:00:00Z"])(
    "rejects %j",
    (input) => {
      expect(parseDate(input)).toBeUndefined();
    },
  );
});

describe("weekday helpers", () => {
  it("reports the UTC weekday", () => {
    expect(getWeekday(parseDate("2026-08-17")!)).toBe("Mon");
    expect(getWeekday(parseDate("2026-08-15")!)).toBe("Sat");
    expect(getWeekday(parseDate("2026-08-16")!)).toBe("Sun");
  });

  it("treats Saturday and Sunday as weekend", () => {
    expect(isWeekend(parseDate("2026-08-15")!)).toBe(true);
    expect(isWeekend(parseDate("2026-08-16")!)).toBe(true);
    expect(isWeekend(parseDate("2026-08-17")!)).toBe(false);
  });
});

describe("evaluate", () => {
  it("marks a plain weekday as a business day", () => {
    expect(check("2026-08-17")).toEqual({
      date: "2026-08-17",
      isBusinessDay: true,
      weekday: "Mon",
      isWeekend: false,
      isHoliday: false,
      holidayName: null,
    });
  });

  it("marks weekends as non-business days", () => {
    expect(check("2026-08-15").isBusinessDay).toBe(false);
    expect(check("2026-08-16").isBusinessDay).toBe(false);
  });

  it("marks holidays as non-business days with their name", () => {
    expect(check("2026-01-01")).toMatchObject({
      isBusinessDay: false,
      isHoliday: true,
      holidayName: "元日",
    });
    expect(check("2026-05-06")).toMatchObject({
      isBusinessDay: false,
      isWeekend: false,
      isHoliday: true,
      holidayName: "休日",
    });
  });

  it("reports a holiday that falls on a weekend as both", () => {
    expect(check("2025-05-03")).toMatchObject({
      weekday: "Sat",
      isWeekend: true,
      isHoliday: true,
      isBusinessDay: false,
    });
  });
});
