const express = require('express');
const router = express.Router();
const { myApplications } = require('../controllers/jobsController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Solo estudiantes pueden ver sus postulaciones
router.get('/mine', verifyToken, requireRole('student'), myApplications);

module.exports = router;