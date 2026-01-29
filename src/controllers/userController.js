import User from "../models/User.js";
import crypto from "crypto";

// CREATE USER (ADMIN ONLY)
export const registerUser = async (req, res) => {
  const { name, email, mobile, role, isActive } = req.body;

  // Only Admin / Master Admin can create users
  if (!["master_admin", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Permission denied" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Auto-generate password
  const generatedPassword = crypto.randomBytes(4).toString("hex");

  const user = await User.create({
    name,
    email,
    mobile,
    role,
    isActive,
    password: generatedPassword,
    createdBy: req.user.id,
  });

  res.status(201).json({
    message: "User created successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isActive: user.isActive,
    },
    tempPassword: generatedPassword, // show once (UI / email)
  });
};