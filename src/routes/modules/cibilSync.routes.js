import { Router } from "express";
import { rateLimiters } from "../../middleware/rateLimiters.js";
import { syncCibilFromPayment } from "../../controllers/cibilSync.controller.js";

const r = Router();

// Internal sync (called after payment + cibil)
r.post("/sync-from-payment", rateLimiters.cibil, syncCibilFromPayment);

export default r;
