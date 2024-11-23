const express = require('express');
const router = express.Router();
const { resetPassword } = require('../controllers/passwordController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Route for password reset (requires authentication)
router.post('/reset', authenticateToken, resetPassword);

module.exports = router;
