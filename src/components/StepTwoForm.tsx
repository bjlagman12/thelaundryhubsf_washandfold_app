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

  const [showTermsError, setShowTermsError] = React.useState(false);
  const [showTerms, setShowTerms] = React.useState(false);
  const [smsConsent, setSmsConsent] = React.useState(false);
  const [showSmsError, setShowSmsError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (data: OrderForm) => {
    let valid = true;

    if (!smsConsent) {
      setShowSmsError(true);
      valid = false;
    } else {
      setShowSmsError(false);
    }

    if (!agree) {
      setShowTermsError(true);
      valid = false;
    } else {
      setShowTermsError(false);
    }

    if (!valid) return;

    setLoading(true);
    try {
      await handleFormSubmit(data); // Ensure this returns a Promise
    } finally {
      setLoading(false);
    }
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

        <div className="mb-4  text-sm">
          <p className="my-4">
            <strong>Consent &amp; SMS Updates:</strong> By checking this box,
            you consent to receive SMS updates related to your laundry order
            (approximately 1–3 messages per order; message &amp; data rates may
            apply; reply STOP to unsubscribe), including order confirmations,
            pickup notifications, and refund alerts.
          </p>
          <input
            id="smsConsent"
            type="checkbox"
            className="form-checkbox mr-2 mt-1"
            checked={smsConsent}
            onChange={(e) => setSmsConsent(e.target.checked)}
          />
          <label htmlFor="smsConsent" className="inline">
            I consent to receive SMS updates
          </label>
          {showSmsError && (
            <p className="text-red-500 text-xs mt-1">
              You must opt in to SMS updates to continue.
            </p>
          )}
        </div>

        {/* 1) Collapsible Terms & Conditions */}
        <div className="mb-4 border border-blue-300 rounded overflow-hidden">
          <button
            type="button"
            onClick={() => setShowTerms((f) => !f)}
            className="w-full flex justify-between items-center bg-blue-100 p-3 text-left"
          >
            <span className="font-bold">Terms &amp; Conditions</span>
            <span className="text-xl">{showTerms ? "−" : "+"}</span>
          </button>

          {showTerms && (
            <div className="bg-blue-100 p-4 text-sm text-gray-700 space-y-2">
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
                Laundry Hub SF is not liable for damage due to fabric condition
                or inherent material flaws.
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
                due to limited storage space. We are not responsible for
                unclaimed items beyond this period.
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
            </div>
          )}
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
            I agree to The Laundry Hub SF's Terms and Conditions and Privacy
            Policy
          </label>
          {showTermsError && !agree && (
            <p className="text-red-500 text-xs mt-1">
              You must agree to the terms and conditions to continue.
            </p>
          )}
          <p className="text-xs text-gray-600 my-4">
            Read our{" "}
            <a
              href="https://thelaundryhubsf.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://thelaundryhubsf.com/term-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              Terms & Conditions
            </a>
            .
          </p>
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
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default StepTwoForm;
