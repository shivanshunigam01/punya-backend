const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 🔓 Public
router.get('/active', timelineController.getActive);

// 🔐 Admin (protected)
router.get('/', requireAuth, timelineController.getAll);
router.get('/:id', requireAuth, timelineController.getById);
router.post('/', requireAuth, uploadProductMedia, timelineController.create);
router.put('/:id', requireAuth, uploadProductMedia, timelineController.update);
router.delete('/:id', requireAuth, timelineController.remove);

module.exports = router;
