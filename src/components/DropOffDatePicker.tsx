import DatePicker from "react-datepicker";
import { FiCalendar } from "react-icons/fi";
import "react-datepicker/dist/react-datepicker.css";

type DropOffDatePickerProps = {
  date: Date | null;
  setDate: (date: Date | null) => void;
  error?: string;
  inputId?: string;
};

export default function DropOffDatePicker({
  date,
  setDate,
  error,
  inputId,
}: DropOffDatePickerProps) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isWeekday = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6;

  return (
    <div className="relative">
      <FiCalendar className="absolute z-10 left-3 top-3 pointer-events-none text-gray-400" />
      <DatePicker
        id={inputId}
        selected={date}
        onChange={setDate}
        minDate={tomorrow}
        filterDate={isWeekday}
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
