import { useEffect, useState } from 'react';
import { Trash2, Search, Users as UsersIcon } from 'lucide-react';
import api from '../../services/api';

const BLUE       = '#3b82f6';
const BLUE_LIGHT = '#eff6ff';

const ROLE_CFG = {
  admin: { cls: 'bg-blue-50 text-blue-600',       label: 'Admin' },
  host:  { cls: 'bg-emerald-50 text-emerald-700', label: 'Host'  },
  guest: { cls: 'bg-gray-100 text-gray-500',      label: 'Guest' },
};

function RoleBadge({ role }) {
  const cfg = ROLE_CFG[role] ?? ROLE_CFG.guest;
  return (
    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [deletingId, setDeletingId] = useState(null); // user id currently mid-delete (disables its button)
  const [confirmId, setConfirmId]   = useState(null); // user id awaiting confirmation
  const [error, setError]     = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError('');
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading users…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-5 font-sans">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-1">Admin</p>
          <h1 className="text-2xl font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
            Manage <span className="italic" style={{ color: BLUE }}>Users</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">{users.length} registered accounts</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: BLUE_LIGHT }}>
          <UsersIcon size={20} color={BLUE} strokeWidth={1.75} />
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-100 focus:outline-none focus:border-blue-200 bg-gray-50"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">No users found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Email</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Role</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: BLUE_LIGHT, color: BLUE }}
                      >
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}