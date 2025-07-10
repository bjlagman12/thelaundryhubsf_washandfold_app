/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { startCase } from "lodash";
import type { OrderForm } from "./CustomerForm";

interface StepTwoFormProps {
  getValues: () => OrderForm;
  handleSubmit: (fn: any) => () => void;
  handleFormSubmit: (data: OrderForm) => void;
  agree: boolean;
  setAgree: React.Dispatch<React.SetStateAction<boolean>>;
  onBack: () => void;
}

const StepTwoForm: React.FC<StepTwoFormProps> = ({
  getValues,
  handleSubmit,
  handleFormSubmit,
  agree,
  setAgree,
  onBack,
}) => {
  const formatValue = (value: unknown): string => {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (value === "" || value === null || value === undefined) {
      return "N/A";
    }
    if (typeof value === "string" && isoRegex.test(value)) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          month: "long",
          day: "2-digit",
          year: "numeric",
        });
      }
    }
    return value.toString();
  };

  // Only show error if user tried to submit without agreeing
  const [showError, setShowError] = React.useState(false);

  const onSubmit = (data: OrderForm) => {
    if (!agree) {
      setShowError(true);
      return;
    }
    setShowError(false);
    handleFormSubmit(data);
  };

  return (
    <section aria-labelledby="steptwo-heading">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2
          id="steptwo-heading"
          className="text-2xl font-bold text-gray-700 mb-4"
        >
          Review Your Order
        </h2>
        <ul className="text-md text-gray-700 space-y-1 mb-4">
          {Object.entries(getValues())
            .slice(0, -2)
            .map(([key, value]) => (
              <li key={key}>
                <strong>{startCase(key)}:</strong> {formatValue(value)}
              </li>
            ))}
        </ul>
        <div className="bg-blue-100 border border-blue-300 p-4 rounded mb-4 text-gray-700">
          <h3 className="font-bold mb-2 text-sm">Terms & Conditions</h3>
          <div className="text-[10px]">
            <p>
              <strong>Products Used: </strong>
              We use Hypoallergenic Laundry Detergent, a fragrance-free,
              eco-friendly, and skin-safe solution for all wash & fold orders.
            </p>
            <p className="mt-2">
              <strong>Wash Settings: </strong>
              We wash colored garments in cold water to minimize bleeding and
              whites in warm water for better cleaning. Specific preferences
              should be noted in the "Special Instructions" section.
            </p>
            <p className="mt-2">
              <strong>Garment Care & Limitations: </strong> We take great care
              with your laundry, but we cannot guarantee:
              <br />
              • Complete removal of stains (some may be permanent)
              <br />
              • Protection from damage to weak or aging fabrics
              <br />
              • Prevention of color fading, bleeding, or shrinking
              <br />
              • Preservation of decorative elements (buttons, zippers, beads,
              ties, etc.)
              <br />
              Instructions are followed to the best of our ability, but The
              Laundry Hub SF is not liable for damage due to fabric condition or
              inherent material flaws.
            </p>
            <p className="mt-2">
              <strong>Lost or Damaged Items: </strong>
              Our liability is limited to the cost of service for the affected
              load. We do not reimburse replacement costs for lost or damaged
              garments.
            </p>
            <p className="mt-2">
              <strong>Prohibited Items: </strong>
              Please do not include the following in your laundry:
              <br />
              • Items contaminated with bodily fluids, grease, or other
              hazardous materials
              <br />• Sharp objects, electronics, or valuables
            </p>
            <p className="mt-2">
              <strong>Unclaimed Orders: </strong>
              Orders not picked up within 14 days of completion may be donated
              due to limited storage space. We are not responsible for unclaimed
              items beyond this period.
            </p>
            <p className="mt-2">
              <strong>Service & Payment Acknowledgement: </strong>
              By placing a laundry order, you acknowledge and agree to the
              service type selected and the associated pricing. All payments
              must be completed through our online portal prior to pickup.
            </p>
            <p className="mt-2">
              <strong>Payment Terms: </strong>
              Payment is due prior to pickup. Pricing is based on weight,
              laundry type, and any requested add-ons.
            </p>
            <p className="mt-2">
              <strong>SMS Updates: </strong>
              By submitting this form, you consent to receive SMS messages from
              The Laundry Hub SF related to your laundry order, including order
              confirmations and ready-for-pickup notifications. Standard message
              and data rates may apply.
              <br />
              Messages are sent only to the phone number you provide at
              checkout. You will not be subscribed via text message.
              <br />
              To stop receiving messages, reply STOP at any time. For help,
              reply HELP.
            </p>
          </div>
        </div>
        <div className="mb-4 text-sm">
          <input
            id="agree"
            type="checkbox"
            className="form-checkbox mr-2"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <label htmlFor="agree" className="inline">
            I agree to the terms and conditions
          </label>
          {showError && !agree && (
            <p className="text-red-500 text-xs mt-1">
              You must agree to the terms and conditions to continue.
            </p>
          )}
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
            onClick={onBack}
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </form>
    </section>
  );
};

export default StepTwoForm;
