import { useEffect, useState } from "react";
import styles from "./StaffHelp.module.css";
import { fetchMasterCalendar, type ShiftRow } from "../../lib/googleSheets";
import type { StaffHelpStrings } from "../../i18n/staffHelpStrings";

const SPREADSHEET_ID = import.meta.env.VITE_STAFF_SCHEDULE_SHEET_ID as
  | string
  | undefined;
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY as
  | string
  | undefined;
const SHEET_TITLE = "Master Calendar";

// Per the schedule sheet's own color key note ("Eva = blue, Flori = pink").
// Any employee not listed here falls back to teal so new hires don't break.
const EMPLOYEE_AVATAR_CLASS: Record<string, string> = {
  Eva: styles.avatarLightBlue,
  Flori: styles.avatarPink,
};
const FALLBACK_AVATAR_CLASS = styles.avatarTeal;

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d: Date) => {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

// Builds a 7-wide grid of week rows for a given month, using `null` for
// cells outside the month — matches the source spreadsheet's own blank
// leading/trailing cells exactly.
function monthGridWeeks(year: number, month: number): (number | null)[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const trailingBlanks = (7 - (cells.length % 7)) % 7;
  cells.push(...Array<null>(trailingBlanks).fill(null));

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export default function ScheduleTab({ t }: { t: StaffHelpStrings }) {
  const today = startOfDay(new Date());

  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "unconfigured">(
    "loading"
  );
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  useEffect(() => {
    if (!SPREADSHEET_ID || !API_KEY) {
      setStatus("unconfigured");
      return;
    }
    fetchMasterCalendar(SPREADSHEET_ID, SHEET_TITLE, API_KEY)
      .then((rows) => {
        setShifts(rows);
        setStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, []);

  const employeeNames = [...new Set(shifts.map((s) => s.employee))].sort();

  const monthWeeks = monthGridWeeks(viewMonth.year, viewMonth.month);
  const shiftsByDay = new Map<number, ShiftRow[]>();
  for (const s of shifts) {
    if (s.date.getFullYear() !== viewMonth.year || s.date.getMonth() !== viewMonth.month) {
      continue;
    }
    const list = shiftsByDay.get(s.date.getDate()) ?? [];
    list.push(s);
    shiftsByDay.set(s.date.getDate(), list);
  }

  const monthKeys = shifts.map((s) => s.date.getFullYear() * 12 + s.date.getMonth());
  const minMonthKey = monthKeys.length > 0 ? Math.min(...monthKeys) : null;
  const maxMonthKey = monthKeys.length > 0 ? Math.max(...monthKeys) : null;
  const viewMonthKey = viewMonth.year * 12 + viewMonth.month;
  const canGoPrev = minMonthKey === null || viewMonthKey > minMonthKey;
  const canGoNext = maxMonthKey === null || viewMonthKey < maxMonthKey;

  const goToMonth = (delta: number) => {
    setViewMonth((prev) => {
      const total = prev.year * 12 + prev.month + delta;
      return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
    });
  };

  const viewMonthLabel = `${t.monthNames[viewMonth.month]} ${viewMonth.year}`;

  const myUpcomingShifts = shifts
    .filter((s) => s.employee === selectedEmployee && s.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group same-day shifts (e.g. a morning window and an evening window)
  // under one card instead of repeating the date for each.
  const myScheduleByDay: { date: Date; shifts: ShiftRow[] }[] = [];
  for (const s of myUpcomingShifts) {
    const last = myScheduleByDay[myScheduleByDay.length - 1];
    if (last && isSameDay(last.date, s.date)) {
      last.shifts.push(s);
    } else {
      myScheduleByDay.push({ date: s.date, shifts: [s] });
    }
  }

  return (
    <div>
      <div className={styles.importantCallout}>
        <div className={styles.importantCalloutTitle}>{t.scheduleGuidelinesTitle}</div>
        <ul className={styles.guidelines}>
          {t.scheduleGuidelines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      {status === "ready" && employeeNames.length > 0 && (
        <div className={styles.employeeChips}>
          <button
            type="button"
            className={`${styles.chip} ${selectedEmployee === null ? styles.chipActive : ""}`}
            onClick={() => setSelectedEmployee(null)}
          >
            {t.myScheduleAll}
          </button>
          {employeeNames.map((name) => {
            const avatarClass = EMPLOYEE_AVATAR_CLASS[name] ?? FALLBACK_AVATAR_CLASS;
            return (
              <button
                key={name}
                type="button"
                className={`${styles.chip} ${selectedEmployee === name ? styles.chipActive : ""}`}
                onClick={() => setSelectedEmployee(name)}
              >
                <span
                  className={`${styles.chipDot} ${avatarClass}`}
                  style={selectedEmployee === name ? { background: "var(--white)" } : undefined}
                />
                {name}
              </button>
            );
          })}
        </div>
      )}

      {selectedEmployee === null ? (
        <>
          {status === "unconfigured" && (
            <div className={styles.empty}>
              <div className={styles.emptyBig}>🗓️</div>
              <div>{t.scheduleNotConfigured}</div>
            </div>
          )}
          {status === "loading" && (
            <div className={styles.empty}>
              <div className={styles.emptyBig}>🗓️</div>
              <div>{t.scheduleLoading}</div>
            </div>
          )}
          {status === "error" && (
            <div className={styles.empty}>
              <div className={styles.emptyBig}>⚠️</div>
              <div>{t.scheduleError}</div>
            </div>
          )}
          {status === "ready" && (
            <>
              <div className={styles.monthNavRow}>
                <button
                  type="button"
                  className={styles.monthNavBtn}
                  onClick={() => goToMonth(-1)}
                  disabled={!canGoPrev}
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <div className={styles.monthHeading}>{viewMonthLabel}</div>
                <button
                  type="button"
                  className={styles.monthNavBtn}
                  onClick={() => goToMonth(1)}
                  disabled={!canGoNext}
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>
              <div className={styles.calendarWeekdayRow}>
                {t.weekdayShort.map((label) => (
                  <div key={label} className={styles.calendarWeekdayLabel}>
                    {label}
                  </div>
                ))}
              </div>
              <div className={styles.monthGrid}>
                {monthWeeks.map((week, wi) =>
                  week.map((day, di) => {
                    if (day === null) {
                      return (
                        <div
                          key={`${wi}-${di}`}
                          className={`${styles.dayCell} ${styles.dayCellBlank}`}
                        />
                      );
                    }
                    const cellDate = new Date(viewMonth.year, viewMonth.month, day);
                    const isToday = isSameDay(cellDate, today);
                    const isPast = cellDate < today && !isToday;
                    const dayShiftsList = shiftsByDay.get(day) ?? [];
                    return (
                      <div
                        key={`${wi}-${di}`}
                        className={`${styles.dayCell} ${isToday ? styles.dayCellToday : ""} ${
                          isPast ? styles.dayCellPast : ""
                        }`}
                      >
                        <div className={`${styles.dayNumber} ${isPast ? styles.dayNumberPast : ""}`}>
                          {day}
                        </div>
                        {dayShiftsList.map((s, i) => {
                          const unavailable = /no disponible/i.test(s.shift);
                          const avatarClass =
                            EMPLOYEE_AVATAR_CLASS[s.employee] ?? FALLBACK_AVATAR_CLASS;
                          return (
                            <div
                              key={i}
                              className={`${styles.dayShiftLine} ${
                                unavailable ? styles.dayShiftUnavailable : ""
                              }`}
                            >
                              <span className={`${styles.dayShiftDot} ${avatarClass}`} />
                              <span>
                                {s.employee} {unavailable ? t.scheduleUnavailable : s.shift}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <div className={styles.shiftList}>
          {myUpcomingShifts.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyBig}>🗓️</div>
              <div>{t.myScheduleEmpty}</div>
            </div>
          )}
          {myScheduleByDay.map(({ date, shifts: dayShifts }) => {
            const avatarClass =
              EMPLOYEE_AVATAR_CLASS[selectedEmployee ?? ""] ?? FALLBACK_AVATAR_CLASS;
            const dateLabel = `${t.weekdayFull[date.getDay()]} ${pad2(
              date.getMonth() + 1
            )}/${pad2(date.getDate())}`;
            return (
              <div key={date.toISOString()} className={styles.shiftCard}>
                <div className={`${styles.avatar} ${avatarClass}`}>
                  {initials(selectedEmployee ?? "")}
                </div>
                <div className={styles.shiftInfo}>
                  <div className={styles.myScheduleDate}>{dateLabel}</div>
                  {dayShifts.map((s, i) => {
                    const unavailable = /no disponible/i.test(s.shift);
                    return (
                      <div key={i} className={styles.shiftTime}>
                        {unavailable ? t.scheduleUnavailable : s.shift}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
