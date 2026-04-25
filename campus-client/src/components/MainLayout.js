import { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../services/api';
import { X, User, Mail, CheckCircle2, Zap } from 'lucide-react';

function ProfileModal({ user, onClose, onSuccess }) {
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
      setTimeout(() => {
        onSuccess(data.token, { username: data.username, email: data.email, role: data.role });
        onClose();
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-luna-midnight/90 backdrop-blur-2xl flex items-center justify-center z-50 px-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="luna-card w-full max-w-md border-luna-aqua/20 !p-0 overflow-hidden shadow-2xl shadow-luna-aqua/20"
      >
        <div className="p-8 border-b border-luna-aqua/10 bg-luna-midnight/60 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tighter">Update Profile</h3>
            <p className="text-[9px] font-black text-luna-aqua uppercase tracking-[0.4em] mt-1">Edit your account details</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-luna-aqua/10 text-luna-aqua flex items-center justify-center hover:bg-luna-aqua hover:text-luna-midnight transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {success ? (
            <div className="text-center py-12">
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="w-16 h-16 bg-luna-aqua/10 text-luna-aqua rounded-3xl flex items-center justify-center mx-auto mb-6 border border-luna-aqua/20 luna-glow">
                <CheckCircle2 size={32} />
              </motion.div>
              <p className="text-xl font-black text-white tracking-tight">Profile Updated!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-400 uppercase tracking-[0.2em] flex items-center gap-3">
                  <Zap size={16} /> {error}
                </div>
              )}
              <div className="group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-1 mb-3 block group-focus-within:text-luna-aqua transition-all">Username</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={18} />
                  <input type="text" name="username" value={form.username} onChange={handleChange} className="luna-input !pl-14 !py-4" required />
                </div>
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-1 mb-3 block group-focus-within:text-luna-aqua transition-all">Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={18} />
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="luna-input !pl-14 !py-4" required />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={onClose} className="flex-1 luna-button-outline !py-4 text-[10px] font-black uppercase tracking-widest">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 luna-button !py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-luna-aqua/20">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, login } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-luna-midnight flex font-['Outfit']" style={{ overflow: 'hidden' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-luna-steel/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-luna-cyan/10 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0 h-screen lg:ml-72 relative" style={{ overflow: 'hidden' }}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 luna-glass border-b border-luna-aqua/10 z-50 shrink-0">
          <button onClick={toggleSidebar} className="text-luna-aqua">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <span className="text-white font-black tracking-widest uppercase text-xs">Smart<span className="text-luna-aqua">Uni</span></span>
          <div className="w-8 h-8 rounded-lg bg-luna-steel flex items-center justify-center text-xs font-bold text-white luna-glow">
            {user?.username?.substring(0, 1).toUpperCase()}
          </div>
        </div>

        {/* Desktop Premium Header */}
        <header className="hidden lg:flex px-8 h-20 items-center justify-between luna-glass border-b border-luna-aqua/5 shrink-0 z-40">
          <div className="relative w-96">
            <svg className="w-4 h-4 text-luna-aqua/40 absolute left-4 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Luna Search..."
              className="luna-input pl-11"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button className="p-2 rounded-xl text-ivory-warm/60 hover:text-ivory-warm hover:bg-white/5 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>

            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 cursor-pointer group"
              title="Edit Profile"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-luna-steel to-luna-navy flex items-center justify-center font-bold text-white text-sm shadow-soft group-hover:shadow-lg transition-all luna-glow group-hover:ring-2 group-hover:ring-luna-aqua/40">
                {user?.username?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-black text-white leading-tight">{user?.username || 'Guest'}</span>
                <span className="text-[9px] font-black text-luna-aqua uppercase tracking-wider">{user?.role || 'User'}</span>
              </div>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 lg:p-8 relative"
          style={{ scrollbarGutter: 'stable', overflowAnchor: 'none' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal
            user={user}
            onClose={() => setShowProfileModal(false)}
            onSuccess={(token, updated) => login(token, updated)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
