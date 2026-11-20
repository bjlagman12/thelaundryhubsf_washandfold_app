import React from "react";
import { Helmet } from "react-helmet";
import { getLockerCode } from "../utils/lockerCode";

type StepThreeFormProps = {
  orderId: string;
  dropOffMethod?: "attendant" | "locker";
  lockerNumbers?: string;
  phone?: string;
};

const StepThreeForm: React.FC<StepThreeFormProps> = ({
  orderId,
  dropOffMethod,
  lockerNumbers,
  phone,
}) => {
  const isLocker = dropOffMethod === "locker";
  return (
    <div className="text-center">
      <Helmet>
        <title>Thank You | The Laundry Hub SF</title>
        <meta
          name="description"
          content="Thank you for your drop-off order with The Laundry Hub SF."
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
        {isLocker ? (
          <div className="my-2 space-y-1">
            <p>🧺 Locker(s): {lockerNumbers}</p>
            <p>🔑 Your code: {getLockerCode(phone || "")}</p>
            <p>📱 We'll text you updates. When your order is ready, we'll text you the locker and access code for pickup.</p>
          </div>
        ) : (
          <>
            <p className="my-2">
              🧺 Please place your laundry in a securely tied plastic bag.
            </p>

            <div className="my-2">
              <p>👕 An attendant will be there to collect your laundry.</p>
              <p>📱 Show your confirmation number at drop-off.</p>
            </div>
          </>
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
