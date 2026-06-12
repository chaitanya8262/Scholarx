// Review Panel - reviewer's assigned papers
import { useEffect, useState } from 'react';
import { ClipboardCheck, Clock } from 'lucide-react';
import api from '../utils/api';
import PaperCard from '../components/PaperCard';

export default function ReviewPanel() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await api.get('/reviews/assigned');
      setPapers(res.data.papers);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const pending = papers.filter(p => !p.myReview);
  const completed = papers.filter(p => p.myReview);
  const list = tab === 'pending' ? pending : completed;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Review Panel</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Papers assigned to you for review</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === 'pending' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}>
          <Clock className="w-4 h-4" /> Pending ({pending.length})
        </button>
        <button onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === 'completed' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}>
          <ClipboardCheck className="w-4 h-4" /> Completed ({completed.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
        </div>
      ) : list.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardCheck className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {tab === 'pending' ? 'No pending reviews' : 'No completed reviews yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(p => <PaperCard key={p._id} paper={p} showAuthor />)}
        </div>
      )}
    </div>
  );
}
