const JobOpening = require('../models/JobOpening');
const JobApplication = require('../models/JobApplication');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// ═══════════════════════════════════════
// JOB OPENINGS
// ═══════════════════════════════════════

// GET /api/careers/openings
exports.getAllOpenings = async (req, res, next) => {
  try {
    const { search, is_active } = req.query;
    const filter = {};

    if (is_active !== undefined) filter.isActive = is_active === 'true';
    if (search) filter.$text = { $search: search };

    const openings = await JobOpening.find(filter).sort({ priority: -1, createdAt: -1 });
    res.json({ data: openings });
  } catch (err) {
    next(err);
  }
};

// GET /api/careers/openings/active  (PUBLIC — no auth)
exports.getActiveOpenings = async (req, res, next) => {
  try {
    const openings = await JobOpening.find({ isActive: true }).sort({ priority: -1, createdAt: -1 });
    res.json({ data: openings });
  } catch (err) {
    next(err);
  }
};

// GET /api/careers/openings/:id
exports.getOpeningById = async (req, res, next) => {
  try {
    const opening = await JobOpening.findById(req.params.id);
    if (!opening) return res.status(404).json({ message: 'Job opening not found' });
    res.json({ data: opening });
  } catch (err) {
    next(err);
  }
};

// POST /api/careers/openings
exports.createOpening = async (req, res, next) => {
  try {
    const opening = await JobOpening.create(req.body);
    res.status(201).json({ data: opening });
  } catch (err) {
    next(err);
  }
};

// PUT /api/careers/openings/:id
exports.updateOpening = async (req, res, next) => {
  try {
    const opening = await JobOpening.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!opening) return res.status(404).json({ message: 'Job opening not found' });
    res.json({ data: opening });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/careers/openings/:id
exports.deleteOpening = async (req, res, next) => {
  try {
    const opening = await JobOpening.findByIdAndDelete(req.params.id);
    if (!opening) return res.status(404).json({ message: 'Job opening not found' });
    // Also delete associated applications
    await JobApplication.deleteMany({ jobId: req.params.id });
    res.json({ message: 'Job opening and associated applications deleted' });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════
// JOB APPLICATIONS
// ═══════════════════════════════════════

// GET /api/careers/applications  (Admin)
exports.getAllApplications = async (req, res, next) => {
  try {
    const { job_id, status, search } = req.query;
    const filter = {};

    if (job_id) filter.jobId = job_id;
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };

    const applications = await JobApplication.find(filter)
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    // Map jobTitle from populated jobId
    const result = applications.map((app) => ({
      ...app.toObject(),
      _id: app._id,
      jobTitle: app.jobId?.title || 'Unknown',
      jobId: app.jobId?._id || app.jobId,
    }));

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

// POST /api/careers/applications  (PUBLIC — user panel form submission)
// Expects multipart/form-data with resume file
exports.submitApplication = async (req, res, next) => {
  try {
    const { jobId, name, email, mobile, whyShouldWeHire } = req.body;

    // Validate job exists and is active
    const job = await JobOpening.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(400).json({ message: 'Job opening not found or inactive' });
    }

    // Upload resume to Cloudinary (or local storage)
    let resumeUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, {
        folder: 'careers/resumes',
        resource_type: 'raw', // for PDFs/docs
      });
      resumeUrl = result.secure_url;
    } else if (req.body.resumeUrl) {
      resumeUrl = req.body.resumeUrl;
    } else {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const application = await JobApplication.create({
      jobId,
      name,
      email,
      mobile,
      resumeUrl,
      whyShouldWeHire: whyShouldWeHire || '',
    });

    res.status(201).json({ data: application, message: 'Application submitted successfully' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/careers/applications/:id/status  (Admin)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json({ data: application });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/careers/applications/:id  (Admin)
exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await JobApplication.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    next(err);
  }
};