const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  createBenefit,
  getAllBenefits,
  getBenefitById,
  updateBenefit,
  deleteBenefit
} = require('../controllers/benefitController');

// Create new benefit (requires authentication)
router.post('/', authenticateToken, createBenefit);

// Get all benefits
router.get('/', authenticateToken, getAllBenefits);

// Get benefit by ID
router.get('/:id', authenticateToken, getBenefitById);

// Update benefit
router.put('/:id', authenticateToken, updateBenefit);

// Delete benefit
router.delete('/:id', authenticateToken, deleteBenefit);

module.exports = router;
