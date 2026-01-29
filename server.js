// server.js
import dotenv from "dotenv";
dotenv.config(); // ✅ MUST BE FIRST — NO EXCEPTIONS

import { initCloudinary } from "./src/config/cloudinary.js";
initCloudinary(); // ✅ INIT ONCE, HERE ONLY

import http from "http";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { logger } from "./src/utils/logger.js";

console.log("ENV TEST:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: !!process.env.CLOUDINARY_API_KEY,
  secret: !!process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 5000;

await connectDB();

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`API running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.warn("SIGINT received. Shutting down...");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", async () => {
  logger.warn("SIGTERM received. Shutting down...");
  server.close(() => process.exit(0));
});