import { useEffect, useMemo, useState } from "react";
import styles from "./StaffHelp.module.css";
import { fetchFaqCsv, type FaqRow } from "../../lib/googleSheets";
import type { StaffHelpStrings } from "../../i18n/staffHelpStrings";

const FAQ_CSV_URL = import.meta.env.VITE_STAFF_FAQ_CSV_URL as string | undefined;

function highlight(text: string, query: string) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i}>{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function HelpTab({ t }: { t: StaffHelpStrings }) {
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "unconfigured">(
    "loading"
  );
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(t.categoryAll);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!FAQ_CSV_URL) {
      setStatus("unconfigured");
      return;
    }
    fetchFaqCsv(FAQ_CSV_URL)
      .then((rows) => {
        setFaqs(rows);
        setStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, []);

  // Reset the active category label when the language toggle changes it
  // ("All" <-> "Todas") so a stale label doesn't stay selected.
  useEffect(() => {
    setActiveCategory(t.categoryAll);
  }, [t.categoryAll]);

  const categories = useMemo(
    () => [t.categoryAll, ...new Set(faqs.map((f) => f.category))],
    [faqs, t.categoryAll]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      const matchesCategory =
        activeCategory === t.categoryAll || f.category === activeCategory;
      const haystack = `${f.question} ${f.answer} ${f.keywords} ${f.category}`.toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [faqs, query, activeCategory, t.categoryAll]);

  return (
    <div>
      <div className={styles.searchWrap}>
        <div className={styles.searchBox}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setQuery("")}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className={styles.categories}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`${styles.chip} ${activeCategory === cat ? styles.chipActive : ""}`}
            onClick={() => {
              setActiveCategory(cat);
              setOpenIndex(null);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className={styles.main}>
        {status === "unconfigured" && (
          <div className={styles.empty}>
            <div className={styles.emptyBig}>❓</div>
            <div>{t.faqEmpty}</div>
          </div>
        )}
        {status === "loading" && (
          <div className={styles.empty}>
            <div className={styles.emptyBig}>❓</div>
            <div>{t.faqLoading}</div>
          </div>
        )}
        {status === "error" && (
          <div className={styles.empty}>
            <div className={styles.emptyBig}>⚠️</div>
            <div>{t.faqError}</div>
          </div>
        )}
        {status === "ready" && (
          <>
            <div className={styles.resultsCount}>
              {filtered.length > 0 ? t.resultsCount(filtered.length) : ""}
            </div>
            {filtered.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyBig}>🔍</div>
                <div>{faqs.length === 0 ? t.faqEmpty : t.faqNoMatches}</div>
              </div>
            )}
            {filtered.map((f) => {
              const realIndex = faqs.indexOf(f);
              const isOpen = openIndex === realIndex;
              return (
                <div
                  key={realIndex}
                  className={`${styles.card} ${isOpen ? styles.cardOpen : ""}`}
                >
                  <button
                    type="button"
                    className={styles.cardQ}
                    onClick={() => setOpenIndex(isOpen ? null : realIndex)}
                  >
                    <span>
                      <span className={styles.tag}>{f.category}</span>
                      {highlight(f.question, query)}
                    </span>
                    <svg
                      className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <div className={`${styles.cardA} ${isOpen ? styles.cardAOpen : ""}`}>
                    <div className={styles.cardAInner}>{highlight(f.answer, query)}</div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}
