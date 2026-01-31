// src/app.js
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

/* ================= SECURITY ================= */
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(mongoSanitize());
app.use(hpp());

/* ================= BODY PARSING (FIXED) ================= */
app.use((req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    return next(); // ❗ DO NOT JSON PARSE MULTIPART
  }
  express.json({ limit: "2mb" })(req, res, next);
});

app.use(express.urlencoded({ extended: true }));

/* ================= PERFORMANCE ================= */
app.use(compression());

/* ================= CORS ================= */
app.use(
  cors({
    origin: [
      "https://patliputragroup.co.in",
      "https://cpanel.patliputragroup.com",
      "http://localhost:8080",
      "http://localhost:8081"


    ],
    credentials: true,
  })
);
/* ================= LOGGING ================= */
app.use(morgan("dev"));

/* ================= META + LIMIT ================= */
app.use(attachRequestMeta);
app.use(rateLimiters.general);

/* ================= HEALTH ================= */
app.get("/", (req, res) =>
  res.json({
    status: "ok",
    service: "Patliputra Showroom API",
    timestamp: new Date().toISOString(),
  })
);

/* ================= ROUTES ================= */
app.use("/", routes);
app.use("/uploads", express.static("uploads"));

/* ================= ERRORS ================= */
app.use(notFound);
app.use(errorHandler);

export default app;