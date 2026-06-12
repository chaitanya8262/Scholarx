// ========================================
// AI Utils - mock implementations for plagiarism check,
// summary generation, and reviewer recommendation.
// In production, swap these for real API calls (e.g. Copyleaks, OpenAI).
// ========================================

// Mock plagiarism score: deterministic pseudo-random based on title hash
// Returns a number between 0-100 (lower = more original)
exports.checkPlagiarism = (text) => {
  if (!text) return 0;
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  // Map hash to 0-40 range so most papers appear relatively original
  const score = Math.abs(hash) % 41;
  return score;
};

// Mock auto-summary: take first 2 sentences + last sentence of abstract
exports.generateSummary = (abstract) => {
  if (!abstract) return '';
  const sentences = abstract.match(/[^.!?]+[.!?]+/g) || [abstract];
  if (sentences.length <= 2) return abstract.trim();
  const summary = sentences.slice(0, 2).join(' ').trim() +
    ' ' + sentences[sentences.length - 1].trim();
  return summary;
};

// Recommend reviewers: match paper keywords against reviewer expertise arrays
// Returns reviewers sorted by number of matching keywords (desc)
exports.recommendReviewers = (paper, allReviewers) => {
  if (!paper.keywords || paper.keywords.length === 0) return allReviewers;

  const paperKeywords = paper.keywords.map(k => k.toLowerCase().trim());

  const scored = allReviewers.map(reviewer => {
    const expertise = (reviewer.expertise || []).map(e => e.toLowerCase().trim());
    const matchCount = paperKeywords.filter(k =>
      expertise.some(e => e.includes(k) || k.includes(e))
    ).length;
    return { reviewer, matchCount };
  });

  // Sort by best match, then return reviewers in order
  scored.sort((a, b) => b.matchCount - a.matchCount);
  return scored.map(s => ({
    ...s.reviewer.toObject(),
    matchScore: s.matchCount
  }));
};
