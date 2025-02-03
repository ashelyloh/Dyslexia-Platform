import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
// Get All Users with Pagination and Search
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // Search users by name or email
    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { _id: { $ne: req.user } },
      ],
    };

    // Pagination
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Total Count for pagination
    const totalCount = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

// Get Single User
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

export const uploadProfile_pic = async (req, res) => {
  try {
    // Check if the user exists
    const user = await User.findById(req.user);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.profile_pic) {
      const oldPicPath = path.join(
        process.cwd(),
        "public/uploads",
        user.profile_pic
      );
      if (fs.existsSync(oldPicPath)) {
        fs.unlinkSync(oldPicPath); // Delete old file
        console.log("Old profile picture deleted");
      }
    }

    // Save the new profile picture
    const newProfilePic = req.file.filename;
    user.profile_pic = newProfilePic; // Update the user object with the new profile pic filename

    // Save the updated user data
    await user.save();

    res.status(200).json({
      success: true,

      message: "Profile picture updated successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    // Check if the user exists
    const user = await User.findById(req.user);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Handle profile picture update if provided
    if (req.body.profile_pic) {
      user.profile_pic = req.body.profile_pic; // Update with the new profile picture URL or data
    }

    // Update user with new data
    user.username = req.body.username || user.username; // Keep existing username if not provided
    user.email = req.body.email || user.email; // Keep existing email if not provided
    user.bio = req.body.bio || user.bio; // Keep existing bio if not provided

    // Save updated user to the database
    const updatedUser = await user.save();

    // Return updated user data in the response
    res.status(200).json({
      success: true,
      message: "Profile has been updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

//upload profile picture

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

//assigb role

export const ChangeRole = async (req, res) => {
  console.log("Request Body:", req.body);

  try {
    const { id, role } = req.body;

    // Ensure both `id` and `role` are provided
    if (!id || !role) {
      return res
        .status(400)
        .json({ success: false, message: "User ID and role are required." });
    }

    console.log("User ID:", id, "Role:", role);

    // Find the user by ID
    const user = await User.findById(id);

    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Update the user's role
    user.role = role;
    await user.save();

    // Send a successful response
    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
      error: error.message || error,
    });
  }
};
