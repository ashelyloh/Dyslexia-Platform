import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      default: 1,
    },
    message: {
      type: String,
    },
  },
  {
    timeStamps: true,
  }
);

export default mongoose.model("Feedback", feedbackSchema);
