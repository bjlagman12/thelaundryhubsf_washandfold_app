import React from "react";
import { Helmet } from "react-helmet";

type StepThreeFormProps = {
  orderId: string;
  deliveryType: "Pickup & Delivery" | "Drop-off";
};

const StepThreeForm: React.FC<StepThreeFormProps> = ({
  orderId,
  deliveryType,
}) => {
  const isPickup = deliveryType === "Pickup & Delivery";

  return (
    <div className="text-center">
      <Helmet>
        <title>Thank You | The Laundry Hub SF</title>
        <meta
          name="description"
          content={`Thank you for your ${
            isPickup ? "pickup & delivery" : "drop-off"
          } order with The Laundry Hub SF.`}
        />
      </Helmet>

      <h2 className="text-[3rem] font-semibold text-gray-700 mb-4">
        Thank You!
      </h2>

      <p className="text-gray-600">
        Your order has been received. You’ll get a text with your confirmation
        number soon. Your order number is:
      </p>
      <div className="text-3xl font-bold text-blue-600 my-4">#{orderId}</div>

      <div className="text-gray-600 text-sm">
        <p className="my-2">
          🧺 Please place your laundry in a securely tied plastic bag.
        </p>

        {isPickup ? (
          <div className="my-2">
            <p>🚚 Our driver will arrive during your selected time window.</p>
            <p>📱 Keep your phone nearby for pickup updates.</p>
            <p className="my-2">
              📦 Leave your bagged laundry on the front porch, clearly visible
              for the driver.
            </p>
            <p className="my-2">
              🚫 Do not use baskets, hampers, or open containers this helps
              prevent items from being lost in transit.
            </p>
          </div>
        ) : (
          <div className="my-2">
            <p>👕 An attendant will be there to collect your laundry.</p>
            <p>📱 Show your confirmation number at drop-off.</p>
          </div>
        )}

        <p>We appreciate your business!</p>
        <a
          href="https://thelaundryhubsf.com/"
          aria-label="Go to homepage"
          className="text-blue-600 no-underline hover:underline transition mt-4 inline-block text-lg"
        >
          Home Page
        </a>
      </div>
    </div>
  );
};

export default StepThreeForm;
