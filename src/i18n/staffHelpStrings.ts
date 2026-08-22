export type Language = "en" | "es";

export type StaffHelpStrings = {
  eyebrow: string;
  title: string;
  subtitle: string;
  tabSchedule: string;
  tabHelp: string;
  tabEmergency: string;
  scheduleGuidelinesTitle: string;
  scheduleGuidelines: string[];
  scheduleLoading: string;
  scheduleError: string;
  scheduleNotConfigured: string;
  scheduleUnavailable: string;
  myScheduleAll: string;
  myScheduleEmpty: string;
  searchPlaceholder: string;
  resultsCount: (n: number) => string;
  faqLoading: string;
  faqError: string;
  faqEmpty: string;
  faqNoMatches: string;
  categoryAll: string;
  emergencyBanner: string;
  contactAddNumber: string;
  footer: string;
  languageToggle: string;
};

export const staffHelpStrings: Record<Language, StaffHelpStrings> = {
  en: {
    eyebrow: "The Laundry Hub SF",
    title: "Staff Help",
    subtitle: "Schedule, updates, and answers in one place",
    tabSchedule: "Schedule",
    tabHelp: "Ask",
    tabEmergency: "Contacts",
    scheduleGuidelinesTitle: "Important",
    scheduleGuidelines: [
      "These are set drop-off/pickup windows for wash & fold orders. Be on time and available.",
      "Finish your order or find a good stopping point before clocking out. It's okay to stay a little later to finish up.",
      "Busy with orders? You're welcome to come in 1–2 hrs early, just ask Brian first.",
      "Need a day off? Swap shifts with a coworker and give Brian at least 2 weeks' notice.",
    ],
    scheduleLoading: "Loading schedule…",
    scheduleError: "Couldn't load the schedule right now. Try again later.",
    scheduleNotConfigured: "Schedule isn't connected yet.",
    scheduleUnavailable: "Not available",
    myScheduleAll: "All",
    myScheduleEmpty: "No upcoming shifts found.",
    searchPlaceholder: "Ask a question, like: how do I clock in?",
    resultsCount: (n: number) => `${n} result${n === 1 ? "" : "s"}`,
    faqLoading: "Loading answers…",
    faqError: "Couldn't load answers right now. Try again later.",
    faqEmpty: "No answers have been added yet. Check back soon.",
    faqNoMatches: "No matches. Try different words, or ask a manager directly.",
    categoryAll: "All",
    emergencyBanner: "For fire, medical, or a break-in, call 911 first, then let Brian and Jon know.",
    contactAddNumber: "add number",
    footer: "Can't find your answer? Text Brian at (925) 481-8470 or Jon at (415) 916-1919, either can help.",
    languageToggle: "Español",
  },
  es: {
    eyebrow: "The Laundry Hub SF",
    title: "Ayuda para el Personal",
    subtitle: "Horario, novedades y respuestas en un solo lugar",
    tabSchedule: "Horario",
    tabHelp: "Preguntar",
    tabEmergency: "Contactos",
    scheduleGuidelinesTitle: "Importante",
    scheduleGuidelines: [
      "Estos horarios son fijos para pedidos de lavado y doblado. Llegue a tiempo y esté disponible.",
      "Termine su pedido o encuentre un buen punto de pausa antes de terminar su turno. Está bien quedarse un poco más para terminar.",
      "¿Mucho trabajo? Puede llegar 1–2 horas antes, solo pregúntele a Brian primero.",
      "¿Necesita un día libre? Cambie su turno con un compañero y avísele a Brian con al menos 2 semanas de anticipación.",
    ],
    scheduleLoading: "Cargando horario…",
    scheduleError: "No se pudo cargar el horario. Intenta de nuevo más tarde.",
    scheduleNotConfigured: "El horario aún no está conectado.",
    scheduleUnavailable: "No disponible",
    myScheduleAll: "Todos",
    myScheduleEmpty: "No hay turnos próximos.",
    searchPlaceholder: "Haz una pregunta, por ejemplo: ¿cómo marco mi entrada?",
    resultsCount: (n: number) => `${n} resultado${n === 1 ? "" : "s"}`,
    faqLoading: "Cargando respuestas…",
    faqError: "No se pudieron cargar las respuestas. Intenta de nuevo más tarde.",
    faqEmpty: "Todavía no se han agregado respuestas. Vuelve pronto.",
    faqNoMatches: "Sin resultados. Prueba otras palabras o pregunta a un gerente.",
    categoryAll: "Todas",
    emergencyBanner: "Para incendio, emergencia médica o robo, llama al 911 primero y luego avisa a Brian y Jon.",
    contactAddNumber: "agregar número",
    footer: "¿No encuentras tu respuesta? Envía un mensaje a Brian al (925) 481-8470 o a Jon al (415) 916-1919, cualquiera de los dos puede ayudar.",
    languageToggle: "English",
  },
};
