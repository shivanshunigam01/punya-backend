import { Router } from "express";
import { getEmiSettings, updateEmiSettings } from "../../controllers/emiController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const r = Router();

r.get("/", getEmiSettings);
r.put("/", requireAuth, requireRole(["master_admin"]), updateEmiSettings);

export default r;
