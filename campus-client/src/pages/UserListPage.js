import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser, approveUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  ADMIN: 'bg-purple-100 text-purple-700',
  USER: 'bg-blue-100 text-blue-700',
};

export default function UserListPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Failed to load users. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError('Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const handleApprove = async (u) => {
    setApproving(u.id);
    try {
      await approveUser(u.id);
      setUsers((prev) =>
        prev.map((x) => x.id === u.id ? { ...x, approved: true } : x)
      );
    } catch {
      setError('Failed to approve user.');
    } finally {
      setApproving(null);
    }
  };

  const pendingAdmins = users.filter((u) => u.role === 'ADMIN' && u.approved === false);
  const filtered = users.filter(
    (u) =>
      (u.approved !== false) &&
      (u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
        {/* Header content moved to page body */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">System User Directory</h1>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">{users.length} registered accounts in database</p>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-bold flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">⚠️</span>
            {error}
          </div>
        )}

        {/* Pending Admin Approvals */}
        {pendingAdmins.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-3 border-b border-yellow-200 flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-yellow-800">Pending Admin Approvals ({pendingAdmins.length})</span>
            </div>
            <div className="divide-y divide-yellow-100">
              {pendingAdmins.map((u) => (
                <div key={u.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-800 text-xs font-bold flex-shrink-0">
                      {u.username?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{u.username}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 px-2.5 py-0.5 rounded-full font-semibold">PENDING</span>
                    <button
                      onClick={() => handleApprove(u)}
                      disabled={approving === u.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 transition"
                    >
                      {approving === u.id ? 'Approving…' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(u)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32 text-slate-300">
              <div className="text-6xl mb-6">🔍</div>
              <p className="text-sm font-black uppercase tracking-widest opacity-40">No matching users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-50">
                  <tr>
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-10 py-5">Identity</th>
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-10 py-5">Communication</th>
                    <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-10 py-5">Privileges</th>
                    <th className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest px-10 py-5">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-indigo-50/10 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-black group-hover:scale-110 transition-transform">
                            {u.username?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-base">{u.username}</p>
                            <p className="text-[10px] text-slate-400 font-mono tracking-tighter opacity-70">UID: {u.id?.slice(-12)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-slate-600 font-bold">{u.email}</td>
                      <td className="px-10 py-6">
                        <span className={`inline-block text-[10px] font-black px-4 py-1.5 rounded-full border tracking-widest ${ROLE_COLORS[u.role] || 'bg-slate-50 text-slate-600 border-slate-100 text-slate-400'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDeleteTarget(u)}
                            disabled={u.id === user?.id}
                            className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white disabled:opacity-20 disabled:grayscale transition-all shadow-sm active:scale-90"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-10 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl">
              🗑️
            </div>
            <h3 className="font-black text-slate-900 text-xl mb-2">Delete User?</h3>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              Are you sure you want to permanently remove <strong>{deleteTarget.username}</strong>? This action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-black uppercase tracking-widest transition shadow-lg shadow-rose-200 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete Account'}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="w-full py-4 rounded-2xl bg-slate-50 text-slate-500 text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition"
              >
                Keep User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
