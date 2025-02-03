import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
export const register = async (req, res) => {
  try {
    const { username, email, password, gender, dob } = req.body;
    const user = await User.create({ username, email, password, gender, dob });
    //const token = generateToken(user._id);
    res.status(201).json({ success: true, message: "user registered" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id);
    res
      .status(200)
      .json({ success: true, token, user, message: "login successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
