import { Router } from "express";
import { dashboard } from "../../controllers/dashboardController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const r = Router();
r.get("/", requireAuth, requireRole(["admin","staff"]), dashboard);
export default r;
