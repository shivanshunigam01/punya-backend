import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import path from "path";
import { fileURLToPath } from "url";

import { errorHandler, notFound } from "./middleware/error.js";
import { rateLimiters } from "./middleware/rateLimiters.js";
import { attachRequestMeta } from "./middleware/requestMeta.js";
import routes from "./routes/index.js";
import { trackVisitor } from "./middleware/trackVisitor.js";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

/* security */
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(mongoSanitize());
app.use(hpp());

/* parsers */

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* perf */
app.use(compression());

app.use(morgan("dev"));

app.use(attachRequestMeta);
app.use(rateLimiters.general);

/* health */
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Patliputra Showroom API",
    timestamp: new Date().toISOString(),
  });
});
/* serve uploaded files */
const uploadsPath = path.resolve(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));
/* routes */
app.use("/", routes);
app.use(trackVisitor);
/* errors */
app.use(notFound);
app.use(errorHandler);

export default app; // 🔥 VERY IMPORTANT
