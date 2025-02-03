import Feedback from "../models/feedback.js";

// Submit or update feedback
export const submitFeedback = async (req, res) => {
  try {
    const { message, rating } = req.body;

    // Check if user is authenticated
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in" });
    }

    // Check if feedback already exists for the user
    let feedback = await Feedback.findOne({ user: req.user });

    if (feedback) {
      // Update existing feedback
      feedback.message = message;
      feedback.rating = rating;
      await feedback.save(); // Save updated feedback
      return res.status(200).json({ message: "Feedback has been updated" });
    } else {
      // Create new feedback
      await Feedback.create({
        user: req.user,
        message,
        rating,
      });
      return res.status(201).json({ message: "Feedback has been submitted" });
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!id) {
      return res.status(400).json({ message: "Feedback ID is required" });
    }

    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    return res.status(200).json({ message: "Feedback has been deleted" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

export const getFeedback = async (req, res) => {
  try {
    // Fetch feedbacks and populate user details (username and email)
    const feedback = await Feedback.find().populate("user", "username email");

    // If no feedbacks are found
    if (!feedback || feedback.length === 0) {
      return res.status(404).json({ message: "No feedback found." });
    }

    // Return the feedback list
    return res.status(200).json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);

    // Handle unexpected errors
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching feedback.",
      error: error.message,
    });
  }
};
