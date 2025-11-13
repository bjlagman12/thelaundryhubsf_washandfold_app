import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import LH from "../../public/LH.svg";
import { Helmet } from "react-helmet";

type WinnerPageFormData = {
  name: string;
  email: string;
  phone: string;
  guessWeight: string;
  promoConsent: boolean;
};

const WinnerPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<WinnerPageFormData>({
    defaultValues: { promoConsent: false },
  });

  const onSubmit: SubmitHandler<WinnerPageFormData> = async (data) => {
    try {
      await addDoc(collection(db, "winner"), {
        ...data,
        createdAt: serverTimestamp(),
      });

      reset(
        { promoConsent: false },
        { keepIsSubmitted: true, keepIsSubmitSuccessful: true }
      );
    } catch (err) {
      console.error("Raffle entry failed:", err);
      alert("Sorry, something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Helmet>
        <title>Raffle Event | The Laundry Hub SF</title>
        <meta
          name="description"
          content="Guess the bag weight and enter for a chance to win one month of free laundry at The Laundry Hub SF."
        />
      </Helmet>

      <main className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <section
          className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8"
          aria-labelledby="raffle-heading"
        >
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <a
              href="https://thelaundryhubsf.com"
              aria-label="Go to homepage"
              className="flex items-center space-x-3"
            >
              <img
                src={LH}
                alt="The Laundry Hub SF logo"
                className="w-12 h-12 cursor-pointer"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  THE LAUNDRY HUB SF
                </h1>
                <h2 className="text-lg text-gray-700 font-semibold">
                  Raffle Event Entry
                </h2>
              </div>
            </a>
          </header>

          <h2 id="raffle-heading" className="sr-only">
            Guess the bag weight raffle
          </h2>

          <div className="flex justify-center mb-6">
            <img
              src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjFoemI1djE2cjJrdDF5dmJ1bWtqcnNsamQwdGd0NnpibTZ3bGhqeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4RaPld0hPNRXEk1cfv/giphy.gif"
              alt="$300 Prize GIF"
              className="w-56 mx-auto"
            />
          </div>

          {/* Intro */}
          <div className="mb-6 text-gray-700 text-base text-lg">
            <p className="mb-2">
              🎉 Enter for a chance to win{" "}
              <strong>one month of free laundry</strong> valued at{" "}
              <strong>$300</strong>.
            </p>
            <p className="mb-1">All you have to do is:</p>
            <ul className="list-disc list-inside text-gray-700 text-sm">
              <li>Guess the weight of the laundry bag at our booth.</li>
              <li>Fill out all fields below to enter.</li>
            </ul>
          </div>

          {isSubmitSuccessful ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded mb-6 text-sm">
              🎉 Thanks for entering. Winner will be contacted after the event.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <span className="text-red-500">*</span> Name
                </label>
                <input
                  id="name"
                  {...register("name", { required: "Name is required." })}
                  type="text"
                  className={`w-full border rounded p-2 transition ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Phone (required) */}
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
                    required: "Phone number is required.",
                    pattern: {
                      value: /\(?([0-9]{3})\)?[- ]?([0-9]{3})[- ]?([0-9]{4})$/,
                      message: "Enter a valid 10 digit US phone number.",
                    },
                  })}
                  type="tel"
                  className={`w-full border rounded p-2 transition ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  autoComplete="tel"
                  placeholder="(628) 500-7801"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Email (required) */}
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
                      message: "Enter a valid email address.",
                    },
                  })}
                  type="email"
                  className={`w-full border rounded p-2 transition ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Guess Weight (required) */}
              <div>
                <label
                  htmlFor="guessWeight"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <span className="text-red-500">*</span> Your Guess of Bag
                  Weight (in pounds)
                </label>
                <input
                  id="guessWeight"
                  {...register("guessWeight", {
                    required: "Please enter your guess.",
                    pattern: {
                      value: /^[0-9]+(\.[0-9]+)?$/,
                      message: "Enter a valid number in pounds.",
                    },
                  })}
                  type="text"
                  className={`w-full border rounded p-2 transition ${
                    errors.guessWeight ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="For example: 47.5"
                />
                {errors.guessWeight && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.guessWeight.message}
                  </p>
                )}
              </div>

              {/* Promo Consent Checkbox (optional) */}
              <div className="mb-2 text-xs">
                <label
                  htmlFor="promoConsent"
                  className="inline-flex items-start"
                >
                  <input
                    id="promoConsent"
                    type="checkbox"
                    {...register("promoConsent")}
                    className="form-checkbox mr-2 mt-0.5"
                  />
                  <span className="text-gray-700">
                    I agree to receive occasional promos and updates from The
                    Laundry Hub SF. Message and data rates may apply. Reply STOP
                    to unsubscribe. See our{" "}
                    <a
                      href="https://thelaundryhubsf.com/term-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600"
                    >
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://thelaundryhubsf.com/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Submitting..." : "Enter Raffle"}
              </button>
            </form>
          )}
        </section>
      </main>
    </>
  );
};

export default WinnerPage;
