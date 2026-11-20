import React from "react";
import type {
  UseFormRegister,
  UseFormHandleSubmit,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { OrderForm } from "./CustomerForm";
import DropOffDatePicker from "./DropOffDatePicker";
import { TIME_SLOTS_BY_DAY } from "../constants/dropOffSchedule";
import { LOCKER_LAYOUT, LOCKER_STEPS, MAX_LOCKERS } from "../constants/lockers";
import { getLockerCode } from "../utils/lockerCode";
import "react-datepicker/dist/react-datepicker.css";

interface StepOneProps {
  register: UseFormRegister<OrderForm>;
  handleSubmit: UseFormHandleSubmit<OrderForm>;
  errors: FieldErrors<OrderForm>;
  onNext: (data: OrderForm) => void;
  onBack: () => void;
  setValue: UseFormSetValue<OrderForm>;
  watch: UseFormWatch<OrderForm>;
}

// Format as 415-777-1234, capped at 10 digits.
const formatPhone = (raw: string): string => {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
};

const StepOneForm: React.FC<StepOneProps> = ({
  register,
  handleSubmit,
  errors,
  onNext,
  onBack,
  setValue,
  watch,
}) => {
  const method = watch("dropOffMethod");
  const isLocker = method === "locker";
  const phoneValue = watch("phone");
  const lockerCode = getLockerCode(phoneValue);
  const lockerValue = watch("lockerNumbers") || "";
  const selectedLockers = lockerValue
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const toggleLocker = (id: string) => {
    const next = selectedLockers.includes(id)
      ? selectedLockers.filter((x) => x !== id)
      : [...selectedLockers, id].slice(0, MAX_LOCKERS);
    setValue("lockerNumbers", next.sort().join(", "), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  const slot = watch("timeSlot");
  const dateValue = watch("dropOffDate");
  const date = dateValue ? new Date(dateValue) : null;
  const isWeekend = date ? date.getDay() === 0 || date.getDay() === 6 : false;
  const availableSlots = date ? TIME_SLOTS_BY_DAY[date.getDay()] : [];

  const handleDateChange = (d: Date | null) => {
    setValue("dropOffDate", d ? d.toISOString() : "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    const nextSlots = d ? TIME_SLOTS_BY_DAY[d.getDay()] : [];
    if (!nextSlots.includes(slot)) {
      setValue("timeSlot", "", { shouldDirty: true, shouldValidate: true });
    }
  };

  return (
    <section aria-labelledby="stepone-heading">
      <form className="space-y-4" onSubmit={handleSubmit(onNext)} noValidate>
        <h2
          id="stepone-heading"
          className="text-xl font-semibold text-gray-700 mb-4"
        >
          Your Information
        </h2>

        {/* New customer */}
        <div className="flex items-center gap-2">
          <input id="newCustomer" type="checkbox" {...register("newCustomer")} />
          <label htmlFor="newCustomer" className="text-sm text-gray-800">
            I'm a new customer
          </label>
        </div>

        {/* First and Last Name */}
        <div className="flex flex-row space-x-4">
          <div className="w-1/2">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <span className="text-red-500">*</span> First Name
            </label>
            <input
              id="firstName"
              {...register("firstName", {
                required: "First Name is required.",
              })}
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              aria-required="true"
              autoComplete="given-name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div className="w-1/2">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <span className="text-red-500">*</span> Last Name
            </label>
            <input
              id="lastName"
              {...register("lastName", {
                required: "Last Name is required.",
              })}
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              aria-required="true"
              autoComplete="family-name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <span className="text-red-500">*</span> Phone Number
          </label>
          <input
            id="phone"
            {...register("phone", {
              required: "Phone Number is required.",
              pattern: {
                value: /^\(?([0-9]{3})\)?[- ]?([0-9]{3})[- ]?([0-9]{4})$/,
                message: "Enter a valid 10-digit US phone number",
              },
              onChange: (e) => {
                e.target.value = formatPhone(e.target.value);
              },
            })}
            type="tel"
            inputMode="numeric"
            maxLength={12}
            placeholder="415-777-1234"
            className="w-full border border-gray-300 rounded p-2"
            aria-required="true"
            autoComplete="tel"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <span className="text-red-500">*</span> Email
          </label>
          <input
            id="email"
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email address",
              },
            })}
            type="email"
            className="w-full border border-gray-300 rounded p-2"
            aria-required="true"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Number of Bags */}
        <div>
          <label
            htmlFor="numberOfBags"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <span className="text-red-500">*</span> Number of Bags
          </label>
          <select
            id="numberOfBags"
            {...register("numberOfBags", {
              required: "Please select the number of bags.",
            })}
            className="w-full border border-gray-300 rounded p-2"
            aria-required="true"
          >
            <option value="">Select number of bags</option>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          {errors.numberOfBags && (
            <p className="text-red-500 text-xs">
              {errors.numberOfBags.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="specialRequests"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Special Instructions
          </label>
          <textarea
            id="specialRequests"
            {...register("specialRequests")}
            className="w-full border border-gray-300 rounded p-2"
            placeholder="e.g., hang dry clothes, pet note, fabric softener, bleach, heavy stains"
            rows={3}
          />
        </div>

        {/* Drop-off method */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> How will you drop off?
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                value: "attendant",
                title: "Hand to attendant",
                desc: "Drop off at the window during attendant hours",
              },
              {
                value: "locker",
                title: "Drop in a locker",
                desc: "Use a locker anytime the store is open",
              },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`border rounded p-3 cursor-pointer ${
                  method === opt.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  value={opt.value}
                  {...register("dropOffMethod")}
                  className="mr-2"
                />
                <span className="font-semibold text-gray-800">{opt.title}</span>
                <span className="block text-xs text-gray-600 mt-1">
                  {opt.desc}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {!isLocker && (
          <>
        {/* Date & time-slot picker */}
        <div className="text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="dropOffDate"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              <span className="text-red-500">*</span> Select drop-off day
            </label>
            <DropOffDatePicker
              date={date}
              setDate={handleDateChange}
              error={errors.dropOffDate?.message}
              inputId="dropOffDate"
            />
            {isWeekend && (
              <p className="mt-1 text-xs text-gray-500">
                Orders dropped off on weekends begin processing Monday.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="timeSlot"
              className="block text-sm font-medium text-gray-800 mb-1"
            >
              <span className="text-red-500">*</span> Select drop-off time
            </label>

            <select
              id="timeSlot"
              {...register("timeSlot", {
                required: isLocker ? false : "Please pick a time slot.",
              })}
              className={`w-full border rounded p-2 transition ${
                slot
                  ? "bg-blue-50 border-blue-500 text-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
              aria-placeholder="Select a drop off time"
            >
              <option value="">Select a time slot</option>
              {availableSlots.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Staff are only available during these windows to collect your
              order — please arrive within your selected time.
            </p>

            {errors.timeSlot && (
              <p className="text-red-500 text-sm">{errors.timeSlot.message}</p>
            )}
          </div>
        </div>

        {/* Hidden input keeps dropOffDate registered/validated */}
        <input
          type="hidden"
          {...register("dropOffDate", {
            required: isLocker ? false : "Please pick a date.",
          })}
          value={date?.toISOString() || ""}
        />

          </>
        )}

        {isLocker && (
          <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-5 text-base text-gray-700 space-y-4">
            <p className="text-lg font-bold text-red-600">
              You must be at the store to use a locker.
            </p>

            <div>
              <p className="font-semibold text-gray-800 mb-1">Steps</p>
              <ol className="list-decimal pl-5 space-y-1">
                {LOCKER_STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-2">
                <span className="text-red-500">*</span> Select your locker
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                {LOCKER_LAYOUT.map((l) => {
                  const selected = selectedLockers.includes(l.id);
                  const disabled =
                    !selected && selectedLockers.length >= MAX_LOCKERS;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      aria-pressed={selected}
                      disabled={disabled}
                      onClick={() => toggleLocker(l.id)}
                      className={`rounded-lg border-2 py-4 text-2xl font-bold transition ${
                        selected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-800 border-gray-300 hover:border-blue-400"
                      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {l.id}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm mt-2">
                Please try to keep your whole order in one locker. If you need
                more space, you may use an additional locker (2 max).
              </p>
              <input
                type="hidden"
                {...register("lockerNumbers", {
                  validate: (v) =>
                    !isLocker || !!v?.trim() || "Please select your locker.",
                })}
              />
              {errors.lockerNumbers && (
                <p className="text-red-500 text-sm">
                  {errors.lockerNumbers.message}
                </p>
              )}
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Your locker code</p>
              {lockerCode ? (
                <p className="text-3xl font-bold text-blue-700">{lockerCode}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  Enter your phone number above to get your code.
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Use this code to lock your locker (same code for a second
                locker).
              </p>
            </div>

            <div>
              <div className="flex items-start gap-2">
                <input
                  id="lockerConfirmed"
                  type="checkbox"
                  className="mt-1"
                  {...register("lockerConfirmed", {
                    validate: (v) =>
                      !isLocker ||
                      !!v ||
                      "Please confirm your laundry is in the locker.",
                  })}
                />
                <label htmlFor="lockerConfirmed">
                  I am at the store, and my laundry is in the locker(s) and
                  locked with my code.
                </label>
              </div>
              {errors.lockerConfirmed && (
                <p className="text-red-500 text-sm">
                  {errors.lockerConfirmed.message}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Next
          </button>
        </div>
      </form>
    </section>
  );
};

export default StepOneForm;
