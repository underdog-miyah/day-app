import { findHoliday } from "./holidays";

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export type BusinessDayResult = {
  date: string;
  isBusinessDay: boolean;
  weekday: Weekday;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName: string | null;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * YYYY-MM-DD を UTC の Date としてパースする。Workers のタイムゾーンは UTC 固定だが、
 * ローカルタイム依存を避けるため明示的に UTC 扱いにする。
 * 2026-02-30 のような繰り上がりを弾くため、往復変換して入力と一致するか検証する。
 */
export function parseDate(input: string): Date | undefined {
  if (!DATE_PATTERN.test(input)) return undefined;
  const d = new Date(`${input}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return undefined;
  if (d.toISOString().slice(0, 10) !== input) return undefined;
  return d;
}

export function getWeekday(d: Date): Weekday {
  return WEEKDAYS[d.getUTCDay()]!;
}

export function isWeekend(d: Date): boolean {
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}

export function evaluate(date: string, d: Date): BusinessDayResult {
  const holiday = findHoliday(date);
  const weekend = isWeekend(d);
  return {
    date,
    isBusinessDay: !weekend && holiday === undefined,
    weekday: getWeekday(d),
    isWeekend: weekend,
    isHoliday: holiday !== undefined,
    holidayName: holiday?.name ?? null,
  };
}
