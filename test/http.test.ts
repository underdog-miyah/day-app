import { Hono } from "hono";
import { cors } from "hono/cors";
import { describe, expect, it, vi } from "vitest";
import app from "../src/index";
import { notFoundHandler, onErrorHandler } from "../src/lib/errors";

const ORIGIN = "https://example.com";

const get = (path: string) => app.request(path);
const getFromBrowser = (path: string) => app.request(path, { headers: { Origin: ORIGIN } });

describe("GET /v1/holidays", () => {
  it("returns the holiday list for a supported year", async () => {
    const res = await get("/v1/holidays?year=2026");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      year: 2026,
      count: 18,
      holidays: expect.arrayContaining([{ date: "2026-01-01", name: "元日" }]),
    });
  });

  it("rejects a missing year", async () => {
    const res = await get("/v1/holidays");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: { code: "INVALID_PARAMETER", message: "year is required" },
    });
  });

  it("rejects a malformed year", async () => {
    const res = await get("/v1/holidays?year=20xx");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: { code: "INVALID_PARAMETER", message: "year must be a 4-digit integer" },
    });
  });

  it("returns 404 for a year without data", async () => {
    const res = await get("/v1/holidays?year=2030");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: {
        code: "YEAR_NOT_SUPPORTED",
        message: "holiday data is available for 2025-2026 only",
      },
    });
  });
});

describe("GET /v1/is-business-day", () => {
  it("returns the evaluation for a business day", async () => {
    const res = await get("/v1/is-business-day?date=2026-08-17");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      date: "2026-08-17",
      isBusinessDay: true,
      weekday: "Mon",
      isWeekend: false,
      isHoliday: false,
      holidayName: null,
    });
  });

  it("rejects a non-existent date", async () => {
    const res = await get("/v1/is-business-day?date=2026-02-30");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: { code: "INVALID_PARAMETER", message: "date must be a valid YYYY-MM-DD date" },
    });
  });

  it("returns 404 for a date outside the supported years", async () => {
    const res = await get("/v1/is-business-day?date=2030-08-17");
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: "YEAR_NOT_SUPPORTED" } });
  });
});

/** 本番と同じ並び（cors → route → notFound → onError）で例外を投げるアプリを組む。 */
function throwingApp() {
  const throwing = new Hono();
  throwing.use("*", cors());
  throwing.get("/boom", () => {
    throw new Error("unexpected");
  });
  throwing.notFound(notFoundHandler);
  throwing.onError(onErrorHandler);
  return throwing;
}

describe("error handlers", () => {
  it("returns JSON for an unknown route", async () => {
    const res = await get("/v1/nope");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: { code: "NOT_FOUND", message: "no such endpoint" },
    });
  });

  it("returns JSON instead of plain text when a handler throws", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await throwingApp().request("/boom", { headers: { Origin: ORIGIN } });

    expect(res.status).toBe(500);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(await res.json()).toEqual({
      error: { code: "INTERNAL_ERROR", message: "internal server error" },
    });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("CORS", () => {
  it("answers a preflight request", async () => {
    const res = await app.request("/v1/holidays", {
      method: "OPTIONS",
      headers: { Origin: ORIGIN, "Access-Control-Request-Method": "GET" },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("sets the header on a successful response", async () => {
    const res = await getFromBrowser("/v1/holidays?year=2026");
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });

  // 異常系こそヘッダが要る。付いていないとブラウザ側でエラーの中身が読めない。
  it("sets the header on a validation error", async () => {
    const res = await getFromBrowser("/v1/holidays");
    expect(res.status).toBe(400);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("sets the header on an unknown route", async () => {
    const res = await getFromBrowser("/v1/nope");
    expect(res.status).toBe(404);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("sets the header when a handler throws", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await throwingApp().request("/boom", { headers: { Origin: ORIGIN } });

    expect(res.status).toBe(500);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    spy.mockRestore();
  });
});
