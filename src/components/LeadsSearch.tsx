import { useEffect, useRef, useState } from "react";
import { httpsCallable } from "firebase/functions";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { Helmet } from "react-helmet";
import { functions, db } from "../firebase";

type ScrapeRun = {
  id: string;
  searchQueries: string[];
  quantity: number;
  status: "started" | "completed" | "failed";
  totalScraped?: number;
  createdAt?: Timestamp;
  completedAt?: Timestamp;
};

const formatTimestamp = (ts?: Timestamp) =>
  ts ? ts.toDate().toLocaleString() : "";

const STATUS_STYLES: Record<ScrapeRun["status"], string> = {
  started: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const DEFAULT_QUANTITY = 50;

export default function LeadsSearch() {
  const [searchText, setSearchText] = useState("");
  // Kept as a raw string (not a number) so the field can be freely edited —
  // binding a number input directly to a numeric state snaps the DOM value
  // back to "0" the instant the field is cleared, which then shows as a
  // leading zero (e.g. "01") the moment the next digit is typed.
  const [quantityText, setQuantityText] = useState(String(DEFAULT_QUANTITY));
  const [submitState, setSubmitState] = useState<
    "idle" | "starting" | "started" | "failed"
  >("idle");
  const [error, setError] = useState("");
  const [runs, setRuns] = useState<ScrapeRun[]>([]);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [toast, setToast] = useState("");
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );

  // Tracks the last known status per run so we only celebrate a fresh
  // started -> completed transition, not every already-completed run on
  // first load.
  const lastStatuses = useRef<Map<string, ScrapeRun["status"]>>(new Map());
  const isFirstSnapshot = useRef(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "scrapeRuns"), orderBy("createdAt", "desc"), limit(10)),
      (snapshot) => {
        const nextRuns = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            searchQueries: data.searchQueries ?? [],
            quantity: data.quantity ?? 0,
            status: data.status ?? "started",
            totalScraped: data.totalScraped,
            createdAt: data.createdAt,
            completedAt: data.completedAt,
          } as ScrapeRun;
        });

        if (!isFirstSnapshot.current) {
          for (const run of nextRuns) {
            const prevStatus = lastStatuses.current.get(run.id);
            if (prevStatus && prevStatus !== "completed" && run.status === "completed") {
              const label = run.searchQueries.join(", ") || "Leads search";
              const message = `✅ ${label} — ${run.totalScraped ?? 0} scraped and sent to n8n`;
              setToast(message);
              setTimeout(() => setToast(""), 8000);
              if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                new Notification("Leads search complete", { body: message });
              }
            }
          }
        }

        nextRuns.forEach((run) => lastStatuses.current.set(run.id, run.status));
        isFirstSnapshot.current = false;
        setRuns(nextRuns);
        setLoadingRuns(false);
      }
    );

    return unsubscribe;
  }, []);

  const enableNotifications = async () => {
    if (typeof Notification === "undefined") return;
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const searchQueries = searchText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (searchQueries.length === 0) {
      setError("Enter at least one search.");
      setSubmitState("failed");
      return;
    }

    const quantity = Math.min(
      Math.max(parseInt(quantityText, 10) || DEFAULT_QUANTITY, 1),
      200
    );

    setSubmitState("starting");
    try {
      const startLeadsScrape = httpsCallable(functions, "startLeadsScrape");
      await startLeadsScrape({ searchQueries, quantity });
      setSubmitState("started");
      setSearchText("");
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      setSubmitState("failed");
    }
  };

  return (
    <>
      <Helmet>
        <title>Leads Search | The Laundry Hub SF</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-white shadow-md rounded-lg max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Leads Search
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter one search per line (e.g. "day spa in San Francisco",
            "day spa in Daly City") and how many results to pull per search.
            This runs a Google Maps scrape across all of them in one go and
            sends the results straight to n8n — no CSV needed.
          </p>

          {toast && (
            <div className="mb-6 px-4 py-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm">
              {toast}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label
                htmlFor="searchText"
                className="block text-sm font-medium text-gray-700"
              >
                Search (one area per line)
              </label>
              <textarea
                id="searchText"
                required
                rows={4}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={"day spa in San Francisco\nday spa in Daly City\nday spa in Brisbane"}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700"
              >
                Quantity (per search)
              </label>
              <input
                type="number"
                id="quantity"
                required
                min={1}
                max={200}
                value={quantityText}
                onChange={(e) => setQuantityText(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitState === "starting"}
                className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                {submitState === "starting" ? "Starting…" : "Run search"}
              </button>
              {submitState === "started" && (
                <span className="text-green-600 text-sm">
                  Started — results will be sent to n8n automatically when the
                  scrape finishes.
                </span>
              )}
              {submitState === "failed" && (
                <span className="text-red-600 text-sm">
                  Failed to start: {error}
                </span>
              )}
            </div>
          </form>

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent runs
            </h2>
            {notifPermission !== "granted" && (
              <button
                onClick={enableNotifications}
                className="text-sm text-blue-600 hover:underline"
              >
                🔔 Enable browser notifications
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-2">
            This list updates live — no need to refresh.
          </p>

          {loadingRuns ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : runs.length === 0 ? (
            <p className="text-sm text-gray-400">No runs yet.</p>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Search</th>
                    <th className="px-3 py-2">Quantity</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Scraped</th>
                    <th className="px-3 py-2">Started</th>
                    <th className="px-3 py-2">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-t">
                      <td className="px-3 py-2 font-medium text-gray-800">
                        {run.searchQueries.join(", ")}
                      </td>
                      <td className="px-3 py-2">{run.quantity}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${STATUS_STYLES[run.status]}`}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{run.totalScraped ?? "-"}</td>
                      <td className="px-3 py-2">
                        {formatTimestamp(run.createdAt)}
                      </td>
                      <td className="px-3 py-2">
                        {formatTimestamp(run.completedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
