import type { ErrorHandler, NotFoundHandler } from "hono";

/**
 * どの API でも使うエラーコード。ここは書き換えない。
 * API 固有のコードは createErrorBody の型引数で足す（src/errors.ts を参照）。
 */
export type CommonErrorCode = "INVALID_PARAMETER" | "NOT_FOUND" | "INTERNAL_ERROR";

export type ErrorBody<Code extends string> = {
  error: { code: CommonErrorCode | Code; message: string };
};

/**
 * 共通コード + API 固有コードの 2 層を型で表現するファクトリ。
 *
 *   export const errorBody = createErrorBody<"YEAR_NOT_SUPPORTED">();
 */
export function createErrorBody<Code extends string = never>() {
  return (code: CommonErrorCode | Code, message: string): ErrorBody<Code> => ({
    error: { code, message },
  });
}

const commonErrorBody = createErrorBody();

export const notFoundHandler: NotFoundHandler = (c) =>
  c.json(commonErrorBody("NOT_FOUND", "no such endpoint"), 404);

/**
 * 予期しない例外もこの JSON 形式に統一する（既定ではプレーンテキストが返る）。
 * 例外の中身はレスポンスに出さず console.error にだけ流す。`wrangler tail` で読む。
 */
export const onErrorHandler: ErrorHandler = (err, c) => {
  console.error(err);
  return c.json(commonErrorBody("INTERNAL_ERROR", "internal server error"), 500);
};
