const express = require("express");
const router = express.Router();

const timelineController = require("../controllers/timelineController");

// ✅ FIXED AUTH IMPORT
const { requireAuth } = require("../middleware/auth");

const upload = require("../middleware/upload");

// 🔓 PUBLIC
router.get("/active", timelineController.getActiveTimeline);

// 🔐 ADMIN
router.get("/", requireAuth, timelineController.getAllTimeline);
router.get("/:id", requireAuth, timelineController.getTimelineById);

router.post(
  "/",
  requireAuth,
  upload.single("image"),
  timelineController.createTimeline
);

router.put(
  "/:id",
  requireAuth,
  upload.single("image"),
  timelineController.updateTimeline
);

router.delete("/:id", requireAuth, timelineController.deleteTimeline);

module.exports = router;