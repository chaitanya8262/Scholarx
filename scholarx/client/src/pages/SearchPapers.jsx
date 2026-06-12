// Search papers
import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import api from '../utils/api';
import PaperCard from '../components/PaperCard';

export default function SearchPapers() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (e) => {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/papers/search', { params: { q } });
      setResults(res.data.papers);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Search Papers</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Find research by title, abstract, or keywords</p>
      </div>

      <form onSubmit={doSearch} className="card p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input autoFocus className="input pl-10" placeholder="e.g. machine learning, neural networks..."
              value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
        </div>
      ) : searched && results.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">No results for "{q}"</div>
      ) : results.length > 0 ? (
        <>
          <div className="text-sm text-gray-500">{results.length} result{results.length !== 1 ? 's' : ''}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(p => <PaperCard key={p._id} paper={p} showAuthor />)}
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <SearchIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500">Enter keywords to search</p>
        </div>
      )}
    </div>
  );
}
