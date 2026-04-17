import { Router } from "express";
import { rateLimiters } from "../../middleware/rateLimiters.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  createCibilPaymentOrder,
  verifyCibilPaymentAndCheck,
  listCibilChecks,
  cibilAnalytics,
  getCibilCheckById,
} from "../../controllers/cibilController.js";

const r = Router();

// Public (payment + verification)
r.post("/create-order", rateLimiters.cibilCreateOrder, createCibilPaymentOrder);
r.post("/verify-and-check", rateLimiters.cibilVerify, verifyCibilPaymentAndCheck);
// Alias for admin panel / legacy clients
r.post("/verify-payment", rateLimiters.cibilVerify, verifyCibilPaymentAndCheck);

// Admin (list + analytics + detail)
r.get("/", requireAuth, requireRole(["master_admin", "staff"]), listCibilChecks);
r.get("/analytics", requireAuth, requireRole(["master_admin", "staff"]), cibilAnalytics);
r.get("/:id", requireAuth, requireRole(["master_admin", "staff"]), getCibilCheckById);

export default r;
