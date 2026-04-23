import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser, updateUserRole, approveUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Trash2, 
  Edit3, 
  User,
  ShieldAlert,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Zap,
  Layers,
  ChevronDown,
  Globe,
  Activity,
  Sparkles,
  Shield,
  ArrowRight
} from 'lucide-react';

export default function UserListPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      setError(err.response?.status === 403 ? 'Access Denied: Administrative Clearance Required' : 'Failed to synchronize member registry.');
      addToast('Registry synchronization failed', 'error');
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
      addToast('Personnel access successfully revoked', 'success');
      setDeleteTarget(null);
    } catch {
      addToast('Revocation sequence failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      addToast(`Authorization level updated to ${newRole}`, 'success');
    } catch {
      addToast('Authorization update failed', 'error');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, approved: true } : u));
      addToast('Identity verified and authorized', 'success');
    } catch (err) {
      addToast('Authorization protocol failed', 'error');
    }
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = (u.username?.toLowerCase() || '').includes(search.toLowerCase()) || 
                           (u.email?.toLowerCase() || '').includes(search.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  if (loading && users.length === 0) return <LoadingSpinner fullScreen message="Accessing Personnel Archive..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
      
      {/* Executive Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
           <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <Globe size={12} className="text-luna-aqua animate-pulse" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.4em]">Personnel Management Matrix</span>
              </div>
           </div>
           <h1 className="text-6xl font-black text-white tracking-tighter leading-none">Personnel <span className="text-luna-aqua">Registry</span></h1>
           <p className="text-text-muted font-medium mt-4 text-xl">Executive oversight of authenticated campus specialists and personnel.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
           <div className="relative w-full lg:w-[400px] group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={22} />
             <input
               type="text"
               placeholder="Locate identity dossiers..."
               value={search}
               onChange={(e) => setSearch(setSearch(e.target.value))}
               className="luna-input !pl-16 !py-5"
             />
           </div>
           <button className="luna-button !px-10 !py-5 shadow-2xl shadow-luna-aqua/20 whitespace-nowrap group">
             <span className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em]">
                Initialize Invite <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
             </span>
           </button>
        </motion.div>
      </div>

      {/* Intelligence Filtering Hub */}
      <div className="luna-card !bg-luna-midnight/40 border-luna-aqua/5 !p-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mr-4 ml-4">Filter Authority:</span>
          {['ALL', 'USER', 'TECHNICIAN', 'ADMIN'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border ${
                roleFilter === role 
                  ? 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20 luna-glow' 
                  : 'text-text-muted border-transparent hover:bg-luna-aqua/5 hover:text-white'
              }`}
            >
              {role}
            </button>
          ))}
          <div className="flex-1" />
          <div className="px-6 py-3 bg-luna-midnight/60 border border-luna-aqua/10 rounded-2xl flex items-center gap-4">
             <Activity size={16} className="text-luna-aqua animate-pulse" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">{filtered.length} Identifiers Active</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] flex items-center gap-6"
          >
             <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
                <ShieldAlert size={24} />
             </div>
             <span className="text-base font-black text-red-400 uppercase tracking-widest leading-none">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {filtered.map((u, idx) => (
            <motion.div 
              key={u.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="luna-card group hover:border-luna-aqua/30 flex flex-col relative overflow-hidden !p-0"
            >
              <div className="h-24 bg-luna-midnight/60 relative overflow-hidden border-b border-luna-aqua/5">
                 <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                 <div className="absolute inset-0 bg-gradient-to-t from-luna-midnight to-transparent" />
                 <div className="absolute bottom-0 left-10 translate-y-1/2">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-luna-midnight border-4 border-luna-midnight shadow-2xl flex items-center justify-center text-3xl font-black text-luna-aqua group-hover:luna-glow transition-all duration-500 relative">
                       {u.username?.slice(0, 1).toUpperCase()}
                       <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-luna-midnight ${u.approved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                    </div>
                 </div>
                 <Sparkles size={20} className="absolute right-8 top-8 text-luna-aqua/10 group-hover:text-luna-aqua/30 transition-colors" />
              </div>

              <div className="p-10 pt-16 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black text-white group-hover:text-luna-aqua transition-colors tracking-tighter">{u.username}</h3>
                  <div className="relative group/role">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                      className={`luna-badge !pl-4 !pr-10 !py-2 appearance-none cursor-pointer focus:outline-none transition-all ${getRoleStyles(u.role)}`}
                    >
                      <option value="USER" className="bg-luna-midnight text-white uppercase font-black text-[10px]">Standard User</option>
                      <option value="TECHNICIAN" className="bg-luna-midnight text-white uppercase font-black text-[10px]">Technician Node</option>
                      <option value="ADMIN" className="bg-luna-midnight text-white uppercase font-black text-[10px]">Executive Admin</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover/role:opacity-100 transition-opacity" size={14} />
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                   <div className="flex items-center gap-3 text-text-muted group-hover:text-white/80 transition-colors">
                      <Mail size={16} className="text-luna-aqua" />
                      <span className="text-sm font-medium truncate">{u.email}</span>
                   </div>
                   <div className="flex items-center gap-3 text-text-muted/40">
                      <Shield size={16} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em]">{u.id.substring(0, 16)}...</span>
                   </div>
                </div>

                {!u.approved && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApprove(u.id)}
                    className="w-full mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center gap-3 text-amber-400 hover:bg-amber-500 hover:text-white transition-all shadow-xl shadow-amber-500/5 group/approve"
                  >
                    <ShieldCheck size={18} className="group-hover/approve:rotate-12 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Authorize Identity</span>
                  </motion.button>
                )}

                <div className="flex gap-4 pt-10 border-t border-luna-aqua/5">
                  <button
                    className="flex-1 luna-button-outline !py-4 flex items-center justify-center gap-3 group/edit"
                  >
                    <Edit3 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Update Dossier</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(u)}
                    disabled={u.id === currentUser?.id}
                    className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-10 disabled:grayscale shadow-xl hover:shadow-red-500/20 group/purge"
                  >
                    <Trash2 size={20} className="group-hover/purge:scale-125 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Progress Indicator Accent */}
              <div className="absolute bottom-0 left-0 h-1 bg-luna-aqua/5 w-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className={`h-full ${u.role === 'ADMIN' ? 'bg-luna-aqua luna-glow' : u.role === 'TECHNICIAN' ? 'bg-luna-cyan' : 'bg-luna-steel'}`} 
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="py-48 text-center luna-card border-dashed border-luna-aqua/10 flex flex-col items-center gap-10 opacity-20">
          <div className="w-32 h-32 luna-glass rounded-[3rem] flex items-center justify-center text-luna-aqua">
             <Layers size={64} />
          </div>
          <div>
             <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">Registry Sector Silent</h3>
             <p className="text-base font-medium text-text-muted mt-4">No matching personnel dossiers identified within current scanning parameters.</p>
          </div>
          <button onClick={() => { setSearch(''); setRoleFilter('ALL'); }} className="luna-button-outline !px-12 !py-4">Reset Registry Scan</button>
        </div>
      )}

      {/* Revocation Security Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-luna-midnight/95 backdrop-blur-3xl flex items-center justify-center z-[100] p-10"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="luna-card max-w-2xl w-full border-luna-aqua/20 shadow-[0_0_100px_rgba(167,235,242,0.1)] !p-16"
            >
              <div className="text-center">
                <div className="w-32 h-32 bg-red-500/10 rounded-[3rem] flex items-center justify-center mx-auto mb-12 text-red-400 border border-red-500/20 luna-glow-strong">
                  <ShieldAlert size={64} />
                </div>
                <h3 className="text-5xl font-black text-white tracking-tighter mb-6 leading-none">Revoke Personnel Access?</h3>
                <p className="text-xl text-text-muted font-medium mb-16 leading-relaxed max-w-md mx-auto">
                  This action will immediately terminate all access privileges for <span className="text-luna-aqua font-black uppercase tracking-widest">[{deleteTarget.username}]</span> and purge their executive credentials.
                </p>
                
                <div className="flex gap-8">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 luna-button-outline !py-6 text-xs uppercase tracking-[0.4em]"
                  >
                    Abort Protocol
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 luna-button !bg-red-600 !text-white !py-6 hover:bg-red-500 shadow-2xl shadow-red-600/20"
                  >
                    <span className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em]">
                       {deleting ? 'Executing Purge...' : 'Confirm Revocation'}
                       <ArrowRight size={20} />
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authority Footer */}
      <div className="flex items-center justify-between pt-16 border-t border-luna-aqua/10 text-[9px] font-black text-text-muted uppercase tracking-[0.5em]">
         <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-luna-aqua animate-pulse" />
            Registry Command Operational
         </div>
         <div className="flex items-center gap-8">
            <span>Identity Node: Campus-01</span>
            <span>Uptime: 8760:00:00</span>
         </div>
      </div>
    </div>
  );
}

const getRoleStyles = (role) => {
  switch (role) {
    case 'ADMIN': return 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20 luna-glow';
    case 'TECHNICIAN': return 'bg-luna-cyan/10 text-luna-cyan border-luna-cyan/20';
    default: return 'bg-luna-steel/10 text-text-muted border-luna-aqua/5';
  }
};
