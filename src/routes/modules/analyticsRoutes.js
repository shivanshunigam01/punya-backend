import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { getComparisonAnalytics } from "../../controllers/analyticsController.js";

const r = Router();

r.get(
  "/comparisons",
  requireAuth,
  requireRole(["master_admin", "staff"]),
  getComparisonAnalytics
);

export default r;
