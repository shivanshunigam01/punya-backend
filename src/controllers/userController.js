import Joi from "joi";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";

/* -------------------- VALIDATION -------------------- */

const createSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().required(),
  role: Joi.string()
    .valid("master_admin", "admin", "sales_user", "custom")
    .required(),
  roleLabel: Joi.string().allow("", null),
  isActive: Joi.boolean().default(true),
  permissions: Joi.object().optional(),
});

const updateSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  mobile: Joi.string().optional(),
  role: Joi.string().valid("master_admin", "admin", "sales_user", "custom"),
  roleLabel: Joi.string().allow("", null),
  isActive: Joi.boolean(),
  permissions: Joi.object(),
});

/* -------------------- CONTROLLERS -------------------- */

// ➕ CREATE USER
export const registerUser = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) throw error;

  const exists = await User.findOne({ email: value.email });
  if (exists) {
    throw new Error("User already exists with this email");
  }

  const password = await bcrypt.hash("Welcome@123", 10);

  const user = await User.create({
    ...value,
    password,
    createdBy: req.user.id,
  });

  return ok(res, user);
});

// 📥 GET ALL USERS
export const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({})
    .select("-password")
    .sort({ createdAt: -1 });

  return ok(res, users);
});

// ✏️ UPDATE USER
export const updateUser = asyncHandler(async (req, res) => {
  const { error, value } = updateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) throw error;

  const user = await User.findByIdAndUpdate(req.params.id, value, {
    new: true,
  }).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return ok(res, user);
});

// 🗑 DELETE USER
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "master_admin") {
    throw new Error("Master Admin cannot be deleted");
  }

  await user.deleteOne();
  return ok(res, true);
});
