// ========================================
// Paper Routes
// ========================================
const express = require('express');
const router = express.Router();
const {
  submitPaper,
  getMyPapers,
  getAllPapers,
  getPaperById,
  reviseSubmission,
  searchPapers
} = require('../controllers/paperController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Researcher submits a new paper (multipart/form-data with 'file' field)
router.post('/submit', protect, authorize('researcher'), upload.single('file'), submitPaper);

// Researcher lists their own papers
router.get('/my-papers', protect, authorize('researcher'), getMyPapers);

// Editor lists all papers (supports ?search= and ?status= filters)
router.get('/all-papers', protect, authorize('editor'), getAllPapers);

// Anyone authenticated can search
router.get('/search', protect, searchPapers);

// Get single paper (author/reviewer/editor only)
router.get('/:id', protect, getPaperById);

// Upload revised version
router.post('/:id/revise', protect, authorize('researcher'), upload.single('file'), reviseSubmission);

module.exports = router;
