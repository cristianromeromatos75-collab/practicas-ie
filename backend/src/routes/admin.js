const express = require('express');
const router = express.Router();
const {
  listPendingJobs,
  approveJob,
  rejectJob,
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Todas las rutas requieren ser admin
router.use(verifyToken, requireRole('admin'));

router.get('/pending-jobs', listPendingJobs);
router.patch('/jobs/:id/approve', approveJob);
router.patch('/jobs/:id/reject', rejectJob);

module.exports = router;