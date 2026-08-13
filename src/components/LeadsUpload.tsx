import { useState } from "react";
import Papa from "papaparse";
import { Helmet } from "react-helmet";

type LeadRow = {
  title: string;
  categoryName: string;
  phone: string;
  phoneUnformatted: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  website: string;
  totalScore: string;
  reviewsCount: string;
  placeId: string;
  url: string;
};

const FIELDS: (keyof LeadRow)[] = [
  "title",
  "categoryName",
  "phone",
  "phoneUnformatted",
  "address",
  "city",
  "state",
  "postalCode",
  "website",
  "totalScore",
  "reviewsCount",
  "placeId",
  "url",
];

const normalizePhone = (value: string) => value.replace(/\D/g, "");

const toLeadRow = (raw: Record<string, string>): LeadRow => {
  const row = {} as LeadRow;
  for (const field of FIELDS) {
    row[field] = (raw[field] ?? "").trim();
  }
  return row;
};

export default function LeadsUpload() {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [totalParsed, setTotalParsed] = useState(0);
  const [duplicatesRemoved, setDuplicatesRemoved] = useState(0);
  const [skippedNoPhone, setSkippedNoPhone] = useState(0);
  const [error, setError] = useState("");
  const [sendState, setSendState] = useState<
    "idle" | "sending" | "sent" | "failed"
  >("idle");

  const handleFile = (file: File) => {
    setError("");
    setFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map(toLeadRow);

        const seenPhones = new Set<string>();
        const unique: LeadRow[] = [];
        let noPhoneCount = 0;
        let dupeCount = 0;

        for (const row of parsed) {
          const normalized = normalizePhone(row.phoneUnformatted || row.phone);

          if (!normalized) {
            // Can't dedupe without a phone number — keep it as-is.
            noPhoneCount += 1;
            unique.push(row);
            continue;
          }

          if (seenPhones.has(normalized)) {
            dupeCount += 1;
            continue;
          }

          seenPhones.add(normalized);
          unique.push(row);
        }

        setTotalParsed(parsed.length);
        setDuplicatesRemoved(dupeCount);
        setSkippedNoPhone(noPhoneCount);
        setRows(unique);
      },
      error: (err) => {
        setError(err.message);
      },
    });
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const sendToN8n = async () => {
    setSendState("sending");
    try {
      const res = await fetch(import.meta.env.VITE_N8N_DEDUPE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, leads: rows }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSendState("sent");
    } catch (err) {
      console.error(err);
      setSendState("failed");
    }
  };

  return (
    <>
      <Helmet>
        <title>Leads Upload &amp; Dedupe | The Laundry Hub SF</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-white shadow-md rounded-lg max-w-5xl mx-auto p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Leads Upload &amp; Dedupe
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Upload a Google Places export (CSV). Rows with matching phone
            numbers are treated as the same business and collapsed down to
            one.
          </p>

          <label
            htmlFor="csv-file"
            className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 text-gray-500 text-sm transition mb-4"
          >
            {fileName || "Click to upload a CSV file"}
            <input
              type="file"
              id="csv-file"
              accept=".csv,text/csv"
              onChange={onFileInputChange}
              className="hidden"
            />
          </label>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {rows.length > 0 && (
            <>
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                  Rows read: {totalParsed}
                </span>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
                  Unique businesses: {rows.length}
                </span>
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  Duplicates removed: {duplicatesRemoved}
                </span>
                {skippedNoPhone > 0 && (
                  <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                    Missing phone (kept as-is): {skippedNoPhone}
                  </span>
                )}
              </div>

              <div className="flex justify-end items-center gap-3 mb-4">
                {sendState === "sent" && (
                  <span className="text-green-600 text-sm">
                    Sent to n8n ✅
                  </span>
                )}
                {sendState === "failed" && (
                  <span className="text-red-600 text-sm">
                    Failed to send — see console
                  </span>
                )}
                <button
                  onClick={sendToN8n}
                  disabled={sendState === "sending"}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                >
                  {sendState === "sending" ? "Sending…" : "Send to n8n"}
                </button>
              </div>

              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-3 py-2">Business</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Phone</th>
                      <th className="px-3 py-2">Address</th>
                      <th className="px-3 py-2">City</th>
                      <th className="px-3 py-2">Rating</th>
                      <th className="px-3 py-2">Reviews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={row.placeId || i} className="border-t">
                        <td className="px-3 py-2 font-medium text-gray-800">
                          {row.title}
                        </td>
                        <td className="px-3 py-2">{row.categoryName}</td>
                        <td className="px-3 py-2">{row.phone}</td>
                        <td className="px-3 py-2">{row.address}</td>
                        <td className="px-3 py-2">{row.city}</td>
                        <td className="px-3 py-2">{row.totalScore}</td>
                        <td className="px-3 py-2">{row.reviewsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
