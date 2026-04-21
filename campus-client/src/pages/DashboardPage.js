import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
import { updateMe } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-12 animate-luxury">
        
        {/* Profile Card */}
        <div className="luxury-card !p-0 overflow-hidden relative">
          {/* Decorative Gradient Banner */}
          <div className="h-40 bg-gradient-to-br from-violet-deep via-wine-muted to-mauve-dusty relative">
             <div className="absolute inset-0 bg-black/20" />
             <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-plum-dark/40 to-transparent" />
          </div>

          <div className="px-10 pb-10">
            {/* Avatar & Key Info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-mauve-dusty to-wine-muted border-8 border-plum-dark flex items-center justify-center text-ivory-warm text-4xl font-black shadow-luxury">
                  {initials}
                </div>
                <div className="text-center md:text-left pb-2">
                  <h2 className="text-3xl font-black text-ivory-warm tracking-tight">{user?.username}</h2>
                  <div className="flex items-center gap-3 mt-2 justify-center md:justify-start">
                     <span className="text-[10px] font-black text-blush-soft uppercase tracking-[0.2em]">{user?.role}</span>
                     <div className="w-1 h-1 rounded-full bg-ivory-warm/20" />
                     <span className="text-xs font-medium text-ivory-warm/50">{user?.email}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowUpdateModal(true)}
                className="luxury-button !px-6 !py-2.5 !text-xs uppercase tracking-widest"
              >
                Refine Profile
              </button>
            </div>

            <hr className="my-10 border-ivory-warm/5" />

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <InfoPanel label="Registry ID" value={user?.id || '—'} isMono />
              <InfoPanel label="Tier" value={user?.role === 'ADMIN' ? 'Executive' : 'Member'} />
              <InfoPanel label="Status" value="Verified" color="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Modules Section */}
        <div>
          <h3 className="text-xs font-black text-blush-soft uppercase tracking-[0.3em] mb-8 ml-2">Executive Suites</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ModuleCard 
              onClick={() => navigate('/facilities')}
              icon="🏛️"
              title="Facility Portfolio"
              desc="Browse and curate campus infrastructure and resources."
              color="from-violet-deep to-wine-muted"
            />
            {user?.role === 'ADMIN' && (
              <ModuleCard 
                onClick={() => navigate('/admin/users')}
                icon="👥"
                title="Personnel Registry"
                desc="Manage executive access and member credentials."
                color="from-wine-muted to-mauve-dusty"
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
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
      </AnimatePresence>
    </MainLayout>
  );
}

function InfoPanel({ label, value, isMono, color = "text-ivory-warm" }) {
  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-ivory-warm/5 hover:border-blush-soft/20 transition-all group">
      <p className="text-[9px] font-black text-blush-soft uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className={`text-sm font-bold truncate ${color} ${isMono ? 'font-mono text-[11px]' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function ModuleCard({ onClick, icon, title, desc, color }) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden bg-white/5 border border-ivory-warm/5 rounded-[2.5rem] p-8 text-left transition-all duration-500 hover:shadow-luxury hover:-translate-y-2`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      <div className="flex items-start gap-6 relative z-10">
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-soft group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          {icon}
        </div>
        <div>
          <h4 className="text-lg font-black text-ivory-warm tracking-tight group-hover:text-blush-soft transition-colors">{title}</h4>
          <p className="text-xs font-medium text-ivory-warm/40 mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
    </button>
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
      setTimeout(() => onSuccess(data.token, { username: data.username, email: data.email, role: data.role }), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync with registry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-plum-dark/80 backdrop-blur-md flex items-center justify-center z-50 px-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="luxury-card w-full max-w-md bg-violet-deep border-ivory-warm/20"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-ivory-warm">Refine Identity</h3>
            <p className="text-[10px] font-black text-blush-soft uppercase tracking-widest mt-1">Profile Metadata</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-ivory-warm/40 hover:text-ivory-warm transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {success ? (
          <div className="text-center py-12">
             <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             </div>
             <p className="text-ivory-warm font-bold">Identity Synchronized</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-xs font-bold text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/10">{error}</p>}
            
            <div>
              <label className="block text-[10px] font-black text-blush-soft uppercase tracking-widest mb-2 ml-4">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="luxury-input"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-blush-soft uppercase tracking-widest mb-2 ml-4">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="luxury-input"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-ivory-warm/10 text-[10px] font-black text-ivory-warm uppercase tracking-widest hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 luxury-button !text-[10px] uppercase tracking-widest disabled:opacity-50">
                {submitting ? 'Syncing...' : 'Confirm Changes'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
