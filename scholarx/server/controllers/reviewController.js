// ========================================
// Review Controller - reviewer actions
// ========================================
const Review = require('../models/Review');
const Paper = require('../models/Paper');

// @desc  Get papers assigned to logged-in reviewer
// @route GET /api/reviews/assigned
exports.getAssignedPapers = async (req, res) => {
  try {
    const papers = await Paper.find({ reviewers: req.user._id })
      .populate('authorId', 'name email affiliation')
      .sort({ createdAt: -1 });

    // Attach any existing review by this reviewer for each paper
    const papersWithReviewStatus = await Promise.all(papers.map(async (p) => {
      const existing = await Review.findOne({
        paperId: p._id,
        reviewerId: req.user._id
      });
      return { ...p.toObject(), myReview: existing };
    }));

    res.json({ success: true, count: papers.length, papers: papersWithReviewStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Submit review for a paper
// @route POST /api/reviews/submit
exports.submitReview = async (req, res) => {
  try {
    const { paperId, comments, decision, rating } = req.body;

    if (!paperId || !comments || !decision) {
      return res.status(400).json({
        success: false,
        message: 'paperId, comments and decision are required'
      });
    }

    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found' });
    }

    // Ensure reviewer is assigned to this paper
    if (!paper.reviewers.some(r => r.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this paper' });
    }

    // Prevent duplicate review by same reviewer; update instead
    let review = await Review.findOne({ paperId, reviewerId: req.user._id });
    if (review) {
      review.comments = comments;
      review.decision = decision;
      review.rating = rating || review.rating;
      review.reviewDate = Date.now();
      await review.save();
    } else {
      review = await Review.create({
        paperId,
        reviewerId: req.user._id,
        comments,
        decision,
        rating: rating || 5
      });
    }

    // Update paper status based on decision (editor can override later)
    // Only flip status if paper was 'under_review'
    if (paper.status === 'under_review' || paper.status === 'submitted') {
      if (decision === 'revise') paper.status = 'revision_requested';
      // For accept/reject we leave final call to editor but mark it so editor sees progress
    }
    await paper.save();

    res.json({ success: true, message: 'Review submitted', review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all reviews for a paper (author or editor can see)
// @route GET /api/reviews/paper/:paperId
exports.getReviewsForPaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.paperId);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found' });
    }

    // Access: author, editor, or assigned reviewer
    const userId = req.user._id.toString();
    const isAuthor = paper.authorId.toString() === userId;
    const isReviewer = paper.reviewers.some(r => r.toString() === userId);
    const isEditor = req.user.role === 'editor';
    if (!isAuthor && !isReviewer && !isEditor) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const reviews = await Review.find({ paperId: req.params.paperId })
      .populate('reviewerId', 'name email expertise')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
