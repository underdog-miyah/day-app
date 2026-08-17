import { describe, expect, it } from "vitest";
import { getWeekday, getYear, isValidDateString, isWeekendDate } from "../src/lib/date";

describe("isValidDateString", () => {
  it.each(["2026-08-17", "2026-01-01", "2026-12-31", "2024-02-29"])("accepts %s", (input) => {
    expect(isValidDateString(input)).toBe(true);
  });

  it.each([
    "abc",
    "",
    "2026-13-01",
    "2026-00-10",
    "2026-02-30",
    "2026-02-29",
    "2026-04-31",
    "2026-8-17",
    "2026/08/17",
    "2026-08-17T00:00:00Z",
  ])("rejects %j", (input) => {
    expect(isValidDateString(input)).toBe(false);
  });

  it("applies the full leap year rule", () => {
    expect(isValidDateString("2000-02-29")).toBe(true); // 400 で割り切れる
    expect(isValidDateString("1900-02-29")).toBe(false); // 100 で割り切れるが 400 では割れない
  });
});

describe("getYear", () => {
  it("reads the year from the string", () => {
    expect(getYear("2026-08-17")).toBe(2026);
    expect(getYear("2025-01-01")).toBe(2025);
  });
});

describe("getWeekday", () => {
  it("returns the UTC weekday", () => {
    expect(getWeekday("2026-08-17")).toBe("Mon");
    expect(getWeekday("2026-08-15")).toBe("Sat");
    expect(getWeekday("2026-08-16")).toBe("Sun");
  });
});

describe("isWeekendDate", () => {
  it("treats Saturday and Sunday as weekend", () => {
    expect(isWeekendDate("2026-08-15")).toBe(true);
    expect(isWeekendDate("2026-08-16")).toBe(true);
    expect(isWeekendDate("2026-08-17")).toBe(false);
  });
});
