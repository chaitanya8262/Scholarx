// Profile - edit own info
import { useState } from 'react';
import toast from 'react-hot-toast';
import { User, Briefcase, GraduationCap, FileText, Save } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    affiliation: user?.affiliation || '',
    bio: user?.bio || '',
    expertise: (user?.expertise || []).join(', ')
  });
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        expertise: form.expertise.split(',').map(s => s.trim()).filter(Boolean)
      };
      const { data } = await api.put('/users/profile', payload);
      localStorage.setItem('scholarx_user', JSON.stringify({ ...user, ...data.user }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Update your information</p>
      </div>

      <div className="card p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-bold text-lg">{user?.name}</div>
          <div className="text-sm text-gray-500">{user?.email}</div>
          <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 capitalize mt-1">
            {user?.role}
          </span>
        </div>
      </div>

      <form onSubmit={save} className="card p-6 space-y-4">
        <div>
          <label className="label">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-10" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Affiliation</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-10" value={form.affiliation}
              onChange={(e) => setForm({ ...form, affiliation: e.target.value })} />
          </div>
        </div>

        {user?.role === 'reviewer' && (
          <div>
            <label className="label">Expertise (comma-separated)</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input pl-10" value={form.expertise}
                onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
            </div>
          </div>
        )}

        <div>
          <label className="label">Bio</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea rows={4} className="input pl-10 resize-none" value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
