// ========================================
// Editor Routes
// ========================================
const express = require('express');
const router = express.Router();
const {
  assignReviewer,
  recommendReviewersForPaper,
  approvePaper,
  rejectPaper,
  requestRevision,
  publishPaper,
  getEditorStats
} = require('../controllers/editorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All editor routes require editor role
router.use(protect, authorize('editor'));

router.post('/assign-reviewer', assignReviewer);
router.get('/recommend-reviewers/:paperId', recommendReviewersForPaper);
router.post('/approve/:paperId', approvePaper);
router.post('/reject/:paperId', rejectPaper);
router.post('/request-revision/:paperId', requestRevision);
router.post('/publish/:paperId', publishPaper);
router.get('/stats', getEditorStats);

module.exports = router;
