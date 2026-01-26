import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

import { errorHandler, notFound } from "./middleware/error.js";
import { rateLimiters } from "./middleware/rateLimiters.js";
import { attachRequestMeta } from "./middleware/requestMeta.js";

import routes from "./routes/index.js";

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(mongoSanitize());
app.use(hpp());

// Body parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// CORS
const origin = process.env.CORS_ORIGIN?.split(",").map(s => s.trim()).filter(Boolean) || "*";
app.use(cors({ origin, credentials: true }));

// Logging
app.use(morgan("dev"));

// Request meta (ip/userAgent/referrer)
app.use(attachRequestMeta);

// Public rate limiting
app.use(rateLimiters.general);

// Health
app.get("/", (req, res) => res.json({ status: "ok", service: "Patliputra Showroom API", timestamp: new Date().toISOString() }));

// API v1
app.use("/v1", routes);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

export default app;
