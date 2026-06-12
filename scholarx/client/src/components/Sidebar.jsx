// Sidebar with role-based nav items
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileUp, FileText, ClipboardCheck, Settings2, Search, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  // Build menu based on role
  const items = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['researcher', 'reviewer', 'editor'] },
    { to: '/submit', icon: FileUp, label: 'Submit Paper', roles: ['researcher'] },
    { to: '/my-papers', icon: FileText, label: 'My Papers', roles: ['researcher'] },
    { to: '/reviews', icon: ClipboardCheck, label: 'Assigned Reviews', roles: ['reviewer'] },
    { to: '/editor', icon: Settings2, label: 'Editor Panel', roles: ['editor'] },
    { to: '/search', icon: Search, label: 'Search Papers', roles: ['researcher', 'reviewer', 'editor'] },
    { to: '/profile', icon: User, label: 'Profile', roles: ['researcher', 'reviewer', 'editor'] }
  ].filter(it => it.roles.includes(user?.role));

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800 z-40
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="flex md:hidden justify-end p-2">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/30 border border-brand-200 dark:border-brand-800">
            <div className="text-xs font-semibold text-brand-700 dark:text-brand-300 mb-1">ScholarX v1.0</div>
            <div className="text-[11px] text-brand-600 dark:text-brand-400">Research made simple</div>
          </div>
        </div>
      </aside>
    </>
  );
}
