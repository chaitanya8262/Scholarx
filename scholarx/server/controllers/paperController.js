// ========================================
// Paper Controller - submit, get, update papers
// ========================================
const Paper = require('../models/Paper');
const User = require('../models/User');
const { checkPlagiarism, generateSummary } = require('../utils/aiUtils');

// @desc  Researcher submits a new paper (with PDF file)
// @route POST /api/papers/submit
exports.submitPaper = async (req, res) => {
  try {
    const { title, abstract, keywords, coAuthors } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF file is required' });
    }
    if (!title || !abstract) {
      return res.status(400).json({ success: false, message: 'Title and abstract are required' });
    }

    // Parse keywords and coAuthors from comma-separated strings if needed
    const keywordsArray = Array.isArray(keywords)
      ? keywords
      : (keywords || '').split(',').map(k => k.trim()).filter(Boolean);
    const coAuthorsArray = Array.isArray(coAuthors)
      ? coAuthors
      : (coAuthors || '').split(',').map(c => c.trim()).filter(Boolean);

    // Build file URL (served via /uploads static route)
    const fileUrl = `/uploads/${req.file.filename}`;

    // Generate AI features (mock implementations)
    const plagiarismScore = checkPlagiarism(title + abstract);
    const aiSummary = generateSummary(abstract);

    const paper = await Paper.create({
      title,
      abstract,
      keywords: keywordsArray,
      coAuthors: coAuthorsArray,
      authorId: req.user._id,
      fileUrl,
      fileName: req.file.originalname,
      versions: [{
        versionNumber: 1,
        fileUrl,
        fileName: req.file.originalname
      }],
      plagiarismScore,
      aiSummary
    });

    res.status(201).json({
      success: true,
      message: 'Paper submitted successfully',
      paper
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get papers submitted by logged-in researcher
// @route GET /api/papers/my-papers
exports.getMyPapers = async (req, res) => {
  try {
    const papers = await Paper.find({ authorId: req.user._id })
      .populate('reviewers', 'name email expertise')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: papers.length, papers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all papers (editor only) or search
// @route GET /api/papers/all-papers
exports.getAllPapers = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status) query.status = status;

    // Text search across title, abstract, keywords using index
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } }
      ];
    }

    const papers = await Paper.find(query)
      .populate('authorId', 'name email affiliation')
      .populate('reviewers', 'name email expertise')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: papers.length, papers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single paper by ID (authorized: author, assigned reviewer, or editor)
// @route GET /api/papers/:id
exports.getPaperById = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id)
      .populate('authorId', 'name email affiliation')
      .populate('reviewers', 'name email expertise');

    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found' });
    }

    // Access check
    const userId = req.user._id.toString();
    const isAuthor = paper.authorId._id.toString() === userId;
    const isReviewer = paper.reviewers.some(r => r._id.toString() === userId);
    const isEditor = req.user.role === 'editor';

    if (!isAuthor && !isReviewer && !isEditor) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Upload a revised version (researcher only, must own paper)
// @route POST /api/papers/:id/revise
exports.reviseSubmission = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found' });
    }
    if (paper.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not the paper owner' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'New PDF file is required' });
    }

    // Add new version entry, update current file, bump version counter
    const newVersionNumber = paper.version + 1;
    const fileUrl = `/uploads/${req.file.filename}`;

    paper.versions.push({
      versionNumber: newVersionNumber,
      fileUrl,
      fileName: req.file.originalname
    });
    paper.version = newVersionNumber;
    paper.fileUrl = fileUrl;
    paper.fileName = req.file.originalname;
    paper.status = 'under_review'; // back to review after revision

    await paper.save();

    res.json({
      success: true,
      message: `Revision v${newVersionNumber} uploaded successfully`,
      paper
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Public search for published papers (no auth needed; but we keep protected for now)
// @route GET /api/papers/search?q=...
exports.searchPapers = async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q) {
      return res.json({ success: true, count: 0, papers: [] });
    }

    const papers = await Paper.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { abstract: { $regex: q, $options: 'i' } },
        { keywords: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('authorId', 'name email affiliation')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: papers.length, papers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
