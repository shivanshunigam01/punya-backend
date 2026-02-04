import { Router } from "express";
import { listUsedVehicles, getUsedVehicle, createUsedVehicle, updateUsedVehicle, patchUsedVehicleStatus, deleteUsedVehicle } from "../../controllers/usedVehicleController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { uploadProductMedia } from "../../middleware/upload.js";

const r = Router();

// Public
r.get("/", listUsedVehicles);
r.get("/:id", getUsedVehicle);

// Admin
r.post(
  "/",
  requireAuth,
  requireRole(["master_admin", "master_admin"]),
  uploadProductMedia,
  createUsedVehicle
);

r.put(
  "/:id",
  requireAuth,
  requireRole(["master_admin", "master_admin"]),
  uploadProductMedia,
  updateUsedVehicle
);
r.patch("/:id/status", requireAuth, requireRole(["master_admin","master_admin"]), patchUsedVehicleStatus);
r.delete("/:id", requireAuth, requireRole(["master_admin","master_admin"]), deleteUsedVehicle);

export default r;
