import Papa from "papaparse";

export type FaqRow = {
  category: string;
  question: string;
  answer: string;
  keywords: string;
};

export async function fetchFaqCsv(csvUrl: string): Promise<FaqRow[]> {
  const res = await fetch(csvUrl);
  if (!res.ok) throw new Error(`Failed to fetch FAQ sheet: ${res.status}`);
  const text = await res.text();

  const { data } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  return data
    .map((row) => ({
      category: (row["Category"] ?? "").trim(),
      question: (row["Questions"] ?? "").trim(),
      answer: (row["Answers"] ?? "").trim(),
      keywords: (row["key terms"] ?? "").trim(),
    }))
    .filter((row) => row.question && row.answer);
}

export type ShiftRow = {
  date: Date;
  employee: string;
  shift: string;
};

const MONTH_NAMES_UPPER = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

// Matches a month-header row like "AUGUST 2026 / AGOSTO 2026" or
// "NOVEMBER 2026 / NOVIEMBRE 2026 (projected — repeats current rotation)".
const MONTH_HEADER_RE = /^([A-Z]+)\s+(\d{4})/;

async function fetchSheetsJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google Sheets API request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Each in-month cell of the shift row looks like "Eva: 10:00 AM–11:00 AM"
// (multiple entries separated by blank lines, purely for visual grouping in
// the sheet) — split on the first colon to pull out employee + shift text.
function parseCellShifts(cellText: string, date: Date): ShiftRow[] {
  const shifts: ShiftRow[] = [];
  for (const line of cellText.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const sep = trimmed.indexOf(":");
    if (sep === -1) continue;
    shifts.push({
      date,
      employee: trimmed.slice(0, sep).trim(),
      shift: trimmed.slice(sep + 1).trim(),
    });
  }
  return shifts;
}

// Parses the "Master Calendar" sheet — a real visual month-by-month grid
// (month header row, weekday header row, then repeating date-number-row /
// shift-text-row pairs per week, blank row between months) — the same
// layout the owner edits directly, so the app mirrors it exactly.
export async function fetchMasterCalendar(
  spreadsheetId: string,
  sheetTitle: string,
  apiKey: string
): Promise<ShiftRow[]> {
  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    sheetTitle
  )}?key=${apiKey}`;
  const values = await fetchSheetsJson<{ values?: string[][] }>(valuesUrl);
  const rows = values.values ?? [];

  const shifts: ShiftRow[] = [];
  let year: number | null = null;
  let monthIndex: number | null = null;
  let pendingDateRow: string[] | null = null;

  for (const row of rows) {
    const first = (row[0] ?? "").trim();
    const monthMatch = !pendingDateRow && first.match(MONTH_HEADER_RE);
    const matchedMonthIndex = monthMatch
      ? MONTH_NAMES_UPPER.indexOf(monthMatch[1])
      : -1;

    if (monthMatch && matchedMonthIndex !== -1) {
      monthIndex = matchedMonthIndex;
      year = Number(monthMatch[2]);
      continue;
    }

    if (year === null || monthIndex === null) continue; // still before the first month header
    if (!pendingDateRow) {
      // The weekday header row ("Sunday / Domingo", ...) and blank rows
      // between months have no numeric day cells, so they're safely
      // skipped here without needing an explicit row-position counter.
      if (row.some((cell) => /^\d+$/.test((cell ?? "").trim()))) {
        pendingDateRow = row;
      }
      continue;
    }

    // `row` is the shift-text row for `pendingDateRow`.
    for (let col = 0; col < 7; col++) {
      const dayStr = (pendingDateRow[col] ?? "").trim();
      if (!/^\d+$/.test(dayStr)) continue;
      const date = new Date(year, monthIndex, Number(dayStr));
      shifts.push(...parseCellShifts(row[col] ?? "", date));
    }
    pendingDateRow = null;
  }

  return shifts.sort((a, b) => a.date.getTime() - b.date.getTime());
}
