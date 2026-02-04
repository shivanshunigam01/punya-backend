import express from "express";
import {
  listOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
} from "../controllers/offer.controller.js";

import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * 🔐 All offer routes require login
 */
router.use(requireAuth);

/**
 * ADMIN / MASTER ADMIN
 */
router.get("/", requireRole(["master_admin", "master_admin"]), listOffers);
router.get("/:id", requireRole(["master_admin", "master_admin"]), getOffer);
router.post("/", requireRole(["master_admin", "master_admin"]), createOffer);
router.put("/:id", requireRole(["master_admin", "master_admin"]), updateOffer);
router.delete("/:id", requireRole(["master_admin", "master_admin"]), deleteOffer);

export default router;
