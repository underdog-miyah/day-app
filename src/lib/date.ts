/**
 * 日付処理の方針（日付系 API 共通）
 *
 *   YYYY-MM-DD で受け取った日付は、文字列のまま扱う。
 *   年月日の取り出しは文字列操作で行い、Date へ変換しない。
 *   Date が不可避なのは曜日計算だけなので、そこに閉じ込める。
 *
 * new Date("2026-08-17") は UTC 深夜、new Date(2026, 7, 17) はローカル時刻という
 * 非対称があるため、Date を持ち回すと取り違えが起きやすい。
 */

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** 書式と実在日の両方を検証する。Date は使わない（2026-02-30 のような繰り上がりを算術で弾く）。 */
export function isValidDateString(input: string): boolean {
  const m = DATE_PATTERN.exec(input);
  if (m === null) return false;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);

  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= daysInMonth(year, month);
}

export function getYear(date: string): number {
  return Number(date.slice(0, 4));
}

/**
 * 曜日計算。ここが唯一 Date に触れる箇所。
 *
 * getUTCDay を getDay に書き換えないこと。書き換えると、日本時間の 00:00-09:00 に
 * 実行されたときだけ曜日が 1 日ずれる。
 */
export function getWeekday(date: string): Weekday {
  return WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()]!;
}

export function isWeekendDate(date: string): boolean {
  const weekday = getWeekday(date);
  return weekday === "Sat" || weekday === "Sun";
}
