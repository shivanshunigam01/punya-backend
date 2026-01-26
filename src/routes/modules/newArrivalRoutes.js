import { Router } from "express";
import { listNewArrivals, addNewArrival, updateNewArrival, deleteNewArrival } from "../../controllers/newArrivalController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const r = Router();

// Public
r.get("/", listNewArrivals);

// Admin
r.post("/", requireAuth, requireRole(["admin"]), addNewArrival);
r.put("/:id", requireAuth, requireRole(["admin"]), updateNewArrival);
r.delete("/:id", requireAuth, requireRole(["admin"]), deleteNewArrival);

export default r;
