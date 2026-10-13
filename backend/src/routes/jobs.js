const express = require('express');
const router = express.Router();
const {
  createJob, listJobs, getJob, myJobs,
  applyToJob, jobApplicants
} = require('../controllers/jobsController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Rutas públicas
router.get('/', listJobs);
router.get('/:id', getJob);

// Rutas protegidas (requieren login)
router.post('/', verifyToken, requireRole('company', 'mentor'), createJob);
router.get('/mine/list', verifyToken, myJobs);
router.post('/:id/apply', verifyToken, requireRole('student'), applyToJob);
router.get('/:id/applicants', verifyToken, jobApplicants);

module.exports = router;