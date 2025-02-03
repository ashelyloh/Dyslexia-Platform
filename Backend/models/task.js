import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"], // Adds a custom error message
      trim: true, // Trims white spaces from the title
      minlength: [3, "Task title must be at least 3 characters long"], // Ensures a minimum length
      maxlength: [100, "Task title cannot exceed 100 characters"], // Ensures a maximum length
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be less than 0"], // Minimum value for progress
      max: [100, "Progress cannot exceed 100"], // Maximum value for progress
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"], // Added "In Progress" status for better tracking
      default: "Pending",
    },
    deadline: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v > new Date(); // Deadline must be in the future
        },
        message: "Deadline must be a future date",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must belong to a user"], // Ensures the task is linked to a user
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure progress and status consistency
taskSchema.pre("save", function (next) {
  if (this.progress === 100) {
    this.status = "Completed";
  } else if (this.progress > 0) {
    this.status = "In Progress";
  }
  next();
});

// Indexes for faster queries
taskSchema.index({ user: 1, status: 1 }); // Indexes user and status for frequent queries
taskSchema.index({ deadline: 1 }); // Indexes deadline for sorting and querying

export default mongoose.model("Task", taskSchema);
