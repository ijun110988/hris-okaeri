const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getUserDetail);
router.post('/reset-password', authController.resetPassword);
router.post('/reset-password/:id', authController.resetPasswordById);
router.post('/register', authController.register);
router.put('/password', authMiddleware, authController.changePassword);

module.exports = router;
