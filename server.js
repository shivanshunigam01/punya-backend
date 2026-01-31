// server.js
import dotenv from "dotenv";
dotenv.config(); // must be first

import http from "http";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { initCloudinary } from "./src/config/cloudinary.js";
import { logger } from "./src/utils/logger.js";

const PORT = process.env.PORT; // ❗ DO NOT FALLBACK IN HOSTINGER

async function startServer() {
  try {
    initCloudinary(); // safe here

    await connectDB(); // inside async fn

    const server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info(`API running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGINT", () => server.close(() => process.exit(0)));
    process.on("SIGTERM", () => server.close(() => process.exit(0)));

  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1); // IMPORTANT → Hostinger shows error logs
  }
}

startServer();
