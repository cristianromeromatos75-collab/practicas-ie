const express = require('express');
const router = express.Router();
const { register, login, profile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Ruta protegida (requiere token)
router.get('/profile', verifyToken, profile);

module.exports = router;