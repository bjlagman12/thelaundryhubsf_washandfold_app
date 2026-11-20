// Temporary locker numbers (back of the store). Update here if they change.
export const LOCKER_LAYOUT: { id: string; position: string }[] = [
  { id: "23", position: "Top left" },
  { id: "25", position: "Top right" },
  { id: "24", position: "Bottom left" },
  { id: "26", position: "Bottom right" },
];

export const MAX_LOCKERS = 2;

export const LOCKER_STEPS: string[] = [
  "Choose an available locker. It will be unlocked.",
  "Put your laundry in it.",
  "Close it.",
  "Lock it with your code below.",
];
