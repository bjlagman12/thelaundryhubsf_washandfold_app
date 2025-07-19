import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { format, addDays, setHours, setMinutes } from "date-fns";
import StepThreeForm from "./StepThreeForm";
import StepTwoForm from "./StepTwoForm";
import StepOneForm from "./StepOneForm";
import StepZeroForm from "./StepZeroForm";
import LH from "../../public/LH.svg";
import { Helmet } from "react-helmet";

export type OrderForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  laundryType: "basic" | "premium" | "";
  numberOfBags: string;
  dropOffDate: string;
  timeSlot: string;
  specialRequests: string;
  orderId?: string;
  notes?: string;
  serviceType: string;
};

const CustomerForm: React.FC = () => {
  const [step, setStep] = useState(0);
  const [orderId, setOrderId] = useState("");
  const [agree, setAgree] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderForm>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      laundryType: "",
      numberOfBags: "",
      dropOffDate: "",
      timeSlot: "",
      specialRequests: "",
      orderId: "",
      notes: "",
      serviceType: "",
    },
  });

  useEffect(() => {
    // This effect is not used for SEO, but left for your time slot logic
    const options: string[] = [];
    for (let i = 1; i <= 2; i++) {
      const date = addDays(new Date(), i);
      const twelve = setMinutes(setHours(date, 12), 0);
      const sevenThirty = setMinutes(setHours(date, 19), 30);
      options.push(format(twelve, "EEEE, MMM d 'at' h:mmaaa"));
      options.push(format(sevenThirty, "EEEE, MMM d 'at' h:mmaaa"));
    }
  }, []);

  const handleNext: SubmitHandler<OrderForm> = () => {
    setStep(2);
  };

  const handleFormSubmit: SubmitHandler<OrderForm> = async (data) => {
    const id = uuidv4().split("-")[0].toUpperCase();
    const order = {
      ...data,
      status: "received",
      createdAt: Timestamp.now(),
      orderId: id,
    };
    await addDoc(collection(db, "orders"), order);
    setOrderId(id);
    setStep(3);
  };

  // SEO titles/descriptions for each step
  const stepMeta = [
    {
      title: "Schedule Drop-Off | The Laundry Hub SF",
      desc: "Schedule your laundry drop-off and pickup in San Francisco with The Laundry Hub SF. Fast, reliable, and eco-friendly wash & fold service.",
    },
    {
      title: "Your Info | The Laundry Hub SF",
      desc: "Enter your contact information for your laundry order at The Laundry Hub SF.",
    },
    {
      title: "Review & Confirm | The Laundry Hub SF",
      desc: "Review and confirm your laundry order with The Laundry Hub SF.",
    },
    {
      title: "Thank You | The Laundry Hub SF",
      desc: "Thank you for your order! The Laundry Hub SF will contact you soon.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>{stepMeta[step].title}</title>
        <meta name="description" content={stepMeta[step].desc} />
      </Helmet>
      <main className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <section
          className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8"
          aria-labelledby="main-heading"
        >
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <a href="https://thelaundryhubsf.com" aria-label="Go to homepage">
                <img
                  src={LH}
                  alt="The Laundry Hub SF logo"
                  className="w-12 h-12 cursor-pointer"
                />
              </a>
              <h1 id="main-heading" className="text-xl font-bold text-gray-800">
                THE LAUNDRY HUB SF
              </h1>
              <h2 className="text-lg text-gray-700 font-semibold">
                Wash & Fold Service
              </h2>
            </div>
          </header>

          {/* Steps */}
          {step === 0 && (
            <section aria-labelledby="step-0-heading">
              <h2 id="step-0-heading" className="sr-only">
                Schedule Drop-Off
              </h2>
              <StepZeroForm
                register={register}
                handleSubmit={handleSubmit}
                errors={errors}
                nextStep={() => setStep(1)}
                setValue={setValue}
                watch={watch}
              />
            </section>
          )}

          {step === 1 && (
            <section aria-labelledby="step-1-heading">
              <h2 id="step-1-heading" className="sr-only">
                Your Info
              </h2>
              <StepOneForm
                register={register}
                handleSubmit={handleSubmit}
                errors={errors}
                onNext={handleNext}
                onBack={() => setStep(0)}
              />
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="step-2-heading">
              <h2 id="step-2-heading" className="sr-only">
                Review & Confirm
              </h2>
              <StepTwoForm
                getValues={getValues}
                handleSubmit={handleSubmit}
                handleFormSubmit={handleFormSubmit}
                agree={agree}
                setAgree={setAgree}
                onBack={() => setStep(1)}
              />
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="step-3-heading">
              <h2 id="step-3-heading" className="sr-only">
                Thank You
              </h2>
              <StepThreeForm orderId={orderId} />
            </section>
          )}
        </section>
      </main>
    </>
  );
};

export default CustomerForm;
