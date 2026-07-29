// ISO week utilities (weeks start Monday)

export function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

// Monday-based day-of-week: Mon=0..Sun=6
export function mondayIndex(d: Date) {
  return (d.getDay() + 6) % 7;
}

export function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - mondayIndex(x));
  return x;
}

export function endOfWeek(d: Date) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  return e;
}

// ISO 8601 week number
export function isoWeek(d: Date): { year: number; week: number } {
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  const week =
    1 + Math.round((diff / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
  return { year: target.getFullYear(), week };
}

export function weekKey(d: Date) {
  const { year, week } = isoWeek(d);
  return `${year}-W${pad(week)}`;
}

export function parseWeekKey(key: string): { start: Date; end: Date } {
  const [ys, ws] = key.split("-W");
  const year = Number(ys);
  const week = Number(ws);
  // Jan 4 is always in week 1
  const jan4 = new Date(year, 0, 4);
  const jan4Monday = startOfWeek(jan4);
  const start = new Date(jan4Monday);
  start.setDate(jan4Monday.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

export function monthMatrix(year: number, month: number) {
  // Returns an array of weeks, each with 7 Date cells (Mon..Sun)
  const first = new Date(year, month, 1);
  const gridStart = startOfWeek(first);
  const weeks: Date[][] = [];
  const cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let i = 0; i < 7; i++) {
      row.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(row);
    // Stop if we've passed the month and completed a week
    if (row[6].getMonth() !== month && row[0].getMonth() !== month) {
      if (w >= 4) break;
    }
  }
  return weeks;
}

export const MONTH_NAMES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const WEEKDAY_SHORT_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
