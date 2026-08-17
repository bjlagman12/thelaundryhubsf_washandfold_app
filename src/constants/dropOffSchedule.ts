// Staff are only on-site during these windows — no drop-off/pickup is
// possible outside them, so both the displayed hours and the time slot
// options must stay in sync with this single source of truth.
export const TIME_SLOTS_BY_DAY: Record<number, string[]> = {
  0: ["10:00 AM - 11:00 AM", "7:00 PM - 8:30 PM"], // Sunday
  1: ["12:15 PM - 1:15 PM", "7:00 PM - 8:30 PM"], // Monday
  2: ["10:00 AM - 12:00 PM", "7:00 PM - 8:30 PM"], // Tuesday
  3: ["12:15 PM - 1:15 PM", "7:00 PM - 8:30 PM"], // Wednesday
  4: ["12:15 PM - 1:15 PM", "7:00 PM - 8:30 PM"], // Thursday
  5: ["10:00 AM - 11:00 AM", "7:00 PM - 8:30 PM"], // Friday
  6: ["10:00 AM - 11:00 AM", "7:00 PM - 8:30 PM"], // Saturday
};

export const DAY_LABELS: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const DAY_ORDER = [0, 1, 2, 3, 4, 5, 6];
