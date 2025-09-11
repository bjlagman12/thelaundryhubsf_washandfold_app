import React, { useCallback } from "react";
import type {
  UseFormRegister,
  UseFormHandleSubmit,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
  UseFormClearErrors,
  UseFormSetError,
} from "react-hook-form";
import type { OrderForm } from "./CustomerForm";

interface StepOneProps {
  register: UseFormRegister<OrderForm>;
  handleSubmit: UseFormHandleSubmit<OrderForm>;
  errors: FieldErrors<OrderForm>;
  onNext: (data: OrderForm) => void;
  onBack: () => void;
  setValue: UseFormSetValue<OrderForm>;
  watch: UseFormWatch<OrderForm>;
  clearErrors: UseFormClearErrors<OrderForm>;
  setError: UseFormSetError<OrderForm>;
  isPickupDelivery: boolean;
  promoCodes: string[] | Record<string, unknown>;
}

const StepOneForm: React.FC<StepOneProps> = ({
  register,
  handleSubmit,
  errors,
  onNext,
  onBack,
  setValue,
  watch,
  clearErrors,
  setError,
  isPickupDelivery,
  promoCodes,
}) => {
  const promoList = Array.isArray(promoCodes)
    ? promoCodes.map((c) => String(c).toUpperCase().trim())
    : Object.keys(promoCodes).map((k) => k.toUpperCase().trim());

  const onVerifyPromo = useCallback(() => {
    const code = (watch("promoCode") || "").toUpperCase().trim();
    const ok = code && promoList.includes(code);
    setValue("promoValid", !!ok, { shouldDirty: true, shouldValidate: true });
    if (ok) {
      clearErrors("promoCode");
    } else {
      setError("promoCode", {
        type: "validate",
        message: "Invalid promo code",
      });
    }
  }, [watch, promoList, setValue, clearErrors, setError]);

  return (
    <section aria-labelledby="stepone-heading">
      <form className="space-y-4" onSubmit={handleSubmit(onNext)} noValidate>
        <h2
          id="stepone-heading"
          className="text-xl font-semibold text-gray-700 mb-4"
        >
          Your Information
        </h2>
        {/* ✅ New customer (applies to both flows) */}
        <div className="flex items-center gap-2 pt-2">
          <input
            id="newCustomer"
            type="checkbox"
            {...register("newCustomer")}
          />
          <label htmlFor="newCustomer" className="text-sm text-gray-800">
            I’m a new customer
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

        {/* ✅ Promo code (applies to both flows) */}
        <div>
          <label
            htmlFor="promoCode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Promo code
          </label>
          <div className="flex gap-2">
            <input
              id="promoCode"
              type="text"
              placeholder="Enter code"
              {...register("promoCode")}
              className="flex-1 border border-gray-300 rounded p-2"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={onVerifyPromo}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              aria-label="Verify promo code"
            >
              Verify
            </button>
          </div>
          {/* Hidden field to carry result */}
          <input type="hidden" {...register("promoValid")} />
          {errors.promoCode && (
            <p className="text-red-500 text-xs">{errors.promoCode.message}</p>
          )}
          {watch("promoValid") &&
          !errors.promoCode &&
          watch("promoCode")?.trim() ? (
            <p className="text-green-600 text-xs mt-1">Promo applied.</p>
          ) : null}
        </div>

        {/* ✅ Address (only when Pickup & Delivery) */}
        {isPickupDelivery && (
          <fieldset className="border border-gray-200 rounded p-3">
            <legend className="text-sm font-medium text-gray-700 px-1">
              Pickup Address
            </legend>

            <div className="mt-2">
              <label
                htmlFor="addressLine1"
                className="block text-sm text-gray-700 mb-1"
              >
                <span className="text-red-500">*</span> Street address
              </label>
              <input
                id="addressLine1"
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                {...register("addressLine1", {
                  required: "Street address is required for pickup.",
                })}
                autoComplete="address-line1"
              />
              {errors.addressLine1 && (
                <p className="text-red-500 text-xs">
                  {errors.addressLine1.message}
                </p>
              )}
            </div>

            <div className="mt-2">
              <label
                htmlFor="addressLine2"
                className="block text-sm text-gray-700 mb-1"
              >
                Apt / Unit (optional)
              </label>
              <input
                id="addressLine2"
                type="text"
                className="w-full border border-gray-300 rounded p-2"
                {...register("addressLine2")}
                autoComplete="address-line2"
              />
            </div>

            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm text-gray-700 mb-1"
                >
                  <span className="text-red-500">*</span> City
                </label>
                <input
                  id="city"
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  {...register("city", {
                    required: "City is required for pickup.",
                  })}
                  autoComplete="address-level2"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs">{errors.city.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm text-gray-700 mb-1"
                >
                  <span className="text-red-500">*</span> State
                </label>
                <input
                  id="state"
                  type="text"
                  defaultValue="CA"
                  className="w-full border border-gray-300 rounded p-2"
                  {...register("state", {
                    required: "State is required for pickup.",
                  })}
                  autoComplete="address-level1"
                />
                {errors.state && (
                  <p className="text-red-500 text-xs">{errors.state.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="zip"
                  className="block text-sm text-gray-700 mb-1"
                >
                  <span className="text-red-500">*</span> ZIP
                </label>
                <input
                  id="zip"
                  type="text"
                  className="w-full border border-gray-300 rounded p-2"
                  {...register("zip", {
                    required: "ZIP is required for pickup.",
                    pattern: {
                      value: /^\d{5}(-\d{4})?$/,
                      message: "Enter a valid ZIP",
                    },
                  })}
                  autoComplete="postal-code"
                />
                {errors.zip && (
                  <p className="text-red-500 text-xs">{errors.zip.message}</p>
                )}
              </div>
            </div>
          </fieldset>
        )}

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
            placeholder="e.g., gate code, pet note, fabric softener, bleach, heavy stains"
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
