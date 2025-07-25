import { useForm } from "react-hook-form";

type MaterialHoursFormData = {
  who: string;
  date: string;
  description: string;
  hours: string;
  file: FileList | null;
};

export default function MaterialHoursForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({
    defaultValues: {
      who: "Brian",
      date: new Date().toISOString().slice(0, 10),
      description: "",
      hours: "",
      file: null,
    },
  });

  const onSubmit = async (data: MaterialHoursFormData) => {
    // build FormData for both text + binary
    const formData = new FormData();
    formData.append("name", data.who);
    formData.append("date", data.date);
    formData.append("description", data.description);
    formData.append("hours", data.hours);
    if (data.file?.length) {
      formData.append("file", data.file[0]);
    }

    try {
      const res = await fetch(
        "http://localhost:5678/webhook-test/timesheet-entry",
        {
          method: "POST",
          body: formData,
        }
      );
      if (!res.ok) throw new Error(await res.text());
      reset({ description: "", hours: "", file: null });
    } catch (err) {
      console.error(err);
      alert("Submission failed. See console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg max-w-lg w-full p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Material Hours
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Who */}
            <div>
              <label
                htmlFor="who"
                className="block text-sm font-medium text-gray-700"
              >
                User
              </label>
              <select
                id="who"
                {...register("who", { required: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Brian</option>
                <option>John</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                {...register("date", { required: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              {...register("description", { required: true })}
              placeholder="What did you do?"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">Required</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hours */}
            <div>
              <label
                htmlFor="hours"
                className="block text-sm font-medium text-gray-700"
              >
                Hours
              </label>
              <input
                type="number"
                id="hours"
                step="0.1"
                {...register("hours", {
                  required: true,
                  min: { value: 0, message: "Must be ≥ 0" },
                })}
                placeholder="0.0"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.hours && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.hours.message || "Required"}
                </p>
              )}
            </div>

            {/* File */}
            <div>
              <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Photo (optional)
              </label>
              <label
                htmlFor="file"
                className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 text-gray-500 text-sm transition"
              >
                Upload here
                <input
                  type="file"
                  id="file"
                  accept="image/*"
                  capture="environment"
                  {...register("file")}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : "Submit"}
            </button>
          </div>

          {isSubmitSuccessful && (
            <p className="text-green-600 text-center mt-2">
              ✅ Submitted successfully!
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
