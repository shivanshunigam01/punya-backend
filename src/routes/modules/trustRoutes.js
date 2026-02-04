import { Router } from "express";
import { listTrustPillars, createTrustPillar, updateTrustPillar, deleteTrustPillar } from "../../controllers/trustPillarController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const r = Router();

// Public
r.get("/", listTrustPillars);

// Admin
r.post("/", requireAuth, requireRole(["master_admin"]), createTrustPillar);
r.put("/:id", requireAuth, requireRole(["master_admin"]), updateTrustPillar);
r.delete("/:id", requireAuth, requireRole(["master_admin"]), deleteTrustPillar);

export default r;
