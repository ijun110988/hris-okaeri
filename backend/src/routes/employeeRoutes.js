const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Create employee - requires authentication
router.post('/', authenticateToken, employeeController.createEmployee);

// Get all employees
router.get('/', authenticateToken, employeeController.getAllEmployees);

// Get employee by ID
router.get('/:id', authenticateToken, employeeController.getEmployeeById);

// Update employee
router.put('/:id', authenticateToken, employeeController.updateEmployee);

// Delete employee
router.delete('/:id', authenticateToken, employeeController.deleteEmployee);

module.exports = router;
