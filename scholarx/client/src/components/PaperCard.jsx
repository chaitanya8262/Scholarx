// Reusable components: StatusBadge + PaperCard
import { Link } from 'react-router-dom';
import { FileText, Calendar, User as UserIcon, Tag } from 'lucide-react';

export function StatusBadge({ status }) {
  const map = {
    submitted:           { label: 'Submitted',          cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    under_review:        { label: 'Under Review',       cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    revision_requested:  { label: 'Revision Requested', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
    accepted:            { label: 'Accepted',           cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    rejected:            { label: 'Rejected',           cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    published:           { label: 'Published',          cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' }
  };
  const v = map[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`badge ${v.cls}`}>{v.label}</span>;
}

export default function PaperCard({ paper, showAuthor = false }) {
  return (
    <Link
      to={`/paper/${paper._id}`}
      className="card p-5 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-700 transition-all block"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 flex-1">
          {paper.title}
        </h3>
        <StatusBadge status={paper.status} />
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
        {paper.abstract}
      </p>

      {paper.keywords?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {paper.keywords.slice(0, 4).map((kw, i) => (
            <span key={i} className="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              <Tag className="w-3 h-3 mr-1" />
              {kw}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
        {showAuthor && paper.authorId?.name && (
          <span className="flex items-center gap-1">
            <UserIcon className="w-3.5 h-3.5" />
            {paper.authorId.name}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(paper.createdAt).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          v{paper.version}
        </span>
      </div>
    </Link>
  );
}
