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
  const selectedService = watch("serviceType");
  const selectedDelivery = watch("selectDelivery");
  const slot = watch("timeSlot");
  const dateValue = watch("dropOffDate");
  const date = dateValue ? new Date(dateValue) : null;

  const availableServices =
    selectedDelivery === "Pickup & Delivery"
      ? (["premium"] as const)
      : selectedDelivery === "Drop-off"
      ? (["premium", "basic"] as const)
      : ([] as const);

  const handleSelectDelivery = (choice: "Pickup & Delivery" | "Drop-off") => {
    setValue("selectDelivery", choice, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // If switching to Pickup & Delivery and user had "basic" selected, clear it.
    if (choice === "Pickup & Delivery" && selectedService === "basic") {
      setValue("serviceType", "", { shouldDirty: true, shouldValidate: true });
    }
    // If switching delivery at all, validate serviceType again
    if (
      choice === "Drop-off" &&
      !["premium", "basic"].includes(selectedService)
    ) {
      setValue("serviceType", "", { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleSelectService = (svc: "premium" | "basic") => {
    setValue("serviceType", svc, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <form
      className="max-w-md mx-auto bg-white rounded-xl space-y-6"
      onSubmit={handleSubmit(() => nextStep())}
      aria-labelledby="stepzero-heading"
    >
      <h2 id="stepzero-heading" className="text-xl font-semibold">
        Schedule a Wash and Fold Laundry Service
      </h2>
      <p className="text-m text-gray-700 mb-5">
        <strong>How it works:</strong> Choose Drop-off or Pickup &amp; Delivery.
        We sort, wash, dry, and (for Premium) neatly fold your laundry with
        care. Most orders are ready within 48 hours.{" "}
        <span className="whitespace-nowrap">20 lb minimum.</span> For more
        details, please{" "}
        <a
          href="https://thelaundryhubsf.com/wash-and-fold-laundry-san-francisco"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 no-underline hover:underline transition"
        >
          read our Wash &amp; Fold details
        </a>
        .
      </p>

      {/* Pickup & Delivery or Dropoff */}
      <div className="space-y-6">
        {/* Hidden inputs so RHF tracks these fields (we set them via setValue) */}
        <input
          type="hidden"
          {...register("selectDelivery", {
            required: "Please select a delivery type.",
          })}
        />
        <input
          type="hidden"
          {...register("serviceType", {
            validate: (v) => {
              if (!selectedDelivery) return true; // not required until delivery chosen
              return v ? true : "Please select a service type.";
            },
          })}
        />

        {/* Pickup & Delivery or Drop-off */}
        <div>
          <label
            htmlFor="selectDelivery"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            <span className="text-red-500">*</span> Select delivery type
          </label>

          <div
            id="selectDelivery"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1"
          >
            {(["Pickup & Delivery", "Drop-off"] as const).map((choice) => {
              const pressed = selectedDelivery === choice;
              return (
                <button
                  key={choice}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => handleSelectDelivery(choice)}
                  className={`border rounded-md p-3 text-left transition ${
                    pressed
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{choice}</h3>
                  </div>
                  <ul className="text-sm text-gray-600 list-disc pl-4">
                    {choice === "Pickup & Delivery" ? (
                      <>
                        <li>Door-to-door convenience</li>
                        <li>Text updates</li>
                        <li>Premium service only</li>
                      </>
                    ) : (
                      <>
                        <li>Quick counter drop-off</li>
                        <li>Flexible turnaround</li>
                        <li>Premium or Basic available</li>
                      </>
                    )}
                  </ul>
                </button>
              );
            })}
          </div>

          {errors.selectDelivery && (
            <p className="text-red-500 text-sm m-1">
              {String(errors.selectDelivery.message)}
            </p>
          )}
        </div>

        {/* Service selector (only shows after delivery is selected) */}
        {selectedDelivery && (
          <div>
            <label
              htmlFor="selectService"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              <span className="text-red-500">*</span> Select type of service
            </label>

            {/* Min weight note */}
            <p className="text-xs text-gray-600 mb-2">* 20 LB minimum</p>

            <div
              id="selectService"
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1"
            >
              {availableServices.map((svc) => {
                const pressed = selectedService === svc;

                // Pricing by delivery type
                const price =
                  svc === "premium"
                    ? selectedDelivery === "Pickup & Delivery"
                      ? "$2.39 / lb" // (planned: $2.49 / lb)
                      : "$1.99 / lb"
                    : "$1.75 / lb"; // basic (drop-off only)

                return (
                  <button
                    key={svc}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => handleSelectService(svc)}
                    className={`border rounded-md p-3 text-left transition ${
                      pressed
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">
                        {svc[0].toUpperCase() + svc.slice(1)}
                      </h3>
                      <div className="p-1 rounded-md text-sm font-semibold text-gray-600">
                        {price}
                      </div>
                    </div>
                    <ul className="text-sm text-gray-600 list-disc pl-4">
                      {svc === "premium" ? (
                        <>
                          <li>Professionally sorted & washed</li>
                          <li>Dried, neatly folded & bagged</li>
                          <li>Ready to put away</li>
                        </>
                      ) : (
                        <>
                          <li>Freshly cleaned</li>
                          <li>
                            Bagged only — <strong>No folding</strong>
                          </li>
                          <li>Budget-friendly</li>
                        </>
                      )}
                    </ul>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Date & time-slot picker */}
      <div className="text-gray-600 pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Date picker */}
        <div>
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
        <div>
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
        {...register("serviceType", { required: "Please select a service." })}
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
