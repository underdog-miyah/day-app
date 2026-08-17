import { findHoliday } from "./holidays";
import { getWeekday, isWeekendDate, type Weekday } from "./lib/date";

export type BusinessDayResult = {
  date: string;
  isBusinessDay: boolean;
  weekday: Weekday;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName: string | null;
};

/** date は検証済みの YYYY-MM-DD 文字列であること。 */
export function evaluate(date: string): BusinessDayResult {
  const holiday = findHoliday(date);
  const weekend = isWeekendDate(date);

  return {
    date,
    isBusinessDay: !weekend && holiday === undefined,
    weekday: getWeekday(date),
    isWeekend: weekend,
    isHoliday: holiday !== undefined,
    holidayName: holiday?.name ?? null,
  };
}
