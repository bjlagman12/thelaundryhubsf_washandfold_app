export type Contact = {
  name: string;
  role: string;
  phone: string | null;
  avatarClass: "" | "amber" | "red";
};

export const contacts: Contact[] = [
  {
    name: "Brian Lagman",
    role: "Wash & fold questions, or anything else",
    phone: "(925) 481-8470",
    avatarClass: "",
  },
  {
    name: "Jonathan Canites",
    role: "Machines & emergencies, or anything else",
    phone: "(415) 916-1919",
    avatarClass: "amber",
  },
  {
    name: "Emergency Services",
    role: "Fire, medical, break-in",
    phone: "911",
    avatarClass: "red",
  },
];
