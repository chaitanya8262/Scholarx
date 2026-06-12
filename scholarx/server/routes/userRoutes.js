// ========================================
// User Routes
// ========================================
const express = require('express');
const router = express.Router();
const { getReviewers, updateProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Editor can list all reviewers for assignment
router.get('/reviewers', protect, authorize('editor'), getReviewers);

// Any user can update own profile
router.put('/profile', protect, updateProfile);

module.exports = router;
