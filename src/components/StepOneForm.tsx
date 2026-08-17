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

const StepOneForm: React.FC<StepOneProps> = ({
  register,
  handleSubmit,
  errors,
  onNext,
  onBack,
  setValue,
  watch,
}) => {
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
            })}
            type="tel"
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
                required: "Please pick a time slot.",
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
            required: "Please pick a date.",
          })}
          value={date?.toISOString() || ""}
        />

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
