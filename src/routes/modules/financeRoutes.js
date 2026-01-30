import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { applyFinance, listFinanceApplications, getFinanceApplication, patchFinanceStatus } from "../../controllers/financeController.js";

const r = Router();

// Public
r.post("/apply", applyFinance);

// Admin
r.get("/applications", requireAuth, requireRole(["master_admin","staff"]), listFinanceApplications);
r.get("/applications/:id", requireAuth, requireRole(["master_admin","staff"]), getFinanceApplication);
r.patch("/applications/:id/status", requireAuth, requireRole(["master_admin","staff"]), patchFinanceStatus);

export default r;
