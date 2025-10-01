const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload');

// Public routes (optional auth for browsing)
router.get('/jobs', optionalAuth, careerController.getJobs);
router.get('/jobs/:jobId', optionalAuth, careerController.getJob);

// Protected routes
router.put('/user-type', authenticateToken, careerController.updateUserType);

// Job posting (company only)
router.post('/jobs', authenticateToken, careerController.createJob);
router.put('/jobs/:jobId', authenticateToken, careerController.updateJob);

// Job applications (individual only)
router.post('/jobs/:jobId/apply', authenticateToken, uploadDocument.single('resume'), careerController.applyForJob);
router.get('/applications', authenticateToken, careerController.getUserApplications);

// Saved jobs (individual only)
router.post('/jobs/:jobId/save', authenticateToken, careerController.toggleSavedJob);
router.get('/saved-jobs', authenticateToken, careerController.getSavedJobs);

// Company management (company only)
router.get('/company/jobs', authenticateToken, careerController.getCompanyJobs);
router.get('/company/applications', authenticateToken, careerController.getCompanyApplications);
router.get('/company/analytics', authenticateToken, careerController.getCompanyAnalytics);
router.put('/jobs/:jobId/status', authenticateToken, careerController.updateJobStatus);
router.put('/applications/:applicationId/status', authenticateToken, careerController.updateApplicationStatus);

module.exports = router;
