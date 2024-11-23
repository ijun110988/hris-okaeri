const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Debug middleware
router.use((req, res, next) => {
    console.log('Attendance Route:', {
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query,
        body: req.body
    });
    next();
});

// Test route
router.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Attendance routes are working' });
});

// Protected routes (require authentication)
// Allow both GET and POST for QR code generation
router.route('/qr/:branchId')
    .get(authenticateToken, attendanceController.generateQR)
    .post(authenticateToken, attendanceController.generateQR);

router.post('/scan', authenticateToken, attendanceController.scanQR);
router.post('/check-in', authenticateToken, attendanceController.checkIn);
router.post('/check-out', authenticateToken, attendanceController.checkOut);

module.exports = router;
