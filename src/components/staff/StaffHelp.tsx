import { useState, type ReactElement } from "react";
import { Helmet } from "react-helmet";
import styles from "./StaffHelp.module.css";
import { staffHelpStrings, type Language } from "../../i18n/staffHelpStrings";
import ScheduleTab from "./ScheduleTab";
import HelpTab from "./HelpTab";
import EmergencyTab from "./EmergencyTab";

type Tab = "schedule" | "help" | "emergency";

export default function StaffHelp() {
  const [language, setLanguage] = useState<Language>("es");
  const [activeTab, setActiveTab] = useState<Tab>("schedule");
  const t = staffHelpStrings[language];

  const tabs: { id: Tab; label: string; icon: ReactElement }[] = [
    {
      id: "schedule",
      label: t.tabSchedule,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="3" y="4" width="18" height="18" rx="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
    },
    {
      id: "help",
      label: t.tabHelp,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="11" cy="11" r="7"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      ),
    },
    {
      id: "emergency",
      label: t.tabEmergency,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t.title} | The Laundry Hub SF</title>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Staff Help" />
      </Helmet>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>{t.eyebrow}</div>
          <h1>{t.title}</h1>
          <p className={styles.sub}>{t.subtitle}</p>
          <button
            type="button"
            className={styles.langToggle}
            onClick={() => setLanguage(language === "en" ? "es" : "en")}
          >
            {t.languageToggle}
          </button>
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <div className={`${styles.view} ${activeTab === "schedule" ? styles.viewActive : ""}`}>
          <ScheduleTab t={t} />
        </div>
        <div className={`${styles.view} ${activeTab === "help" ? styles.viewActive : ""}`}>
          <HelpTab t={t} />
        </div>
        <div className={`${styles.view} ${activeTab === "emergency" ? styles.viewActive : ""}`}>
          <EmergencyTab t={t} />
        </div>

        <footer className={styles.footer}>{t.footer}</footer>
      </div>
    </>
  );
}
