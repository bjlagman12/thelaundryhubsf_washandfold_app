import DropOffDatePicker from "./DropOffDatePicker";
import type {
  UseFormRegister,
  UseFormHandleSubmit,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import type { OrderForm } from "./CustomerForm";
import "react-datepicker/dist/react-datepicker.css";

type StepZeroProps = {
  nextStep: () => void;
  register: UseFormRegister<OrderForm>;
  handleSubmit: UseFormHandleSubmit<OrderForm>;
  errors: FieldErrors<OrderForm>;
  watch: UseFormWatch<OrderForm>;
  setValue: UseFormSetValue<OrderForm>;
};

const StepZeroForm = ({
  nextStep,
  register,
  handleSubmit,
  errors,
  setValue,
  watch,
}: StepZeroProps) => {
  const selectedService = watch("laundryType");
  const slot = watch("timeSlot");
  const dateValue = watch("dropOffDate");
  const date = dateValue ? new Date(dateValue) : null;

  return (
    <form
      className="max-w-md mx-auto bg-white rounded-xl space-y-6"
      onSubmit={handleSubmit(() => nextStep())}
      aria-labelledby="stepzero-heading"
    >
      <h2 id="stepzero-heading" className="text-xl font-semibold">
        Schedule a Drop-Off
      </h2>
      <p className="text-m text-gray-700 mb-5">
        <strong>How it works:</strong> Drop off your laundry at your scheduled
        time. We wash, dry, and fold it with care. Ready for pickup in 48 hours.
        For more details on our services, please{" "}
        <a
          href="https://thelaundryhubsf.com/services#wash-fold"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 no-underline hover:underline transition"
        >
          read our service details
        </a>
        .
      </p>

      {/* Service selector */}
      <div>
        <label
          htmlFor="selectService"
          className="block text-sm font-medium text-gray-800 mb-1"
        >
          <span className="text-red-500">*</span> Select type of service
        </label>
        <div className="flex gap-4 justify-center mb-1" id="selectService">
          {(["premium", "basic"] as const).map((svc) => (
            <button
              key={svc}
              type="button"
              aria-pressed={selectedService === svc}
              onClick={() => setValue("laundryType", svc)}
              className={`w-1/2 border rounded-md p-3 text-center transition
                ${
                  selectedService === svc
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-100"
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  {svc[0].toUpperCase() + svc.slice(1)}
                </h3>
                <div className="p-1 rounded-md text-m font-semibold text-gray-600">
                  {svc === "premium" ? "$1.99 / lb" : "$1.19 / lb"}
                </div>
              </div>
              <ul className="text-sm text-gray-600 text-left list-disc pl-3">
                {svc === "premium" ? (
                  <>
                    <li>Neatly folded & bagged</li>
                    <li>48-hour turnaround</li>
                    <li>Ready to put away</li>
                  </>
                ) : (
                  <>
                    <li>Freshly cleaned</li>
                    <li>
                      Bagged only <strong>No Folding</strong>
                    </li>
                    <li>Budget-friendly option</li>
                  </>
                )}
              </ul>
            </button>
          ))}
        </div>
        {errors.laundryType && (
          <p className="text-red-500 text-sm m-1">
            {errors.laundryType.message}
          </p>
        )}
      </div>

      {/* Date & time-slot picker */}
      <div className="text-gray-600 pt-4 flex gap-3">
        {/* Date picker */}
        <div className="w-1/2">
          <label
            htmlFor="dropOffDate"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            <span className="text-red-500">*</span> Select day
          </label>
          <DropOffDatePicker
            date={date}
            setDate={(d) => setValue("dropOffDate", d ? d.toISOString() : "")}
            error={errors.dropOffDate?.message}
            inputId="dropOffDate"
          />
        </div>

        {/* Time slots */}
        <div className="w-1/2">
          <label
            htmlFor="timeSlot"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            <span className="text-red-500">*</span> Select time
          </label>
          <select
            id="timeSlot"
            {...register("timeSlot", {
              required: "Please pick a time slot.",
            })}
            className={`w-full border rounded p-2 transition ${
              slot
                ? "bg-blue-50 border-blue-500 text-gray-900"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
            aria-placeholder="Select a drop off time"
          >
            <option value="">Select a drop off time</option>
            <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
            <option value="07:00 PM - 09:00 PM">07:00 PM - 09:00 PM</option>
          </select>
          {errors.timeSlot && (
            <p className="text-red-500 text-sm">{errors.timeSlot.message}</p>
          )}
        </div>
      </div>

      {/* Hidden inputs feed RHF */}
      <input
        type="hidden"
        {...register("laundryType", { required: "Please select a service." })}
        value={selectedService || ""}
      />
      <input
        type="hidden"
        {...register("dropOffDate", {
          required: "Please pick a drop-off date.",
        })}
        value={date?.toISOString() || ""}
      />

      {/* Next button runs validation then calls nextStep */}
      <div className="flex w-full mt-4">
        <div className="ml-auto w-16">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            aria-label="Next step"
          >
            Next
          </button>
        </div>
      </div>
    </form>
  );
};

export default StepZeroForm;
