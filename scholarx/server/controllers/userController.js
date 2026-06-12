// ========================================
// User Controller - user listing & profile
// ========================================
const User = require('../models/User');

// @desc  Get all reviewers (for editor to assign)
// @route GET /api/users/reviewers
exports.getReviewers = async (req, res) => {
  try {
    const reviewers = await User.find({ role: 'reviewer' }).select('-password');
    res.json({ success: true, count: reviewers.length, reviewers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update own profile
// @route PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, affiliation, bio, expertise } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (affiliation !== undefined) user.affiliation = affiliation;
    if (bio !== undefined) user.bio = bio;
    if (Array.isArray(expertise)) user.expertise = expertise;

    await user.save();
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
