// Dashboard - role-based stats and recent activity
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, BookOpen, TrendingUp, ArrowRight, Upload, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PaperCard from '../components/PaperCard';

// Reusable stat tile
const StatCard = ({ icon: Icon, label, value, color = 'brand' }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-2">
      <div className={`w-10 h-10 rounded-lg bg-${color}-100 dark:bg-${color}-900/40 text-${color}-600 dark:text-${color}-300 flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ papers: [], stats: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user?.role]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (user.role === 'researcher') {
        const res = await api.get('/papers/my-papers');
        setData({ papers: res.data.papers, stats: null });
      } else if (user.role === 'reviewer') {
        const res = await api.get('/reviews/assigned');
        setData({ papers: res.data.papers, stats: null });
      } else if (user.role === 'editor') {
        const [statsRes, papersRes] = await Promise.all([
          api.get('/editor/stats'),
          api.get('/papers/all-papers')
        ]);
        setData({ papers: papersRes.data.papers.slice(0, 6), stats: statsRes.data.stats });
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Researcher stats computed from papers
  const researcherStats = user?.role === 'researcher' ? {
    total: data.papers.length,
    underReview: data.papers.filter(p => p.status === 'under_review').length,
    published: data.papers.filter(p => p.status === 'published').length,
    revisions: data.papers.filter(p => p.status === 'revision_requested').length
  } : null;

  // Reviewer stats
  const reviewerStats = user?.role === 'reviewer' ? {
    assigned: data.papers.length,
    pending: data.papers.filter(p => !p.myReview).length,
    completed: data.papers.filter(p => p.myReview).length
  } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">
          {user.role} Dashboard · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Role-specific stats */}
      {user.role === 'researcher' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={FileText} label="Total Papers" value={researcherStats.total} color="blue" />
            <StatCard icon={Clock} label="Under Review" value={researcherStats.underReview} color="amber" />
            <StatCard icon={TrendingUp} label="Revisions Needed" value={researcherStats.revisions} color="orange" />
            <StatCard icon={BookOpen} label="Published" value={researcherStats.published} color="purple" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/submit" className="btn-primary">
              <Upload className="w-4 h-4" /> Submit New Paper
            </Link>
            <Link to="/my-papers" className="btn-secondary">View All Papers <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </>
      )}

      {user.role === 'reviewer' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={ClipboardList} label="Assigned" value={reviewerStats.assigned} color="blue" />
            <StatCard icon={Clock} label="Pending Reviews" value={reviewerStats.pending} color="amber" />
            <StatCard icon={CheckCircle} label="Completed" value={reviewerStats.completed} color="emerald" />
          </div>
        </>
      )}

      {user.role === 'editor' && data.stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={FileText} label="Total Submissions" value={data.stats.total} color="blue" />
            <StatCard icon={Clock} label="Under Review" value={data.stats.underReview} color="amber" />
            <StatCard icon={CheckCircle} label="Accepted" value={data.stats.accepted} color="emerald" />
            <StatCard icon={BookOpen} label="Published" value={data.stats.published} color="purple" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={TrendingUp} label="Submitted (New)" value={data.stats.submitted} color="brand" />
            <StatCard icon={Clock} label="Revision Requested" value={data.stats.revisionRequested} color="orange" />
            <StatCard icon={XCircle} label="Rejected" value={data.stats.rejected} color="red" />
          </div>
        </>
      )}

      {/* Recent papers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {user.role === 'researcher' && 'Your Recent Papers'}
            {user.role === 'reviewer' && 'Assigned Papers'}
            {user.role === 'editor' && 'Recent Submissions'}
          </h2>
          {user.role === 'editor' && (
            <Link to="/editor" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        {data.papers.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {user.role === 'researcher' && 'No papers yet. Submit your first paper!'}
              {user.role === 'reviewer' && 'No papers assigned for review yet.'}
              {user.role === 'editor' && 'No submissions yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.papers.slice(0, 6).map(p => (
              <PaperCard key={p._id} paper={p} showAuthor={user.role !== 'researcher'} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
