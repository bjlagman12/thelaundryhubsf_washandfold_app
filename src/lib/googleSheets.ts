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

const MONTH_ABBREVIATIONS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

async function fetchSheetsJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google Sheets API request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Any "<Mon> <Year> List" tab for the current month or later — so once the
// owner creates next month's tab (e.g. "Oct 2026 List"), employees can see
// it immediately without waiting for the calendar to roll over.
async function findUpcomingTabTitles(
  spreadsheetId: string,
  apiKey: string
): Promise<string[]> {
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}&fields=sheets.properties.title`;
  const meta = await fetchSheetsJson<{
    sheets?: { properties?: { title?: string } }[];
  }>(metaUrl);

  const titles = (meta.sheets ?? [])
    .map((s) => s.properties?.title)
    .filter((t): t is string => Boolean(t));

  const now = new Date();
  const currentSortKey = now.getFullYear() * 12 + now.getMonth();

  const monthTabs = titles
    .map((title) => {
      const match = title.match(/^([A-Za-z]{3}) (\d{4}) List$/);
      if (!match) return null;
      const monthIndex = MONTH_ABBREVIATIONS.indexOf(match[1]);
      if (monthIndex === -1) return null;
      return { title, sortKey: Number(match[2]) * 12 + monthIndex };
    })
    .filter((t): t is { title: string; sortKey: number } => t !== null)
    .sort((a, b) => a.sortKey - b.sortKey);

  const upcoming = monthTabs.filter((t) => t.sortKey >= currentSortKey);

  // Fall back to the most recent past tab if nothing current/future exists
  // yet (e.g. this month's tab hasn't been created).
  if (upcoming.length === 0 && monthTabs.length > 0) {
    return [monthTabs[monthTabs.length - 1].title];
  }

  return upcoming.map((t) => t.title);
}

async function fetchTabShifts(
  spreadsheetId: string,
  apiKey: string,
  tabTitle: string
): Promise<ShiftRow[]> {
  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    tabTitle
  )}?key=${apiKey}`;
  const values = await fetchSheetsJson<{ values?: string[][] }>(valuesUrl);
  const rows = values.values ?? [];

  // The sheet has a few title/notes rows before the real column header
  // ("Date / Fecha", "Day / Día", "Employee / Empleado", "Shift / Turno"),
  // and that count can change if the owner edits the sheet — so find the
  // header row by content instead of assuming a fixed position.
  const headerIndex = rows.findIndex(
    (row) => /date/i.test(row[0] ?? "") && /employee/i.test(row[2] ?? "")
  );
  const dataRows = headerIndex === -1 ? [] : rows.slice(headerIndex + 1);

  // Columns are Date, Day, Employee, Shift (bilingual headers) — forward-fill
  // blank dates, since multiple shifts on the same date only carry the date
  // on the first row.
  const shifts: ShiftRow[] = [];
  let lastDate: Date | null = null;

  for (const row of dataRows) {
    const [dateCell, , employeeCell, shiftCell] = row;
    if (dateCell && dateCell.trim()) {
      const parsed = new Date(dateCell.trim());
      if (!Number.isNaN(parsed.getTime())) lastDate = parsed;
    }
    if (!lastDate || !employeeCell) continue;

    shifts.push({
      date: lastDate,
      employee: employeeCell.trim(),
      shift: (shiftCell ?? "").trim(),
    });
  }

  return shifts;
}

export async function fetchUpcomingSchedule(
  spreadsheetId: string,
  apiKey: string
): Promise<ShiftRow[]> {
  const tabTitles = await findUpcomingTabTitles(spreadsheetId, apiKey);
  const perTab = await Promise.all(
    tabTitles.map((title) => fetchTabShifts(spreadsheetId, apiKey, title))
  );
  return perTab.flat().sort((a, b) => a.date.getTime() - b.date.getTime());
}
