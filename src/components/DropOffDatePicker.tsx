// DropOffDatePicker.tsx
import DatePicker from "react-datepicker";
import { FiCalendar } from "react-icons/fi";
import "react-datepicker/dist/react-datepicker.css";

type DropOffDatePickerProps = {
  date: Date | null;
  setDate: (date: Date | null) => void;
  error?: string;
  inputId?: string;
  // when true, only allow Mon/Wed/Fri (pickup & delivery flow)
  pickupOnly?: boolean;
};

const ALLOWED_PICKUP_DAYS = [1, 3, 5]; // Mon=1, Wed=3, Fri=5

function isAllowedPickupDay(d: Date) {
  return ALLOWED_PICKUP_DAYS.includes(d.getDay());
}

export default function DropOffDatePicker({
  date,
  setDate,
  error,
  inputId,
  pickupOnly,
}: DropOffDatePickerProps) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Fallback: weekdays for non-pickup flows
  const isWeekday = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6;

  return (
    <div className="relative">
      <FiCalendar className="absolute z-10 left-3 top-3 pointer-events-none text-gray-400" />
      <DatePicker
        id={inputId}
        selected={date}
        onChange={setDate}
        minDate={tomorrow} // never allow same-day; forces Tue→Wed, Wed→Fri, Fri→Mon, etc.
        filterDate={pickupOnly ? isAllowedPickupDay : isWeekday}
        dateFormat="MMMM d, yyyy"
        autoComplete="off"
        placeholderText="Choose date"
        className={`w-full pl-10 pr-3 py-2 border rounded-md transition
          ${
            date
              ? "bg-blue-50 border-blue-500 text-gray-900"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }
        `}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
