// Locker code: "C" + last 4 digits of the customer's phone + key emoji.
export const getLockerCode = (phone: string): string => {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 4) return "";
  return `C${digits.slice(-4)} 🔑`;
};
