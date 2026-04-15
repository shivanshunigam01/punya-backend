import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const existing = await User.findOne({ role: "master_admin" });
if (existing) {
  console.log("❌ Master Admin already exists");
  process.exit(0);
}

await User.create({
  name: "Master Admin",
  email: "admin@punyaautomobiles.com",
  mobile: "987654321",
  password: "admin123", // initial password
  role: "master_admin",
  isActive: true,
});

console.log("✅ Master Admin created");
process.exit(0);