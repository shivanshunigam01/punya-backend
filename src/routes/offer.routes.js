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
 * PUBLIC ROUTES
 */
router.get("/", listOffers);
router.get("/:id", getOffer);

/**
 * ADMIN ONLY
 */
router.post("/", requireAuth, requireRole(["master_admin"]), createOffer);
router.put("/:id", requireAuth, requireRole(["master_admin"]), updateOffer);
router.delete("/:id", requireAuth, requireRole(["master_admin"]), deleteOffer);

export default router;