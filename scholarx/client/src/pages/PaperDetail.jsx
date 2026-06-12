// Paper Detail - PDF preview + reviews + actions
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Upload, FileText, User as UserIcon, Calendar, Tag, Sparkles, AlertTriangle, Star } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/PaperCard';

export default function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paper, setPaper] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviseFile, setReviseFile] = useState(null);
  const [revising, setRevising] = useState(false);

  // Review form (for reviewers)
  const [reviewForm, setReviewForm] = useState({ comments: '', decision: 'accept', rating: 7 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const [paperRes, reviewsRes] = await Promise.all([
        api.get(`/papers/${id}`),
        api.get(`/reviews/paper/${id}`).catch(() => ({ data: { reviews: [] } }))
      ]);
      setPaper(paperRes.data.paper);
      setReviews(reviewsRes.data.reviews || []);

      // Pre-fill review form if reviewer already reviewed
      if (user.role === 'reviewer') {
        const existing = reviewsRes.data.reviews?.find(r => r.reviewerId?._id === user.id);
        if (existing) {
          setReviewForm({ comments: existing.comments, decision: existing.decision, rating: existing.rating });
        }
      }
    } catch (err) {
      toast.error('Failed to load paper');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reviews/submit', { ...reviewForm, paperId: id });
      toast.success('Review submitted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadRevision = async () => {
    if (!reviseFile) return toast.error('Select a PDF');
    setRevising(true);
    const fd = new FormData();
    fd.append('file', reviseFile);
    try {
      await api.post(`/papers/${id}/revise`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Revision uploaded');
      setReviseFile(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setRevising(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!paper) return null;

  const isAuthor = paper.authorId?._id === user.id;
  const isReviewer = user.role === 'reviewer' && paper.reviewers?.some(r => r._id === user.id);
  const canReview = isReviewer;
  const canRevise = isAuthor && paper.status === 'revision_requested';
  // In dev, Vite proxies /uploads to backend. Ensure full URL for new tab preview.
  const pdfUrl = paper.fileUrl;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold flex-1">{paper.title}</h1>
          <StatusBadge status={paper.status} />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <UserIcon className="w-4 h-4" />
            {paper.authorId?.name}
            {paper.authorId?.affiliation && <span className="text-gray-400">· {paper.authorId.affiliation}</span>}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(paper.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-4 h-4" /> Version {paper.version}
          </span>
        </div>

        {paper.coAuthors?.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            <strong>Co-authors:</strong> {paper.coAuthors.join(', ')}
          </div>
        )}

        {paper.keywords?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {paper.keywords.map((kw, i) => (
              <span key={i} className="badge bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Tag className="w-3 h-3 mr-1" /> {kw}
              </span>
            ))}
          </div>
        )}

        <h3 className="font-semibold mb-2">Abstract</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{paper.abstract}</p>

        {paper.aiSummary && (
          <div className="mt-4 p-4 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
            <div className="flex items-center gap-2 mb-2 text-brand-700 dark:text-brand-300">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold text-sm">AI Summary</span>
            </div>
            <p className="text-sm text-brand-800 dark:text-brand-200">{paper.aiSummary}</p>
          </div>
        )}

        {paper.plagiarismScore !== null && paper.plagiarismScore !== undefined && (
          <div className={`mt-3 p-3 rounded-lg border flex items-center gap-2 text-sm ${
            paper.plagiarismScore < 15
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : paper.plagiarismScore < 30
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}>
            <AlertTriangle className="w-4 h-4" />
            <span><strong>Plagiarism Score:</strong> {paper.plagiarismScore}% — {paper.plagiarismScore < 15 ? 'Highly Original' : paper.plagiarismScore < 30 ? 'Acceptable' : 'Requires review'}</span>
          </div>
        )}

        {paper.status === 'published' && (
          <div className="mt-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <div className="font-semibold text-purple-800 dark:text-purple-300 mb-1">📚 Published</div>
            <div className="text-sm text-purple-700 dark:text-purple-400">
              {paper.journalName} · DOI: {paper.doi}
              {paper.publicationDate && ` · ${new Date(paper.publicationDate).toLocaleDateString()}`}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-5 pt-5 border-t border-gray-200 dark:border-gray-800">
          <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn-primary">
            <FileText className="w-4 h-4" /> Preview PDF
          </a>
          <a href={pdfUrl} download className="btn-secondary">
            <Download className="w-4 h-4" /> Download
          </a>
        </div>
      </div>

      {/* Version history */}
      {paper.versions?.length > 1 && (
        <div className="card p-6">
          <h3 className="font-semibold mb-3">Version History</h3>
          <div className="space-y-2">
            {paper.versions.slice().reverse().map(v => (
              <div key={v.versionNumber} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <div className="font-medium text-sm">Version {v.versionNumber}</div>
                  <div className="text-xs text-gray-500">{new Date(v.uploadedAt).toLocaleString()}</div>
                </div>
                <a href={v.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revision upload (author only, revision_requested) */}
      {canRevise && (
        <div className="card p-6 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
          <h3 className="font-semibold mb-2 text-orange-700 dark:text-orange-300">Upload Revised Version</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Reviewers have requested changes. Upload your revised PDF below.
          </p>
          <div className="flex gap-3 items-center">
            <input type="file" accept="application/pdf"
              onChange={(e) => setReviseFile(e.target.files[0])}
              className="text-sm flex-1" />
            <button onClick={uploadRevision} disabled={!reviseFile || revising} className="btn-primary">
              <Upload className="w-4 h-4" /> {revising ? 'Uploading...' : 'Upload Revision'}
            </button>
          </div>
        </div>
      )}

      {/* Review form (reviewers only) */}
      {canReview && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Submit Your Review</h3>
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="label">Comments *</label>
              <textarea required rows={5} className="input resize-none"
                placeholder="Provide constructive feedback..."
                value={reviewForm.comments}
                onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'accept', label: 'Accept', cls: 'emerald' },
                    { v: 'revise', label: 'Revise', cls: 'amber' },
                    { v: 'reject', label: 'Reject', cls: 'red' }
                  ].map(d => (
                    <button key={d.v} type="button"
                      onClick={() => setReviewForm({ ...reviewForm, decision: d.v })}
                      className={`py-2 text-sm rounded-lg border transition-all ${
                        reviewForm.decision === d.v
                          ? `border-${d.cls}-500 bg-${d.cls}-50 text-${d.cls}-700 dark:bg-${d.cls}-900/30 dark:text-${d.cls}-300`
                          : 'border-gray-300 dark:border-gray-700'
                      }`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Rating (1-10): {reviewForm.rating}</label>
                <input type="range" min={1} max={10} value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: +e.target.value })}
                  className="w-full accent-brand-600" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Reviews ({reviews.length})</h3>
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r._id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-sm font-semibold">
                      {r.reviewerId?.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{r.reviewerId?.name}</div>
                      <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm text-amber-600">
                      <Star className="w-4 h-4 fill-current" /> {r.rating}/10
                    </span>
                    <span className={`badge ${
                      r.decision === 'accept' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      r.decision === 'reject' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    } capitalize`}>
                      {r.decision}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{r.comments}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
