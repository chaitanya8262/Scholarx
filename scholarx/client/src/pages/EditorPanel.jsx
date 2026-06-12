// Editor Panel - all submissions + actions
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, UserPlus, Check, X as XIcon, BookOpen, RefreshCw, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { StatusBadge } from '../components/PaperCard';
import { Link } from 'react-router-dom';

export default function EditorPanel() {
  const [papers, setPapers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Reviewer assignment modal state
  const [assignModal, setAssignModal] = useState(null); // paper being assigned
  const [reviewers, setReviewers] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [selected, setSelected] = useState([]);

  // Publish modal state
  const [publishModal, setPublishModal] = useState(null);
  const [journalName, setJournalName] = useState('ScholarX Journal');
  const [doi, setDoi] = useState('');

  useEffect(() => { load(); }, [statusFilter, search]);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get('/papers/all-papers', { params });
      setPapers(res.data.papers);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAssignModal = async (paper) => {
    setAssignModal(paper);
    setSelected(paper.reviewers?.map(r => r._id) || []);
    try {
      const [all, rec] = await Promise.all([
        api.get('/users/reviewers'),
        api.get(`/editor/recommend-reviewers/${paper._id}`)
      ]);
      setReviewers(all.data.reviewers);
      setRecommended(rec.data.reviewers);
    } catch (err) { console.error(err); }
  };

  const assignReviewers = async () => {
    if (selected.length === 0) return toast.error('Select at least one reviewer');
    try {
      await api.post('/editor/assign-reviewer', {
        paperId: assignModal._id,
        reviewerIds: selected
      });
      toast.success('Reviewers assigned');
      setAssignModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const doAction = async (paper, action) => {
    try {
      await api.post(`/editor/${action}/${paper._id}`);
      toast.success(`Paper ${action === 'approve' ? 'accepted' : action === 'reject' ? 'rejected' : 'updated'}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const publish = async () => {
    try {
      await api.post(`/editor/publish/${publishModal._id}`, { journalName, doi });
      toast.success('Paper published!');
      setPublishModal(null);
      setJournalName('ScholarX Journal');
      setDoi('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Editor Panel</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all submissions and editorial workflow</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-10" placeholder="Search by title, keywords, author..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input max-w-[200px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="revision_requested">Revision Requested</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="published">Published</option>
        </select>
        <button onClick={load} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Papers table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
        </div>
      ) : papers.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">No papers found</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Paper</th>
                  <th className="text-left px-4 py-3 font-semibold">Author</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Reviewers</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers.map(p => (
                  <tr key={p._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <Link to={`/paper/${p._id}`} className="font-medium hover:text-brand-600">{p.title}</Link>
                      <div className="text-xs text-gray-500 mt-0.5">v{p.version} · {new Date(p.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.authorId?.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {p.reviewers?.length || 0} assigned
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end flex-wrap">
                        <button onClick={() => openAssignModal(p)}
                          className="p-1.5 rounded hover:bg-brand-100 dark:hover:bg-brand-900/30 text-brand-600" title="Assign reviewers">
                          <UserPlus className="w-4 h-4" />
                        </button>
                        {p.status !== 'accepted' && p.status !== 'published' && p.status !== 'rejected' && (
                          <button onClick={() => doAction(p, 'approve')}
                            className="p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600" title="Accept">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {p.status !== 'rejected' && p.status !== 'published' && (
                          <button onClick={() => doAction(p, 'reject')}
                            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title="Reject">
                            <XIcon className="w-4 h-4" />
                          </button>
                        )}
                        {p.status === 'accepted' && (
                          <button onClick={() => setPublishModal(p)}
                            className="p-1.5 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600" title="Publish">
                            <BookOpen className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setAssignModal(null)}>
          <div className="card max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-lg">Assign Reviewers</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{assignModal.title}</p>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {recommended.length > 0 && (
                <div>
                  <div className="text-sm font-semibold mb-2 flex items-center gap-1 text-brand-600">
                    <Sparkles className="w-4 h-4" /> AI Recommended
                  </div>
                  <div className="space-y-2">
                    {recommended.filter(r => r.matchScore > 0).slice(0, 3).map(r => (
                      <label key={r._id}
                        className="flex items-center gap-3 p-3 rounded-lg border-2 border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 cursor-pointer hover:bg-brand-100 dark:hover:bg-brand-900/40">
                        <input type="checkbox" checked={selected.includes(r._id)}
                          onChange={(e) => setSelected(e.target.checked ? [...selected, r._id] : selected.filter(id => id !== r._id))}
                          className="accent-brand-600 w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{r.name}</div>
                          <div className="text-xs text-gray-500">{r.email} · {r.expertise?.join(', ')}</div>
                        </div>
                        <span className="badge bg-brand-200 text-brand-800 dark:bg-brand-800 dark:text-brand-100">
                          {r.matchScore} match{r.matchScore > 1 ? 'es' : ''}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm font-semibold mb-2">All Reviewers</div>
                <div className="space-y-2">
                  {reviewers.map(r => (
                    <label key={r._id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input type="checkbox" checked={selected.includes(r._id)}
                        onChange={(e) => setSelected(e.target.checked ? [...selected, r._id] : selected.filter(id => id !== r._id))}
                        className="accent-brand-600 w-4 h-4" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{r.name}</div>
                        <div className="text-xs text-gray-500">{r.email} · {r.expertise?.join(', ') || 'No expertise listed'}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex gap-2 justify-end">
              <button onClick={() => setAssignModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={assignReviewers} className="btn-primary">Assign ({selected.length})</button>
            </div>
          </div>
        </div>
      )}

      {/* Publish modal */}
      {publishModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPublishModal(null)}>
          <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-lg">Publish Paper</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Journal Name</label>
                <input className="input" value={journalName} onChange={(e) => setJournalName(e.target.value)} />
              </div>
              <div>
                <label className="label">DOI (optional - auto-generated if empty)</label>
                <input className="input" placeholder="10.xxxx/yyyy" value={doi} onChange={(e) => setDoi(e.target.value)} />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex gap-2 justify-end">
              <button onClick={() => setPublishModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={publish} className="btn-primary">
                <BookOpen className="w-4 h-4" /> Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
