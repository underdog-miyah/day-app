import { zValidator } from "@hono/zod-validator";
import type { ZodType } from "zod";
import { createErrorBody } from "./errors";

const errorBody = createErrorBody();

/**
 * 文言はスキーマ側に持たせる方針なので、最初の issue の message をそのまま返す。
 * zod のエラー型はバージョン間で変わるため、必要な形だけを構造的に受ける。
 */
function firstIssueMessage(error: { issues: readonly { message: string }[] }): string {
  return error.issues[0]?.message ?? "invalid request";
}

/**
 * クエリ検証。zValidator の既定エラーは Hono 独自形式なので、
 * フックで必ず共通のエラー JSON に揃える。
 */
export const queryValidator = <T extends ZodType>(schema: T) =>
  zValidator("query", schema, (result, c) => {
    if (!result.success) {
      return c.json(errorBody("INVALID_PARAMETER", firstIssueMessage(result.error)), 400);
    }
    return undefined;
  });
