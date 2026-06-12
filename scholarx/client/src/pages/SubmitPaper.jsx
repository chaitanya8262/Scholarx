// Submit paper page with PDF upload
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Upload, FileText, X, Sparkles } from 'lucide-react';
import api from '../utils/api';

export default function SubmitPaper() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', abstract: '', keywords: '', coAuthors: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error('File must be under 20MB');
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please upload a PDF file'); return; }
    setLoading(true);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', form.title);
    fd.append('abstract', form.abstract);
    fd.append('keywords', form.keywords);
    fd.append('coAuthors', form.coAuthors);

    try {
      await api.post('/papers/submit', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Paper submitted successfully!');
      navigate('/my-papers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Submit a New Paper</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Share your research with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Paper Title *</label>
          <input required className="input" placeholder="A Novel Approach to..."
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <label className="label">Abstract *</label>
          <textarea required rows={6} className="input resize-none"
            placeholder="Summarize your research, methodology, findings..."
            value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} />
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI will auto-generate a summary after submission
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Keywords (comma-separated)</label>
            <input className="input" placeholder="machine learning, NLP"
              value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
          </div>
          <div>
            <label className="label">Co-Authors (comma-separated)</label>
            <input className="input" placeholder="John Doe, Jane Smith"
              value={form.coAuthors} onChange={(e) => setForm({ ...form, coAuthors: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Paper PDF *</label>
          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                dragOver
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium mb-1">Drag & drop your PDF here</p>
              <p className="text-xs text-gray-500 mb-3">or</p>
              <label className="btn-secondary cursor-pointer inline-flex">
                Browse Files
                <input type="file" accept="application/pdf" className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])} />
              </label>
              <p className="text-xs text-gray-500 mt-3">Max 20MB · PDF only</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <FileText className="w-10 h-10 text-brand-600" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{file.name}</div>
                <div className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button type="button" onClick={() => setFile(null)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button type="button" onClick={() => navigate('/my-papers')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Submitting...' : 'Submit Paper'}
          </button>
        </div>
      </form>
    </div>
  );
}
