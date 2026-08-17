import { z } from "zod";
import { isValidDateString } from "./lib/date";

/**
 * クエリの形式検証のみを担う。
 * 「祝日データを持たない年」のような業務上の制約はハンドラ側で判定する。
 */

export const holidaysQuery = z.object({
  year: z
    .string({ error: "year is required" })
    .regex(/^\d{4}$/, "year must be a 4-digit integer"),
});

export const isBusinessDayQuery = z.object({
  date: z
    .string({ error: "date is required" })
    .refine(isValidDateString, "date must be a valid YYYY-MM-DD date"),
});
