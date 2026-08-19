import { useEffect, useState } from "react";
import styles from "./StaffHelp.module.css";
import { fetchUpcomingSchedule, type ShiftRow } from "../../lib/googleSheets";
import type { StaffHelpStrings } from "../../i18n/staffHelpStrings";

const SPREADSHEET_ID = import.meta.env.VITE_STAFF_SCHEDULE_SHEET_ID as
  | string
  | undefined;
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY as
  | string
  | undefined;

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

const startOfWeek = (d: Date) => {
  const copy = startOfDay(d);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
};

const CALENDAR_WEEKS = 3;

const calendarDates = (from: Date) =>
  Array.from({ length: CALENDAR_WEEKS * 7 }, (_, i) => {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    return d;
  });

const SHORT_WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_WEEKDAY = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const MONTH_NAME = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad2 = (n: number) => String(n).padStart(2, "0");

export default function ScheduleTab({ t }: { t: StaffHelpStrings }) {
  const today = startOfDay(new Date());
  const days = calendarDates(startOfWeek(today));

  const [activeDate, setActiveDate] = useState<Date>(today);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "unconfigured">(
    "loading"
  );
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  useEffect(() => {
    if (!SPREADSHEET_ID || !API_KEY) {
      setStatus("unconfigured");
      return;
    }
    fetchUpcomingSchedule(SPREADSHEET_ID, API_KEY)
      .then((rows) => {
        setShifts(rows);
        setStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, []);

  const shiftsForActiveDay = shifts.filter((s) => isSameDay(s.date, activeDate));

  const employeeNames = [...new Set(shifts.map((s) => s.employee))].sort();

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

  // Full schedule (all employees), grouped by day, spanning every fetched
  // month, not just the 2-week window — for staff who want to look ahead.
  const upcomingShifts = shifts
    .filter((s) => s.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const fullScheduleByDay: { date: Date; shifts: ShiftRow[] }[] = [];
  for (const s of upcomingShifts) {
    const last = fullScheduleByDay[fullScheduleByDay.length - 1];
    if (last && isSameDay(last.date, s.date)) {
      last.shifts.push(s);
    } else {
      fullScheduleByDay.push({ date: s.date, shifts: [s] });
    }
  }
  const lastScheduledDate =
    fullScheduleByDay.length > 0
      ? fullScheduleByDay[fullScheduleByDay.length - 1].date
      : null;
  const lastScheduledLabel = lastScheduledDate
    ? `${MONTH_NAME[lastScheduledDate.getMonth()].slice(0, 3)} ${lastScheduledDate.getDate()}`
    : "";

  const monthLabel = (() => {
    const first = days[0];
    const last = days[days.length - 1];
    if (first.getMonth() === last.getMonth()) {
      return `${MONTH_NAME[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${MONTH_NAME[first.getMonth()]} – ${MONTH_NAME[last.getMonth()]} ${last.getFullYear()}`;
  })();

  const selectedDayLabel = `${FULL_WEEKDAY[activeDate.getDay()]} ${pad2(
    activeDate.getMonth() + 1
  )}/${pad2(activeDate.getDate())}`;

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
          {status === "ready" && (
            <div className={styles.employeeChips}>
              <button
                type="button"
                className={`${styles.chip} ${!showFullSchedule ? styles.chipActive : ""}`}
                onClick={() => setShowFullSchedule(false)}
              >
                {t.scheduleViewCalendar}
              </button>
              <button
                type="button"
                className={`${styles.chip} ${showFullSchedule ? styles.chipActive : ""}`}
                onClick={() => setShowFullSchedule(true)}
              >
                {t.scheduleViewFull}
              </button>
            </div>
          )}

          {showFullSchedule ? (
            <>
              {lastScheduledLabel && (
                <div className={styles.scheduleNote}>
                  {t.scheduleFullThrough(lastScheduledLabel)}
                </div>
              )}
              <div className={styles.shiftList}>
                {fullScheduleByDay.length === 0 && (
                  <div className={styles.empty}>
                    <div className={styles.emptyBig}>🗓️</div>
                    <div>{t.myScheduleEmpty}</div>
                  </div>
                )}
                {fullScheduleByDay.map(({ date, shifts: dayShifts }) => {
                  const dateLabel = `${FULL_WEEKDAY[date.getDay()]} ${pad2(
                    date.getMonth() + 1
                  )}/${pad2(date.getDate())}`;
                  return (
                    <div key={date.toISOString()}>
                      <div className={styles.selectedDayHeading}>{dateLabel}</div>
                      {dayShifts.map((s, i) => {
                        const unavailable = /no disponible/i.test(s.shift);
                        const avatarClass =
                          EMPLOYEE_AVATAR_CLASS[s.employee] ?? FALLBACK_AVATAR_CLASS;
                        return (
                          <div key={`${s.employee}-${i}`} className={styles.shiftCard}>
                            <div className={`${styles.avatar} ${avatarClass}`}>
                              {initials(s.employee)}
                            </div>
                            <div className={styles.shiftInfo}>
                              <div className={styles.shiftName}>{s.employee}</div>
                              <div className={styles.shiftTime}>
                                {unavailable ? t.scheduleUnavailable : s.shift}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className={styles.monthHeading}>{monthLabel}</div>
              <div className={styles.calendarWeekdayRow}>
                {SHORT_WEEKDAY.map((label) => (
                  <div key={label} className={styles.calendarWeekdayLabel}>
                    {label}
                  </div>
                ))}
              </div>
              <div className={styles.calendarGrid}>
                {days.map((day) => {
                  const isToday = isSameDay(day, today);
                  const isActive = isSameDay(day, activeDate);
                  const isPast = day < today && !isToday;
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => setActiveDate(day)}
                      className={`${styles.dateCell} ${isPast ? styles.dateCellPast : ""} ${
                        isToday ? styles.dateCellToday : ""
                      } ${isActive ? styles.dateCellActive : ""}`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className={styles.selectedDayHeading}>{selectedDayLabel}</div>
              <div className={styles.shiftList}>
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
                {status === "ready" && shiftsForActiveDay.length === 0 && (
                  <div className={styles.empty}>
                    <div className={styles.emptyBig}>🗓️</div>
                    <div>{t.scheduleEmptyForDay}</div>
                  </div>
                )}
                {status === "ready" &&
                  shiftsForActiveDay.map((s, i) => {
                    const unavailable = /no disponible/i.test(s.shift);
                    const avatarClass =
                      EMPLOYEE_AVATAR_CLASS[s.employee] ?? FALLBACK_AVATAR_CLASS;
                    return (
                      <div key={`${s.employee}-${i}`} className={styles.shiftCard}>
                        <div className={`${styles.avatar} ${avatarClass}`}>
                          {initials(s.employee)}
                        </div>
                        <div className={styles.shiftInfo}>
                          <div className={styles.shiftName}>{s.employee}</div>
                          <div className={styles.shiftTime}>
                            {unavailable ? t.scheduleUnavailable : s.shift}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
            const dateLabel = `${FULL_WEEKDAY[date.getDay()]} ${pad2(
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
