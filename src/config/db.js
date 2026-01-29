import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  console.log("RAW URI =", uri);

  if (!uri) {
    throw new Error("MONGODB_URI missing in env");
  }

  if (!uri.startsWith("mongodb")) {
    throw new Error("Invalid Mongo URI: " + uri);
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    autoIndex: process.env.NODE_ENV !== "production",
  });

  logger.info("MongoDB connected");
}