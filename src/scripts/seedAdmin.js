import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { logger } from "../utils/logger.js";

await connectDB();

const email = "admin@patliputraautos.com";
const password = "Admin@12345";

const existing = await User.findOne({ email });
if (existing) {
  logger.info("Admin already exists:", email);
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 10);
await User.create({ email, passwordHash, role: "admin", name: "Master Admin", isActive: true });

logger.info("Seeded admin:", email, "password:", password);
process.exit(0);
