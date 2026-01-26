import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Joi from "joi";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, fail } from "../utils/apiResponse.js";
import { User } from "../models/User.js";

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

function signAccess(user) {
  return jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
}
function signRefresh(user) {
  return jwt.sign({ id: user._id.toString(), type: "refresh" }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
}

export const login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const user = await User.findOne({ email: value.email, isActive: true });
  if (!user) return fail(res, "UNAUTHORIZED", "Invalid credentials", null, 401);

  const okPass = await user.comparePassword(value.password);
  if (!okPass) return fail(res, "UNAUTHORIZED", "Invalid credentials", null, 401);

  const access_token = signAccess(user);
  const refresh_token = signRefresh(user);

  user.lastLoginAt = new Date();
  user.refreshTokens.push({ token: refresh_token });
  await user.save();

  return ok(res, {
    access_token,
    refresh_token,
    expires_in: 3600,
    user: { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const schema = Joi.object({ refresh_token: Joi.string().required() });
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  let payload;
  try {
    payload = jwt.verify(value.refresh_token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return fail(res, "UNAUTHORIZED", "Invalid refresh token", null, 401);
  }
  if (payload.type !== "refresh") return fail(res, "UNAUTHORIZED", "Invalid refresh token", null, 401);

  const user = await User.findById(payload.id);
  if (!user) return fail(res, "UNAUTHORIZED", "Invalid refresh token", null, 401);

  const exists = user.refreshTokens.some(rt => rt.token === value.refresh_token);
  if (!exists) return fail(res, "UNAUTHORIZED", "Refresh token revoked", null, 401);

  const access_token = signAccess(user);
  return ok(res, { access_token, expires_in: 3600 });
});

export const logout = asyncHandler(async (req, res) => {
  const schema = Joi.object({ refresh_token: Joi.string().required() });
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) throw error;

  const user = await User.findById(req.user.id);
  if (!user) return ok(res, { message: "Logged out" });

  user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== value.refresh_token);
  await user.save();

  return ok(res, { message: "Logged out" });
});
