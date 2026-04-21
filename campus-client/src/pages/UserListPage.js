import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser, approveUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function UserListPage() {
  const { user } = useAuth();
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
      setError(err.response?.status === 403 ? 'Access denied. Specialist privileges required.' : 'Failed to load member registry.');
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
      setError('Failed to revoke access.');
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

  if (loading) return <LoadingSpinner fullScreen message="Accessing Registry..." />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-luxury font-['Outfit']">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-ivory-warm/10">
        <div>
           <h1 className="text-4xl font-black text-ivory-warm tracking-tight">Member Registry</h1>
           <p className="text-sm font-bold text-blush-soft uppercase tracking-widest mt-2">{users.length} Registered Personnel</p>
        </div>
        <div className="relative w-full md:w-80">
          <svg className="absolute left-4 top-3 w-4 h-4 text-ivory-warm/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search personnel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-ivory-warm/10 rounded-xl text-sm text-ivory-warm placeholder:text-ivory-warm/20 outline-none focus:ring-2 focus:ring-blush-soft/30 transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-bold text-rose-400 flex items-center gap-3">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
           {error}
        </div>
      )}

      {/* Grid of Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((u) => (
          <div key={u.id} className="luxury-card group">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mauve-dusty to-wine-muted flex items-center justify-center text-xl font-black text-ivory-warm shadow-soft group-hover:rotate-6 transition-all duration-500">
                {u.username?.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-ivory-warm truncate">{u.username}</h3>
                <p className="text-[10px] font-black text-blush-soft uppercase tracking-widest">{u.role}</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
               <div className="flex items-center gap-3 text-ivory-warm/50">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span className="text-xs font-medium truncate">{u.email}</span>
               </div>
               <div className="flex items-center gap-3 text-ivory-warm/30">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  <span className="text-[10px] font-mono">{u.id}</span>
               </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-ivory-warm/5">
              <button
                onClick={() => navigate(`/admin/users/edit/${u.id}`)}
                className="flex-1 py-2 rounded-xl bg-white/5 border border-ivory-warm/10 text-[10px] font-black text-ivory-warm uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Refine
              </button>
              <button
                onClick={() => setDeleteTarget(u)}
                disabled={u.id === user?.id}
                className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Overlay */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-plum-dark/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="luxury-card max-w-sm w-full bg-violet-deep border-ivory-warm/20 shadow-luxury animate-luxury">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-400 border border-rose-500/20">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              </div>
              <h3 className="text-xl font-black text-ivory-warm mb-2">Revoke Access?</h3>
              <p className="text-sm font-medium text-ivory-warm/50 mb-8">This action will permanently remove <span className="text-blush-soft font-bold">{deleteTarget.username}</span> from the executive registry.</p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-2xl border border-ivory-warm/10 text-[10px] font-black text-ivory-warm uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Retain
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
                >
                  {deleting ? 'Revoking...' : 'Revoke Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
