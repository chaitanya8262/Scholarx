// ========================================
// Review Model - reviewer feedback on papers
// ========================================
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  paperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paper',
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: {
    type: String,
    required: [true, 'Comments are required']
  },
  // Rating out of 10 for paper quality
  rating: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  decision: {
    type: String,
    enum: ['accept', 'reject', 'revise'],
    required: true
  },
  reviewDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
