import express from "express";
const router = express.Router();

import {
  listDealers,
  getDealer,
  createDealer,
  updateDealer,
  deleteDealer,
} from "../controllers/dealerController.js";

import { requireAuth, requireRole } from "../middleware/auth.js";

/* ════════════ PUBLIC ROUTES ════════════ */

// ✅ No auth, no role
router.get("/", listDealers);

/* ════════════ master_admin ROUTES ════════════ */

router.get(
  "/:id",
  requireAuth,
  requireRole(["master_admin"]),
  getDealer
);

router.post(
  "/",
  requireAuth,
  requireRole(["master_admin"]),
  createDealer
);

router.put(
  "/:id",
  requireAuth,
  requireRole(["master_admin"]),
  updateDealer
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["master_admin"]),
  deleteDealer
);

export default router;