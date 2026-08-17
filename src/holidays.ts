export type Holiday = {
  date: string;
  name: string;
};

export const SUPPORTED_YEARS = [2025, 2026] as const;

/**
 * 内閣府「国民の祝日について」に基づく祝日一覧（振替休日・国民の休日を含む）。
 * 外部 API を使わないため、対象年分をソース内に定数として保持する。
 */
export const HOLIDAYS: Record<number, readonly Holiday[]> = {
  2025: [
    { date: "2025-01-01", name: "元日" },
    { date: "2025-01-13", name: "成人の日" },
    { date: "2025-02-11", name: "建国記念の日" },
    { date: "2025-02-23", name: "天皇誕生日" },
    { date: "2025-02-24", name: "休日" },
    { date: "2025-03-20", name: "春分の日" },
    { date: "2025-04-29", name: "昭和の日" },
    { date: "2025-05-03", name: "憲法記念日" },
    { date: "2025-05-04", name: "みどりの日" },
    { date: "2025-05-05", name: "こどもの日" },
    { date: "2025-05-06", name: "休日" },
    { date: "2025-07-21", name: "海の日" },
    { date: "2025-08-11", name: "山の日" },
    { date: "2025-09-15", name: "敬老の日" },
    { date: "2025-09-23", name: "秋分の日" },
    { date: "2025-10-13", name: "スポーツの日" },
    { date: "2025-11-03", name: "文化の日" },
    { date: "2025-11-23", name: "勤労感謝の日" },
    { date: "2025-11-24", name: "休日" },
  ],
  2026: [
    { date: "2026-01-01", name: "元日" },
    { date: "2026-01-12", name: "成人の日" },
    { date: "2026-02-11", name: "建国記念の日" },
    { date: "2026-02-23", name: "天皇誕生日" },
    { date: "2026-03-20", name: "春分の日" },
    { date: "2026-04-29", name: "昭和の日" },
    { date: "2026-05-03", name: "憲法記念日" },
    { date: "2026-05-04", name: "みどりの日" },
    { date: "2026-05-05", name: "こどもの日" },
    { date: "2026-05-06", name: "休日" },
    { date: "2026-07-20", name: "海の日" },
    { date: "2026-08-11", name: "山の日" },
    { date: "2026-09-21", name: "敬老の日" },
    { date: "2026-09-22", name: "国民の休日" },
    { date: "2026-09-23", name: "秋分の日" },
    { date: "2026-10-12", name: "スポーツの日" },
    { date: "2026-11-03", name: "文化の日" },
    { date: "2026-11-23", name: "勤労感謝の日" },
  ],
};

const HOLIDAY_BY_DATE = new Map<string, Holiday>(
  Object.values(HOLIDAYS).flatMap((list) => list.map((h) => [h.date, h] as const)),
);

export function isSupportedYear(year: number): boolean {
  return Object.hasOwn(HOLIDAYS, year);
}

export function getHolidays(year: number): readonly Holiday[] | undefined {
  return HOLIDAYS[year];
}

export function findHoliday(date: string): Holiday | undefined {
  return HOLIDAY_BY_DATE.get(date);
}
