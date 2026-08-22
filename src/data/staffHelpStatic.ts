import type { Language } from "../i18n/staffHelpStrings";

export type Contact = {
  name: string;
  role: string;
  phone: string | null;
  avatarClass: "" | "amber" | "red";
};

export function getContacts(language: Language): Contact[] {
  const isEs = language === "es";
  return [
    {
      name: "Brian Lagman",
      role: isEs
        ? "Preguntas de lavado y doblado, o cualquier otra cosa"
        : "Wash & fold questions, or anything else",
      phone: "(925) 481-8470",
      avatarClass: "",
    },
    {
      name: "Jonathan Canites",
      role: isEs
        ? "Máquinas y emergencias, o cualquier otra cosa"
        : "Machines & emergencies, or anything else",
      phone: "(415) 916-1919",
      avatarClass: "amber",
    },
    {
      name: "Emergency Services",
      role: isEs ? "Incendio, emergencia médica, robo" : "Fire, medical, break-in",
      phone: "911",
      avatarClass: "red",
    },
  ];
}
