import { useState, ChangeEvent, FormEvent } from "react";
import { Loader, Send } from "lucide-react";
import PostFeedback from "../customHooks/PostFeedback";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

interface FormData {
  rating: number;
  message: string;
}

const Feedback = () => {
  const [formData, setFormData] = useState<FormData>({
    rating: 0,
    message: "",
  });

  const { token } = useSelector((state: any) => state?.auth);
  const { loading, PostData } = PostFeedback("/feedback/", token);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Handle rating change
  const handleRating = (rating: number) => {
    setFormData((prevData) => ({
      ...prevData,
      rating,
    }));
  };

  // Handle message change
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { rating, message } = formData;

    // Validation check
    if (rating === 0 || !message) {
      setErrorMessage("Please select a rating and provide your feedback.");
      return;
    }

    const resp = await PostData({ message, rating });

    // Success message
    if (resp) {
      setSuccessMessage("Thank you for your feedback!");
      setErrorMessage("");
      setFormData({ rating: 0, message: "" });
      toast.success(resp?.message);
    }
  };

  const textColor = localStorage.getItem("textColor");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">
          We Value Your Feedback
        </h2>
        <p
          style={{ color: `${textColor ? textColor : ""}` }}
          className="text-gray-600 text-center mb-6"
        >
          Let us know how we can improve!
        </p>

        {/* Success/Error Messages */}
        {successMessage && (
          <p className="text-green-500 text-center mb-4">{successMessage}</p>
        )}
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label
              style={{ color: `${textColor ? textColor : ""}` }}
              className="block text-gray-700 font-medium"
            >
              How do you feel about our platform?
            </label>
            <div
              style={{ color: `${textColor ? textColor : ""}` }}
              className="flex items-center justify-center space-x-4 mt-4"
            >
              {[
                { emoji: "😢", label: "Sad", value: 1 },
                { emoji: "😐", label: "Neutral", value: 2 },
                { emoji: "🙂", label: "Happy", value: 3 },
                { emoji: "😃", label: "Excited", value: 4 },
                { emoji: "😍", label: "Loved it", value: 5 },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleRating(item.value)}
                  className={`flex flex-col items-center p-3 border rounded-lg transition ${
                    formData.rating === item.value
                      ? "bg-blue-100 border-blue-500"
                      : "border-gray-300"
                  } hover:scale-105`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div style={{ color: `${textColor ? textColor : ""}` }}>
            <label
              style={{ color: `${textColor ? textColor : ""}` }}
              htmlFor="message"
              className="block text-gray-700 font-medium"
            >
              Feedback Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 mt-1 border rounded-lg"
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-2 flex justify-center items-center text-lg font-semibold ${
              loading
                ? "bg-gray-100"
                : "text-white bg-indigo-600  hover:bg-indigo-700 "
            } rounded-md focus:outline-none focus:ring focus:ring-indigo-300`}
          >
            {loading ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
