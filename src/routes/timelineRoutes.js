import express from "express";
import {
  getAllTimeline,
  getActiveTimeline,
  getTimelineById,
  createTimeline,
  updateTimeline,
  deleteTimeline,
} from "../controllers/timelineController.js";

import { requireAuth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// PUBLIC
router.get("/active", getActiveTimeline);

// ADMIN
router.get("/", requireAuth, getAllTimeline);
router.get("/:id", requireAuth, getTimelineById);

router.post("/", requireAuth, upload.single("image"), createTimeline);
router.put("/:id", requireAuth, upload.single("image"), updateTimeline);
router.delete("/:id", requireAuth, deleteTimeline);

export default router;