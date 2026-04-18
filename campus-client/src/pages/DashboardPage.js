import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
import { updateMe, getAllTickets } from '../services/api';
import { useEffect } from 'react';

const ROLE_COLORS = {
  ADMIN: 'bg-purple-100 text-purple-700 font-bold border border-purple-200',
  TECHNICIAN: 'bg-indigo-100 text-indigo-700 font-bold border border-indigo-200',
  USER: 'bg-blue-100 text-blue-700 font-bold border border-blue-200',
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

  const myTickets = user?.role === 'TECHNICIAN' 
    ? tickets.filter(t => t.assignedTechnicianId === user?.id)
    : user?.role === 'USER'
      ? tickets.filter(t => t.createdById === user?.id)
      : tickets;

  const stats = {
    open: myTickets.filter(t => t.status === 'OPEN').length,
    inProgress: myTickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: myTickets.filter(t => t.status === 'RESOLVED').length,
  };

  const recentUpdates = tickets
    .flatMap(t => t.updates.map(u => ({ ...u, ticketTitle: t.title, ticketId: t.id })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <>
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
              className="group relative flex items-center gap-4 bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl px-6 py-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(249,115,22,0.15)] hover:border-orange-200/60 transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className="relative">
                <p className="font-bold text-gray-800 text-sm group-hover:text-orange-700 transition-colors">Incident Tickets</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Report issues and track incidents</p>
              </div>
            </button>
          </div>
        </div>

        {/* User Dashboard Metrics */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              {user?.role === 'TECHNICIAN' ? 'MY ASSIGNED FOCUS' : user?.role === 'ADMIN' ? 'GLOBAL SUPPORT PULSE' : 'MY SUPPORT REQUESTS'}
            </h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="relative group bg-white/70 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                </div>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.open}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mt-1">Open Tickets</p>
            </div>
            
            <div className="relative group bg-white/70 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.inProgress}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 mt-1">In Progress</p>
            </div>
            
            <div className="relative group bg-white/70 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.resolved}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mt-1">Resolved</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
             <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />
             <div className="px-8 py-5 border-b border-gray-100/50 flex justify-between items-center bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h4 className="font-bold text-gray-900">Ticket Timeline</h4>
                </div>
                <button onClick={() => navigate('/tickets')} className="text-xs font-bold text-indigo-600 uppercase tracking-wider hover:text-indigo-800 transition-colors flex items-center gap-1 group">
                  View All
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
             </div>
             <div className="p-2">
                {recentUpdates.length > 0 ? recentUpdates.map((update, i) => (
                  <div key={i} className="group relative px-6 py-5 hover:bg-gray-50/80 rounded-2xl transition-all duration-300">
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="relative mt-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                          <span className="text-lg">💬</span>
                        </div>
                        {i !== recentUpdates.length - 1 && (
                          <div className="absolute top-10 left-1/2 -ml-px w-[2px] h-12 bg-gray-100 group-hover:bg-indigo-100 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{update.ticketTitle}</p>
                            <p className="text-sm text-gray-600 mt-1 font-medium leading-relaxed">{update.note}</p>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg uppercase tracking-wider whitespace-nowrap">
                            {new Date(update.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Recent Activity</p>
                    <p className="text-xs text-gray-400 mt-1">Your timeline is quiet right now</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {user?.role === 'TECHNICIAN' ? 'Staff Operations' : 'Administration'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user?.role === 'ADMIN' && (
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
              )}
              
              {user?.role === 'TECHNICIAN' && (
                <button
                  onClick={() => navigate('/technician/dashboard')}
                  className="flex items-center gap-4 bg-white border border-indigo-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:border-indigo-400 transition text-left ring-2 ring-indigo-50 ring-offset-2"
                >
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl text-white">⚡</div>
                  <div>
                    <p className="font-black text-indigo-700 text-sm">Enter Technician Hub</p>
                    <p className="text-xs text-indigo-400 mt-0.5 font-medium">Manage your assigned queue and updates</p>
                  </div>
                </button>
              )}

              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:border-blue-200 transition text-left"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📊</div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Support Monitor</p>
                    <p className="text-xs text-gray-400 mt-0.5">Admin Analytics & Workload</p>
                  </div>
                </button>
              )}
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
    </>
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
