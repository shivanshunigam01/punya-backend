import express from "express";
import {
  listDealers,
  getDealer,
  createDealer,
  updateDealer,
  deleteDealer,
} from "../controllers/dealerController.js";

import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * 🔐 ALL DEALER ROUTES REQUIRE LOGIN
 */
router.use(requireAuth);

/**
 * ADMIN / MASTER ADMIN ONLY
 */
router.get("/", requireRole(["master_admin", "admin"]), listDealers);
router.get("/:id", requireRole(["master_admin", "admin"]), getDealer);
router.post("/", requireRole(["master_admin", "admin"]), createDealer);
router.put("/:id", requireRole(["master_admin", "admin"]), updateDealer);
router.delete("/:id", requireRole(["master_admin", "admin"]), deleteDealer);

export default router;
