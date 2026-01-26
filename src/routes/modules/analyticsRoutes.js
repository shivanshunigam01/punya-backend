import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { logComparison, getComparisonAnalytics } from "../../controllers/analyticsController.js";

const r = Router();

// Public
r.post("/comparison", logComparison);

// Admin
r.get("/comparisons", requireAuth, requireRole(["admin","staff"]), getComparisonAnalytics);

export default r;
