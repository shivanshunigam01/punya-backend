// import express from 'express';
// const router = express.Router();

// import careerController from '../controllers/careerController.js';
// import { requireAuth, requireRole } from '../middleware/auth.js';
// import upload from '../middleware/upload.js';

// // ════════════ PUBLIC ROUTES (User Panel) ════════════

// // Get active job openings (for careers page)
// router.get('/openings/active', careerController.getActiveOpenings);

// // Submit job application (with resume upload)
// router.post(
//   '/applications',
//   upload.single('resume'),
//   careerController.submitApplication
// );

// // ════════════ master_admin ROUTES (Protected) ════════════

// // Job Openings CRUD
// router.get('/openings', authenticate, authorize('careers', 'view'), careerController.getAllOpenings);
// router.get('/openings/:id', authenticate, authorize('careers', 'view'), careerController.getOpeningById);
// router.post('/openings', authenticate, authorize('careers', 'create'), careerController.createOpening);
// router.put('/openings/:id', authenticate, authorize('careers', 'edit'), careerController.updateOpening);
// router.delete('/openings/:id', authenticate, authorize('careers', 'delete'), careerController.deleteOpening);

// // Job Applications (master_admin)
// router.get('/applications', authenticate, authorize('careers', 'view'), careerController.getAllApplications);
// router.patch('/applications/:id/status', authenticate, authorize('careers', 'edit'), careerController.updateApplicationStatus);
// router.delete('/applications/:id', authenticate, authorize('careers', 'delete'), careerController.deleteApplication);

// export default router;

import express from "express";
const router = express.Router();

import careerController from "../controllers/careerController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

/* ════════════ PUBLIC ROUTES ════════════ */

// Get active job openings (careers page)
router.get("/openings/active", careerController.getActiveOpenings);

// Submit job application (resume upload)
router.post(
  "/applications",
  upload.single("resume"),
  careerController.submitApplication
);

/* ════════════ master_admin ROUTES ════════════ */

// Job Openings CRUD
router.get(
  "/openings",
  requireAuth,
  requireRole(["master_admin"]),
  careerController.getAllOpenings
);

router.get(
  "/openings/:id",
  requireAuth,
  requireRole(["master_admin"]),
  careerController.getOpeningById
);

router.post(
  "/openings",
  requireAuth,
  requireRole(["master_admin"]),
  careerController.createOpening
);

router.put(
  "/openings/:id",
  requireAuth,
  requireRole(["master_admin"]),
  careerController.updateOpening
);

router.delete(
  "/openings/:id",
  requireAuth,
  requireRole(["master_admin"]),
  careerController.deleteOpening
);

// Applications (master_admin panel)
router.get(
  "/applications",
  requireAuth,
  requireRole(["master_admin"]),
  careerController.getAllApplications
);

router.patch(
  "/applications/:id/status",
  requireAuth,
  requireRole(["master_admin"]),
  careerController.updateApplicationStatus
);

router.delete(
  "/applications/:id",
  requireAuth,
  requireRole(["master_admin"]),
  careerController.deleteApplication
);

export default router;