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
import { trackVisitor } from "./middleware/trackVisitor.js";
import dotenv from "dotenv";
dotenv.config();


const app = express();

/* security */
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(mongoSanitize());
app.use(hpp());

/* parsers */
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

/* perf */
app.use(compression());

/* cors */
app.use(cors());

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

/* routes */
app.use("/", routes);
app.use(trackVisitor);
/* errors */
app.use(notFound);
app.use(errorHandler);

export default app; // 🔥 VERY IMPORTANT
