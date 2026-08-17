import { Hono } from "hono";
import { evaluate, parseDate } from "./businessDay";
import { SUPPORTED_YEARS, getHolidays, isSupportedYear } from "./holidays";

type ErrorCode = "INVALID_PARAMETER" | "YEAR_NOT_SUPPORTED" | "NOT_FOUND";

const SUPPORTED_RANGE = `${SUPPORTED_YEARS[0]}-${SUPPORTED_YEARS[SUPPORTED_YEARS.length - 1]}`;

const errorBody = (code: ErrorCode, message: string) => ({ error: { code, message } });

const app = new Hono();

app.get("/v1/holidays", (c) => {
  const year = c.req.query("year");
  if (year === undefined) {
    return c.json(errorBody("INVALID_PARAMETER", "year is required"), 400);
  }
  if (!/^\d{4}$/.test(year)) {
    return c.json(errorBody("INVALID_PARAMETER", "year must be a 4-digit integer"), 400);
  }

  const y = Number(year);
  const holidays = getHolidays(y);
  if (holidays === undefined) {
    return c.json(
      errorBody("YEAR_NOT_SUPPORTED", `holiday data is available for ${SUPPORTED_RANGE} only`),
      404,
    );
  }

  return c.json({ year: y, count: holidays.length, holidays });
});

app.get("/v1/is-business-day", (c) => {
  const date = c.req.query("date");
  if (date === undefined) {
    return c.json(errorBody("INVALID_PARAMETER", "date is required"), 400);
  }

  const parsed = parseDate(date);
  if (parsed === undefined) {
    return c.json(errorBody("INVALID_PARAMETER", "date must be a valid YYYY-MM-DD date"), 400);
  }

  if (!isSupportedYear(parsed.getUTCFullYear())) {
    return c.json(
      errorBody("YEAR_NOT_SUPPORTED", `holiday data is available for ${SUPPORTED_RANGE} only`),
      404,
    );
  }

  return c.json(evaluate(date, parsed));
});

app.notFound((c) => c.json(errorBody("NOT_FOUND", "no such endpoint"), 404));

export default app;
