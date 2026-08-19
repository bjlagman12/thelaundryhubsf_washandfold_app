import styles from "./StaffHelp.module.css";
import { contacts } from "../../data/staffHelpStatic";
import type { StaffHelpStrings } from "../../i18n/staffHelpStrings";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const avatarClassFor = (cls: "" | "amber" | "red") => {
  if (cls === "amber") return styles.avatarAmber;
  if (cls === "red") return styles.avatarRed;
  return "";
};

export default function EmergencyTab({ t }: { t: StaffHelpStrings }) {
  return (
    <div>
      <div className={styles.emergencyBanner}>{t.emergencyBanner}</div>
      <div className={styles.contactList}>
        {contacts.map((c) => (
          <div key={c.name} className={styles.contactCard}>
            <div className={`${styles.avatar} ${avatarClassFor(c.avatarClass)}`}>
              {initials(c.name)}
            </div>
            <div className={styles.contactInfo}>
              <div className={styles.contactName}>{c.name}</div>
              <div className={styles.contactRole}>{c.role}</div>
            </div>
            {c.phone ? (
              <a
                className={styles.contactNumber}
                href={`tel:${c.phone.replace(/[^0-9]/g, "")}`}
              >
                {c.phone}
              </a>
            ) : (
              <span className={styles.contactNumberMissing}>{t.contactAddNumber}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
