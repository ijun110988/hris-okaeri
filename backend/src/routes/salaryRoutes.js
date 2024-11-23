const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const salaryController = require('../controllers/salaryController');

// Create new salary record (requires authentication)
router.post('/', authenticateToken, salaryController.create);

// Get all salaries with optional filtering
router.get('/', authenticateToken, salaryController.getAll);

// Get salary by ID
router.get('/:id', authenticateToken, salaryController.getById);

// Update salary
router.put('/:id', authenticateToken, salaryController.update);

// Delete salary
router.delete('/:id', authenticateToken, salaryController.delete);

module.exports = router;
