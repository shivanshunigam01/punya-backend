import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { getPublicSettings, getAdminSettings, updateSettings } from "../../controllers/settingsController.js";

const r = Router();

// Public
r.get("/", getPublicSettings);

// Admin
r.get("/admin", requireAuth, requireRole(["admin"]), getAdminSettings);
r.put("/", requireAuth, requireRole(["admin"]), updateSettings);

export default r;
