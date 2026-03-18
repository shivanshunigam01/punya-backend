import { Router } from "express";
import {
  listTimeline,
  getTimelineById,
  createTimeline,
  updateTimeline,
  deleteTimeline,
} from "../controllers/timelineController.js";

import { requireAuth, requireRole } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

/* ========= PUBLIC ========= */
router.get("/", listTimeline);

/* ========= ADMIN ========= */
router.get(
  "/admin/:id",
  requireAuth,
  requireRole(["master_admin", "master_admin"]),
  getTimelineById
);

router.post(
  "/",
  requireAuth,
  requireRole(["master_admin", "master_admin"]),
  upload.single("image"),
  createTimeline
);

router.put(
  "/:id",
  requireAuth,
  requireRole(["master_admin", "master_admin"]),
  upload.single("image"),
  updateTimeline
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["master_admin", "master_admin"]),
  deleteTimeline
);

export default router;