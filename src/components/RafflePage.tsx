import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import LH from "../../public/LH.svg";
import { Helmet } from "react-helmet";
import { FaFacebook, FaInstagram, FaGoogle } from "react-icons/fa";

type RaffleFormData = {
  name: string;
  email?: string;
  phone: string;
  smsConsent: boolean;
};

const RafflePage: React.FC = () => {
  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<RaffleFormData>({
    defaultValues: { smsConsent: false },
  });

  const onSubmit: SubmitHandler<RaffleFormData> = async (data) => {
    try {
      await addDoc(collection(db, "raffle"), {
        ...data,
        createdAt: serverTimestamp(),
      });
      reset();
    } catch (err) {
      console.error("Raffle entry failed:", err);
      alert("Sorry, something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Helmet>
        <title>Enter Raffle | The Laundry Hub SF</title>
        <meta
          name="description"
          content="Enter our raffle for a chance to win a free wash & fold at The Laundry Hub SF!"
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
                  Raffle Entry
                </h2>
              </div>
            </a>
          </header>

          <h2 id="raffle-heading" className="sr-only">
            Enter Our Raffle
          </h2>
          <div className="flex justify-center mb-6">
            <img
              src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjFoemI1djE2cjJrdDF5dmJ1bWtqcnNsamQwdGd0NnpibTZ3bGhqeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4RaPld0hPNRXEk1cfv/giphy.gif"
              alt="$100 Money GIF"
              className="w-56 mx-auto"
            />
          </div>

          {/* Intro blurb */}
          <p className="mb-6 text-gray-700 text-lg">
            <div>
              🎉 Every month, one lucky winner takes home <strong>$100</strong>!
              To qualify, just enter your name, phone number, and wash with us.
              Good luck!
            </div>
            <br />
            <ul className="text-gray-600 text-left">
              <strong>Rules: Complete one of the following to qualify:</strong>
              <li>
                <a
                  href="https://www.facebook.com/people/The-Laundry-Hub-SF/61573774661069/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border border-gray-300 rounded py-3 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  <FaFacebook className="text-lg" />
                  Like us on Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/thelaundryhub_sf/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border border-gray-300 rounded py-3 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  <FaInstagram className="text-lg" />
                  Follow us on Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://share.google/vUZCcnlMT5geUXvH6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border border-gray-300 rounded py-3 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  <FaGoogle className="text-lg" />
                  Leave us a Google review
                </a>
              </li>
            </ul>
          </p>

          {isSubmitSuccessful ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded mb-6">
              🎉 Thanks for entering! Good luck!
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
                  <span className="text-red-500">*</span> Phone
                </label>
                <input
                  id="phone"
                  {...register("phone", {
                    required: "Phone number is required.",
                    pattern: {
                      value: /\(?([0-9]{3})\)?[- ]?([0-9]{3})[- ]?([0-9]{4})$/,
                      message: "Enter a valid 10-digit US phone number.",
                    },
                  })}
                  type="tel"
                  className={`w-full border rounded p-2 transition ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  autoComplete="tel"
                  placeholder="(415) 555-1234"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Email (optional but validated) */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email (optional)
                </label>
                <input
                  id="email"
                  {...register("email", {
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
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* SMS Consent Checkbox */}
              <div className="mb-4 text-sm">
                <label htmlFor="smsConsent" className="inline-flex items-start">
                  <input
                    id="smsConsent"
                    type="checkbox"
                    {...register("smsConsent", {
                      required:
                        "You must agree to receive SMS marketing messages.",
                    })}
                    className="form-checkbox mr-2 mt-1"
                  />
                  <span>
                    <strong>SMS Updates:</strong> By checking this box, you
                    agree to The Laundry Hub SF’s
                    <a
                      href="https://thelaundryhubsf.com/term-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600 mx-1"
                    >
                      Terms & Conditions
                    </a>
                    and
                    <a
                      href="https://thelaundryhubsf.com/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600 mx-1"
                    >
                      Privacy Policy
                    </a>
                    and consent to receive SMS marketing messages, including
                    promotional offers and updates. Message & data rates may
                    apply. Reply STOP to unsubscribe.
                  </span>
                </label>
                {errors.smsConsent && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.smsConsent.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Entering…" : "Enter Raffle"}
              </button>
            </form>
          )}
        </section>
      </main>
    </>
  );
};

export default RafflePage;
