import type {
  UseFormRegister,
  UseFormHandleSubmit,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import type { OrderForm } from "./CustomerForm";
import {
  TIME_SLOTS_BY_DAY,
  DAY_LABELS,
  DAY_ORDER,
} from "../constants/dropOffSchedule";

type StepZeroProps = {
  nextStep: () => void;
  register: UseFormRegister<OrderForm>;
  handleSubmit: UseFormHandleSubmit<OrderForm>;
  errors: FieldErrors<OrderForm>;
  watch: UseFormWatch<OrderForm>;
  setValue: UseFormSetValue<OrderForm>;
};

const TIERS = [
  {
    value: "classic",
    label: "Classic Clean",
    price: "$2.50 / lb",
    turnaround: "48-hour turnaround",
    minimum: "min $37.50",
    popular: true,
  },
  {
    value: "priority",
    label: "Priority Clean",
    price: "$3.10 / lb",
    turnaround: "24-hour turnaround",
    minimum: "min $46.50",
    popular: false,
  },
  {
    value: "rush",
    label: "Rush Clean",
    price: "$3.65 / lb",
    turnaround: "Same-day (must drop off in the morning)",
    minimum: "min $54.75",
    popular: false,
  },
] as const;

const StepZeroForm = ({
  nextStep,
  register,
  handleSubmit,
  errors,
  setValue,
  watch,
}: StepZeroProps) => {
  const selectedService = watch("serviceType");

  const handleSelectTier = (tier: "classic" | "priority" | "rush") => {
    setValue("serviceType", tier, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <form
      className="max-w-md mx-auto bg-white rounded-xl space-y-6"
      onSubmit={handleSubmit(() => nextStep())}
      aria-labelledby="stepzero-heading"
    >
      <h2 id="stepzero-heading" className="text-xl font-semibold">
        Schedule Drop-Off Wash and Fold Laundry Service
      </h2>
      <div className="text-m text-gray-700 mb-5">
        <strong>How it works:</strong> We sort, wash, dry, and fold your
        laundry with care.{" "}
        <span className="whitespace-nowrap">15 lb minimum.</span> For more
        details, read below.
        <div className="mt-2 text-sm font-semibold text-red-500">
          Need help completing the form? Call at {"1 (628) 500-7801"}
        </div>
      </div>

      {/* Drop-off hours */}
      <div>
        <h3 className="text-sm font-medium text-gray-800 mb-2">
          Drop-off Hours
        </h3>
        <div className="border rounded-md divide-y divide-gray-200 text-sm">
          {DAY_ORDER.map((day) => (
            <div
              key={day}
              className="flex items-center justify-between px-3 py-2"
            >
              <span className="font-medium text-gray-800">
                {DAY_LABELS[day]}
              </span>
              <span className="text-gray-600 text-right">
                {TIME_SLOTS_BY_DAY[day].join(" & ")}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Weekend drop-offs begin processing the following Monday.
        </p>
      </div>

      {/* Tier selection */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          <span className="text-red-500">*</span> Select a service tier
        </label>
        <input
          type="hidden"
          {...register("serviceType", {
            validate: (v) => (v ? true : "Please select a service tier."),
          })}
        />
        <div className="grid grid-cols-1 gap-4 mb-1">
          {TIERS.map((tier) => {
            const pressed = selectedService === tier.value;
            return (
              <button
                key={tier.value}
                type="button"
                aria-pressed={pressed}
                onClick={() => handleSelectTier(tier.value)}
                className={`relative border rounded-md p-3 text-left transition ${
                  pressed
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-2 right-3 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{tier.label}</h3>
                  <span className="text-sm font-semibold text-gray-600">
                    {tier.price}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{tier.turnaround}</p>
                <p className="text-sm text-gray-600">{tier.minimum}</p>
              </button>
            );
          })}
        </div>
        {errors.serviceType && (
          <p className="text-red-500 text-sm m-1">
            {String(errors.serviceType.message)}
          </p>
        )}
      </div>

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
