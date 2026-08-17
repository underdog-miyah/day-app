import { Hono } from "hono";
import { cors } from "hono/cors";
import { errorBody } from "./appErrors";
import { evaluate } from "./businessDay";
import { SUPPORTED_YEARS, getHolidays, isSupportedYear } from "./holidays";
import { getYear } from "./lib/date";
import { notFoundHandler, onErrorHandler } from "./lib/errors";
import { queryValidator } from "./lib/validation";
import { holidaysQuery, isBusinessDayQuery } from "./schema";

const SUPPORTED_RANGE = `${SUPPORTED_YEARS[0]}-${SUPPORTED_YEARS[SUPPORTED_YEARS.length - 1]}`;
const yearNotSupported = () =>
  errorBody("YEAR_NOT_SUPPORTED", `holiday data is available for ${SUPPORTED_RANGE} only`);

const app = new Hono();

// ── ミドルウェア挿入点 ──────────────────────────────
// 認証・レート制限を足すときはここに app.use("/v1/*", ...) を挟む。
// 各ルートハンドラを書き換える必要はない。
// ───────────────────────────────────────────────

// 認証なしの公開 read-only API なので origin は既定の "*"。
// "/v1/*" ではなく "*" にするのは、404 / 500 のレスポンスにも CORS ヘッダを付けるため。
// 付いていないと、ブラウザからはエラーの中身が読めずネットワークエラーにしか見えない。
app.use("*", cors());

app.get("/v1/holidays", queryValidator(holidaysQuery), (c) => {
  const year = Number(c.req.valid("query").year);

  const holidays = getHolidays(year);
  if (holidays === undefined) {
    return c.json(yearNotSupported(), 404);
  }

  return c.json({ year, count: holidays.length, holidays });
});

app.get("/v1/is-business-day", queryValidator(isBusinessDayQuery), (c) => {
  const { date } = c.req.valid("query");

  if (!isSupportedYear(getYear(date))) {
    return c.json(yearNotSupported(), 404);
  }

  return c.json(evaluate(date));
});

app.notFound(notFoundHandler);
app.onError(onErrorHandler);

export default app;
