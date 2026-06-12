// ========================================
// Review Routes
// ========================================
const express = require('express');
const router = express.Router();
const {
  getAssignedPapers,
  submitReview,
  getReviewsForPaper
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/assigned', protect, authorize('reviewer'), getAssignedPapers);
router.post('/submit', protect, authorize('reviewer'), submitReview);
router.get('/paper/:paperId', protect, getReviewsForPaper);

module.exports = router;
