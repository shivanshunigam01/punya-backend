import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { applyFinance, listFinanceApplications, getFinanceApplication, patchFinanceStatus } from "../../controllers/financeController.js";

const r = Router();

// Public
r.post("/apply", applyFinance);

// Admin
r.get("/applications", requireAuth, requireRole(["admin","staff"]), listFinanceApplications);
r.get("/applications/:id", requireAuth, requireRole(["admin","staff"]), getFinanceApplication);
r.patch("/applications/:id/status", requireAuth, requireRole(["admin","staff"]), patchFinanceStatus);

export default r;
