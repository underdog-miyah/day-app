import { createErrorBody } from "./lib/errors";

/** この API 固有のエラーコード。次の API ではこの 2 行を書き換える。 */
export type AppErrorCode = "YEAR_NOT_SUPPORTED";

export const errorBody = createErrorBody<AppErrorCode>();
