// ========================================
// Paper Model - research submissions
// ========================================
const mongoose = require('mongoose');

// Sub-schema to track each uploaded version of the paper
const versionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const paperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  abstract: {
    type: String,
    required: [true, 'Abstract is required']
  },
  keywords: {
    type: [String],
    default: []
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coAuthors: {
    type: [String], // comma-separated names, stored as array
    default: []
  },
  // Current / latest file
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  // Track all historical versions
  versions: [versionSchema],
  version: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'revision_requested', 'accepted', 'rejected', 'published'],
    default: 'submitted'
  },
  // Assigned reviewers
  reviewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // AI-generated fields (mock or real)
  aiSummary: { type: String, default: '' },
  plagiarismScore: { type: Number, default: null }, // 0-100
  // Publication info (populated once published)
  publicationDate: { type: Date, default: null },
  journalName: { type: String, default: '' },
  doi: { type: String, default: '' }
}, { timestamps: true });

// Index for text search across title, abstract, keywords
paperSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });

module.exports = mongoose.model('Paper', paperSchema);
