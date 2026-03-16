import express from 'express';
const router = express.Router();

import careerController from '../controllers/careerController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import upload from '../middleware/upload.js';

// ════════════ PUBLIC ROUTES (User Panel) ════════════

// Get active job openings (for careers page)
router.get('/openings/active', careerController.getActiveOpenings);

// Submit job application (with resume upload)
router.post(
  '/applications',
  upload.single('resume'),
  careerController.submitApplication
);

// ════════════ ADMIN ROUTES (Protected) ════════════

// Job Openings CRUD
router.get('/openings', authenticate, authorize('careers', 'view'), careerController.getAllOpenings);
router.get('/openings/:id', authenticate, authorize('careers', 'view'), careerController.getOpeningById);
router.post('/openings', authenticate, authorize('careers', 'create'), careerController.createOpening);
router.put('/openings/:id', authenticate, authorize('careers', 'edit'), careerController.updateOpening);
router.delete('/openings/:id', authenticate, authorize('careers', 'delete'), careerController.deleteOpening);

// Job Applications (Admin)
router.get('/applications', authenticate, authorize('careers', 'view'), careerController.getAllApplications);
router.patch('/applications/:id/status', authenticate, authorize('careers', 'edit'), careerController.updateApplicationStatus);
router.delete('/applications/:id', authenticate, authorize('careers', 'delete'), careerController.deleteApplication);

export default router;