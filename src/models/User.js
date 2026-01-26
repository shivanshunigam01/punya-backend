import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "admin", enum: ["admin", "staff"] },
    name: { type: String, default: "Admin" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model("User", UserSchema);
