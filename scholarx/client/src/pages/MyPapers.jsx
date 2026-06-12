// My Papers - researcher's papers list
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import api from '../utils/api';
import PaperCard from '../components/PaperCard';

export default function MyPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await api.get('/papers/my-papers');
      setPapers(res.data.papers);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? papers : papers.filter(p => p.status === filter);

  const statusOptions = [
    { v: 'all', label: 'All' },
    { v: 'submitted', label: 'Submitted' },
    { v: 'under_review', label: 'Under Review' },
    { v: 'revision_requested', label: 'Revision' },
    { v: 'accepted', label: 'Accepted' },
    { v: 'published', label: 'Published' },
    { v: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Papers</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{papers.length} total submissions</p>
        </div>
        <Link to="/submit" className="btn-primary">
          <Plus className="w-4 h-4" /> Submit New
        </Link>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map(s => (
          <button key={s.v} onClick={() => setFilter(s.v)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s.v
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No papers in this category</p>
          <Link to="/submit" className="btn-primary inline-flex">
            <Plus className="w-4 h-4" /> Submit Your First Paper
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => <PaperCard key={p._id} paper={p} />)}
        </div>
      )}
    </div>
  );
}
