// ========================================
// Editor Controller - editorial workflow actions
// ========================================
const Paper = require('../models/Paper');
const User = require('../models/User');
const Review = require('../models/Review');
const { recommendReviewers } = require('../utils/aiUtils');
const { sendEmail } = require('../utils/emailUtils');

// @desc  Assign reviewer(s) to a paper
// @route POST /api/editor/assign-reviewer
exports.assignReviewer = async (req, res) => {
  try {
    const { paperId, reviewerIds } = req.body;

    if (!paperId || !Array.isArray(reviewerIds) || reviewerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'paperId and reviewerIds array required'
      });
    }

    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found' });
    }

    // Verify each reviewerId belongs to an actual reviewer user
    const reviewers = await User.find({ _id: { $in: reviewerIds }, role: 'reviewer' });
    if (reviewers.length !== reviewerIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some provided IDs are not valid reviewers'
      });
    }

    // Merge (avoid duplicates)
    const existingIds = paper.reviewers.map(r => r.toString());
    const toAdd = reviewerIds.filter(id => !existingIds.includes(id));
    paper.reviewers.push(...toAdd);
    paper.status = 'under_review';
    await paper.save();

    // Send notification email (if configured)
    for (const reviewer of reviewers) {
      sendEmail({
        to: reviewer.email,
        subject: `[ScholarX] New paper assigned for review: ${paper.title}`,
        html: `<p>Hi ${reviewer.name},</p>
               <p>You have been assigned to review the paper: <strong>${paper.title}</strong></p>
               <p>Please log in to ScholarX to review it.</p>`,
        text: `Hi ${reviewer.name}, you have been assigned to review: ${paper.title}`
      }).catch(() => {}); // fire and forget
    }

    const updatedPaper = await Paper.findById(paperId)
      .populate('authorId', 'name email')
      .populate('reviewers', 'name email expertise');

    res.json({
      success: true,
      message: `${toAdd.length} reviewer(s) assigned`,
      paper: updatedPaper
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get recommended reviewers for a paper (by keyword-expertise matching)
// @route GET /api/editor/recommend-reviewers/:paperId
exports.recommendReviewersForPaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.paperId);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found' });
    }

    const allReviewers = await User.find({ role: 'reviewer' }).select('-password');
    const recommended = recommendReviewers(paper, allReviewers);
    res.json({ success: true, count: recommended.length, reviewers: recommended });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Approve a paper (editor final decision)
// @route POST /api/editor/approve/:paperId
exports.approvePaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.paperId);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found' });
    }
    paper.status = 'accepted';
    await paper.save();

    // Notify author
    const author = await User.findById(paper.authorId);
    if (author) {
      sendEmail({
        to: author.email,
        subject: `[ScholarX] Your paper has been accepted`,
        html: `<p>Dear ${author.name},</p>
               <p>Great news! Your paper <strong>${paper.title}</strong> has been accepted.</p>`,
        text: `Your paper "${paper.title}" has been accepted.`
      }).catch(() => {});
    }

    res.json({ success: true, message: 'Paper accepted', paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Reject a paper
// @route POST /api/editor/reject/:paperId
exports.rejectPaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.paperId);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found' });
    }
    paper.status = 'rejected';
    await paper.save();

    const author = await User.findById(paper.authorId);
    if (author) {
      sendEmail({
        to: author.email,
        subject: `[ScholarX] Decision on your paper`,
        html: `<p>Dear ${author.name},</p>
               <p>After careful review, your paper <strong>${paper.title}</strong> has been rejected. Please review comments in your dashboard.</p>`,
        text: `Your paper "${paper.title}" has been rejected.`
      }).catch(() => {});
    }

    res.json({ success: true, message: 'Paper rejected', paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Request revision from researcher
// @route POST /api/editor/request-revision/:paperId
exports.requestRevision = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.paperId);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found' });
    }
    paper.status = 'revision_requested';
    await paper.save();
    res.json({ success: true, message: 'Revision requested from author', paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Publish an accepted paper
// @route POST /api/editor/publish/:paperId
exports.publishPaper = async (req, res) => {
  try {
    const { journalName, doi } = req.body;
    const paper = await Paper.findById(req.params.paperId);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found' });
    }

    if (paper.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only accepted papers can be published'
      });
    }

    paper.status = 'published';
    paper.publicationDate = new Date();
    paper.journalName = journalName || 'ScholarX Journal';
    // Generate a mock DOI if not provided
    paper.doi = doi || `10.9999/scholarx.${paper._id.toString().slice(-8)}`;
    await paper.save();

    const author = await User.findById(paper.authorId);
    if (author) {
      sendEmail({
        to: author.email,
        subject: `[ScholarX] Your paper is published!`,
        html: `<p>Congratulations ${author.name}!</p>
               <p>Your paper <strong>${paper.title}</strong> is now published.</p>
               <p>DOI: ${paper.doi}</p>`,
        text: `Your paper "${paper.title}" has been published. DOI: ${paper.doi}`
      }).catch(() => {});
    }

    res.json({ success: true, message: 'Paper published', paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get editor dashboard stats
// @route GET /api/editor/stats
exports.getEditorStats = async (req, res) => {
  try {
    const [total, submitted, underReview, accepted, rejected, published, revisionRequested] =
      await Promise.all([
        Paper.countDocuments(),
        Paper.countDocuments({ status: 'submitted' }),
        Paper.countDocuments({ status: 'under_review' }),
        Paper.countDocuments({ status: 'accepted' }),
        Paper.countDocuments({ status: 'rejected' }),
        Paper.countDocuments({ status: 'published' }),
        Paper.countDocuments({ status: 'revision_requested' })
      ]);

    res.json({
      success: true,
      stats: { total, submitted, underReview, accepted, rejected, published, revisionRequested }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
