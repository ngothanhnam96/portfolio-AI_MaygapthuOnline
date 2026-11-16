// Seasonal backdrops: Vietnamese holidays and festivals the machine can dress up for.
//
// Fixed-date events repeat every year. Tết and Trung Thu follow the lunar calendar, so their
// solar dates come from a table (LUNAR) that has to be extended past its last year.
// Days are counted as whole local calendar days, never as hours, so time zones and
// daylight saving cannot shift an event by one day.

export const LUNAR = {
  // Mùng 1 Tết (first day of the lunar new year).
  tet: { 2026: [2, 17], 2027: [2, 6], 2028: [1, 26], 2029: [2, 13], 2030: [2, 3] },
  // Rằm tháng Tám (15th day of the 8th lunar month).
  trungthu: { 2026: [9, 25], 2027: [9, 15], 2028: [10, 3], 2029: [9, 22], 2030: [9, 12] },
};

// `days` is how long the event lasts (default 1). `theme` overrides the machine's colours
// and decoration while the backdrop is on; the toys and rules stay the machine's own.
export const EVENTS = [
  {
    id: "tet", name: "Tết Nguyên Đán", icon: "🧧", lunar: "tet", days: 3,
    banner: "Chúc Mừng Năm Mới",
    theme: { wall: "#5a0f14", wall2: "#9a1c22", neon: "#ffd23f", floor: "#6e1a1a", decor: "tet" },
  },
  {
    id: "valentine", name: "Lễ Tình Nhân", icon: "💝", date: [2, 14],
    banner: "Happy Valentine",
    theme: { wall: "#3a0f2a", wall2: "#6a1a48", neon: "#ff6fae", floor: "#5a1a40", decor: "hearts" },
  },
  {
    id: "phunu-qt", name: "Quốc tế Phụ nữ", icon: "💐", date: [3, 8],
    banner: "Mừng ngày 8 tháng 3",
    theme: { wall: "#3a1436", wall2: "#6a2a5e", neon: "#ff9ad5", floor: "#5a2050", decor: "flowers" },
  },
  {
    id: "thongnhat", name: "Giải phóng miền Nam & Quốc tế Lao động", icon: "🇻🇳", date: [4, 30], days: 2,
    banner: "Mừng 30/4 và 1/5",
    theme: { wall: "#4a0c10", wall2: "#8a161c", neon: "#ffd23f", floor: "#6a1218", decor: "flag" },
  },
  {
    id: "thieunhi", name: "Quốc tế Thiếu nhi", icon: "🎈", date: [6, 1],
    banner: "Vui Tết Thiếu nhi 1/6",
    theme: { wall: "#13305a", wall2: "#2a5a9a", neon: "#7fe0ff", floor: "#1d4a7a", decor: "balloons" },
  },
  {
    id: "trungthu", name: "Tết Trung Thu", icon: "🏮", lunar: "trungthu",
    banner: "Rước đèn đêm Rằm",
    theme: { wall: "#141a46", wall2: "#26307a", neon: "#ffd84a", floor: "#2c2f6e", decor: "lanterns" },
  },
  {
    id: "quockhanh", name: "Quốc khánh", icon: "🇻🇳", date: [9, 2],
    banner: "Mừng Quốc khánh 2/9",
    theme: { wall: "#4a0c10", wall2: "#8a161c", neon: "#ffd23f", floor: "#6a1218", decor: "flag" },
  },
  {
    id: "phunu-vn", name: "Phụ nữ Việt Nam", icon: "🌷", date: [10, 20],
    banner: "Mừng ngày 20 tháng 10",
    theme: { wall: "#3a1436", wall2: "#6a2a5e", neon: "#ff9ad5", floor: "#5a2050", decor: "flowers" },
  },
  {
    id: "halloween", name: "Halloween", icon: "🎃", date: [10, 31],
    banner: "Trick or Treat",
    theme: { wall: "#1a0f24", wall2: "#3a1a4a", neon: "#ff8a1e", floor: "#2a1636", decor: "halloween" },
  },
  {
    id: "nhagiao", name: "Nhà giáo Việt Nam", icon: "📚", date: [11, 20],
    banner: "Tri ân Thầy Cô",
    theme: { wall: "#10301e", wall2: "#1d4a30", neon: "#ffe08a", floor: "#1a3a26", decor: "teacher" },
  },
  {
    id: "vanhoa", name: "Ngày Văn hóa Việt Nam", icon: "🥁", date: [11, 24],
    banner: "Ngày Văn hóa Việt Nam",
    theme: { wall: "#2a1a0e", wall2: "#4e3018", neon: "#ffc35a", floor: "#3a2614", decor: "culture" },
  },
  {
    id: "noel", name: "Giáng sinh", icon: "🎄", date: [12, 24], days: 2,
    banner: "Merry Christmas",
    theme: { wall: "#0e2236", wall2: "#1a3f5e", neon: "#ff5a5a", floor: "#2a4a6a", decor: "noel" },
  },
  {
    id: "namoi", name: "Giao thừa & Năm mới", icon: "🎆", date: [12, 31], days: 2,
    banner: "Happy New Year",
    theme: { wall: "#0a0a24", wall2: "#1c1c50", neon: "#9ad8ff", floor: "#20204a", decor: "newyear" },
  },
];

const BY_ID = new Map(EVENTS.map((e) => [e.id, e]));

export function eventById(id) {
  return BY_ID.get(id) ?? null;
}

/** A calendar day as a whole number, so subtracting two gives days between them. */
export function dayNumber(year, month, day) {
  return Math.round(Date.UTC(year, month - 1, day) / 86400000);
}

/** Today's day number from a Date, using the player's local calendar. */
export function today(date = new Date()) {
  return dayNumber(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/** The event's dates in one year, or null when a lunar event's table has no entry for it. */
export function occurrence(event, year) {
  const md = event.lunar ? LUNAR[event.lunar][year] : event.date;
  if (!md) return null;
  const start = dayNumber(year, md[0], md[1]);
  return { event, year, month: md[0], day: md[1], start, end: start + (event.days ?? 1) - 1 };
}

/**
 * The event's next occurrence that has not ended yet, as seen on `day`. Last year is checked
 * too, so a New Year's Eve that runs into 1 January is still "on" that morning.
 */
export function nextOccurrence(event, day) {
  const year = new Date(day * 86400000).getUTCFullYear();
  for (const y of [year - 1, year, year + 1]) {
    const o = occurrence(event, y);
    if (o && o.end >= day) return { ...o, daysUntil: Math.max(0, o.start - day), live: o.start <= day };
  }
  return null;
}

/** Every event with a known next date, soonest first. */
export function upcoming(day) {
  return EVENTS.map((e) => nextOccurrence(e, day))
    .filter(Boolean)
    .sort((a, b) => a.start - b.start || a.event.id.localeCompare(b.event.id));
}

export function nextEvent(day) {
  return upcoming(day)[0] ?? null;
}

/**
 * The backdrop a saved setting asks for: "off", "auto" (the next event) or an event id.
 * An unknown id falls back to no backdrop. A lunar event past the end of its table still
 * returns the event (with this year's number), so the art can be shown without a date.
 */
export function resolveBackdrop(setting, day) {
  if (setting === "auto") return nextEvent(day);
  const event = eventById(setting);
  if (!event) return null;
  return nextOccurrence(event, day) ?? { event, year: new Date(day * 86400000).getUTCFullYear(), daysUntil: null, live: false };
}

/** "24/11" style date, or "" when the date is unknown. */
export function dateLabel(o) {
  return o?.day ? `${o.day}/${o.month}` : "";
}

/** "Đang diễn ra", "Ngày mai", "Còn 8 ngày" or "" for an unknown date. */
export function countdownLabel(o) {
  if (!o || o.daysUntil == null) return "";
  if (o.live) return "Đang diễn ra";
  if (o.daysUntil === 1) return "Ngày mai";
  return `Còn ${o.daysUntil} ngày`;
}
