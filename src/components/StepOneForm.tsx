import React from "react";
import type {
  UseFormRegister,
  UseFormHandleSubmit,
  FieldErrors,
} from "react-hook-form";
import type { OrderForm } from "./CustomerForm";

interface StepOneProps {
  register: UseFormRegister<OrderForm>;
  handleSubmit: UseFormHandleSubmit<OrderForm>;
  errors: FieldErrors<OrderForm>;
  onNext: (data: OrderForm) => void;
  onBack: () => void;
}

const StepOneForm: React.FC<StepOneProps> = ({
  register,
  handleSubmit,
  errors,
  onNext,
  onBack,
}) => {
  return (
    <section aria-labelledby="stepone-heading">
      <form className="space-y-4" onSubmit={handleSubmit(onNext)} noValidate>
        <h2
          id="stepone-heading"
          className="text-xl font-semibold text-gray-700 mb-4"
        >
          Your Information
        </h2>
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
              <p className="text-red-500 text-xs">{errors.firstName.message}</p>
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
              {...register("lastName", { required: "Last Name is required." })}
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              aria-required="true"
              autoComplete="family-name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs">{errors.lastName.message}</p>
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
        {/* Laundry Type */}
        <div>
          <label
            htmlFor="laundryType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <span className="text-red-500">*</span> Type of Laundry
          </label>
          <select
            id="laundryType"
            {...register("laundryType", {
              required: "Laundry Type is required.",
            })}
            className="w-full border border-gray-300 rounded p-2"
            aria-required="true"
          >
            <option value="">Select an option</option>
            <option value="mixed">Mixed (clothes + household)</option>
            <option value="clothes">Clothes only</option>
            <option value="bed_linen">Bed Linen</option>
            <option value="towels">Towels</option>
          </select>
          {errors.laundryType && (
            <p className="text-red-500 text-xs">{errors.laundryType.message}</p>
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
        {/* Special Instructions */}
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
            placeholder="e.g. Add fabric softener, add bleach, and remove heavy stains on shirt."
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
