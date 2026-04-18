import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
import { updateMe, getAllTickets } from '../services/api';
import { useEffect } from 'react';

const ROLE_COLORS = {
  ADMIN: 'bg-purple-100 text-purple-700',
  USER: 'bg-blue-100 text-blue-700',
};

export default function DashboardPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await getAllTickets();
        setTickets(data);
      } catch (err) {
        console.error('Failed to fetch tickets');
      } finally {
        setLoadingTickets(false);
      }
    };
    fetchTickets();
  }, []);

  const stats = {
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
  };

  const recentUpdates = tickets
    .flatMap(t => t.updates.map(u => ({ ...u, ticketTitle: t.title, ticketId: t.id })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <MainLayout>

      <div className="max-w-3xl mx-auto py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600" />

          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="-mt-12 mb-4">
              <div className="w-20 h-20 rounded-full bg-indigo-600 border-4 border-white flex items-center justify-center text-white text-2xl font-bold shadow">
                {initials}
              </div>
            </div>

            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{user?.username}</h2>
                <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
                <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${ROLE_COLORS[user?.role] || 'bg-gray-100 text-gray-600'}`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={() => setShowUpdateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Update Profile
              </button>
            </div>

            <hr className="my-6 border-gray-100" />

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Username" value={user?.username} />
              <InfoRow label="Email" value={user?.email} />
              <InfoRow label="Role" value={user?.role} />
              <InfoRow label="Account ID" value={user?.id || '—'} mono />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/facilities')}
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition text-left"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl">🏛️</div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Facilities &amp; Assets</p>
                <p className="text-xs text-gray-400 mt-0.5">Browse and manage campus resources</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/tickets')}
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:border-orange-200 transition text-left"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">🎫</div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Incident Tickets</p>
                <p className="text-xs text-gray-400 mt-0.5">Report issues and track incidents</p>
              </div>
            </button>
          </div>
        </div>

        {/* User Dashboard Metrics */}
        <div className="mt-12">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Support Overview</h3>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-black text-blue-600">{stats.open}</p>
              <p className="text-[10px] font-black uppercase text-gray-400 mt-1">Open</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-black text-amber-500">{stats.inProgress}</p>
              <p className="text-[10px] font-black uppercase text-gray-400 mt-1">In Progress</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-2xl font-black text-emerald-500">{stats.resolved}</p>
              <p className="text-[10px] font-black uppercase text-gray-400 mt-1">Resolved</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <h4 className="font-bold text-gray-800 text-sm">Recent Activity</h4>
                <button onClick={() => navigate('/tickets')} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">View All</button>
             </div>
             <div className="divide-y divide-gray-50">
                {recentUpdates.length > 0 ? recentUpdates.map((update, i) => (
                  <div key={i} className="px-6 py-4 flex gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">💬</div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 line-clamp-1">{update.ticketTitle}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{update.note}</p>
                      <p className="text-[9px] text-gray-400 mt-1 font-medium">{new Date(update.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">No recent updates</div>
                )}
             </div>
          </div>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Administration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:border-purple-200 transition text-left"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">👥</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">User Management</p>
                  <p className="text-xs text-gray-400 mt-0.5">View and manage all users</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Update Profile Modal */}
      {showUpdateModal && (
        <UpdateProfileModal
          user={user}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={(token, updated) => {
            login(token, updated);
            setShowUpdateModal(false);
          }}
        />                                     
      )}
    </MainLayout>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`mt-0.5 text-sm text-gray-800 truncate ${mono ? 'font-mono text-xs' : 'font-medium'}`}>
        {value || '—'}
      </p>
    </div>
  );
}

function UpdateProfileModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await updateMe(form);
      setSuccess(true);
      setTimeout(() => onSuccess(data.token, { username: data.username, email: data.email, role: data.role }), 600);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-800">Update Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="text-center py-4 text-green-600 font-medium text-sm">Profile updated!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition disabled:opacity-50">
                {submitting ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
