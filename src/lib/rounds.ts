// Voting closes every Sunday at 20:00 UK time. This mirrors wbyi_round_end() in Postgres,
// which is the source of truth when an idea is stored. Keep the two in step.

const TZ = "Europe/London";

// Round 1 closes on Sunday 4 October 2026 at 20:00 BST.
export const FIRST_ROUND_END = new Date("2026-10-04T19:00:00Z");

type LondonParts = { year: number; month: number; day: number; hour: number; minute: number; second: number; weekday: number };

function londonParts(at: Date): LondonParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
    weekday: weekdays.indexOf(get("weekday")), // 0 = Monday
  };
}

// Offset of London from UTC, in minutes, at a given instant.
function londonOffsetMinutes(at: Date): number {
  const p = londonParts(at);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - at.getTime()) / 60000);
}

// Convert a London wall-clock time to the real instant.
function fromLondon(year: number, month: number, day: number, hour: number): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour));
  const offset = londonOffsetMinutes(guess);
  const first = new Date(guess.getTime() - offset * 60000);
  const offset2 = londonOffsetMinutes(first);
  return offset2 === offset ? first : new Date(guess.getTime() - offset2 * 60000);
}

export function roundEndFor(at: Date = new Date()): Date {
  const p = londonParts(at);
  const daysToSunday = 6 - p.weekday;
  const sunday = new Date(Date.UTC(p.year, p.month - 1, p.day + daysToSunday));
  let close = fromLondon(sunday.getUTCFullYear(), sunday.getUTCMonth() + 1, sunday.getUTCDate(), 20);
  if (at.getTime() >= close.getTime()) {
    const next = new Date(Date.UTC(sunday.getUTCFullYear(), sunday.getUTCMonth(), sunday.getUTCDate() + 7));
    close = fromLondon(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate(), 20);
  }
  return close;
}

export function roundNumber(roundEnd: Date | string): number {
  const end = typeof roundEnd === "string" ? new Date(roundEnd) : roundEnd;
  const weeks = Math.round((end.getTime() - FIRST_ROUND_END.getTime()) / (7 * 24 * 3600 * 1000));
  return Math.max(1, weeks + 1);
}

export function roundEndFromNumber(n: number): Date {
  // Walk from round 1 so the clock change is handled by fromLondon.
  const base = new Date(Date.UTC(2026, 9, 4 + (n - 1) * 7));
  return fromLondon(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), 20);
}

export function formatLondon(at: Date | string, opts: Intl.DateTimeFormatOptions): string {
  const d = typeof at === "string" ? new Date(at) : at;
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...opts }).format(d);
}

export function formatRoundClose(end: Date | string): string {
  return formatLondon(end, { weekday: "long", day: "numeric", month: "long" });
}

export function formatShortDate(at: Date | string): string {
  return formatLondon(at, { day: "numeric", month: "short", year: "numeric" });
}

export function timeAgo(at: Date | string, now: Date = new Date()): string {
  const d = typeof at === "string" ? new Date(at) : at;
  const s = Math.max(0, Math.round((now.getTime() - d.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? "" : "s"} ago`;
  const days = Math.round(h / 24);
  if (days < 14) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatShortDate(d);
}
