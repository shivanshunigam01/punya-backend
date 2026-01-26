import { Router } from "express";
import { listUsedVehicles, getUsedVehicle, createUsedVehicle, updateUsedVehicle, patchUsedVehicleStatus, deleteUsedVehicle } from "../../controllers/usedVehicleController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const r = Router();

// Public
r.get("/", listUsedVehicles);
r.get("/:id", getUsedVehicle);

// Admin
r.post("/", requireAuth, requireRole(["admin"]), createUsedVehicle);
r.put("/:id", requireAuth, requireRole(["admin"]), updateUsedVehicle);
r.patch("/:id/status", requireAuth, requireRole(["admin"]), patchUsedVehicleStatus);
r.delete("/:id", requireAuth, requireRole(["admin"]), deleteUsedVehicle);

export default r;
