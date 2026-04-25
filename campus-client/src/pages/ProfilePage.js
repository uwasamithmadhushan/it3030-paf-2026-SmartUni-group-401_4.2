import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateMe, getMe } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Camera, 
  Save, 
  Lock, 
  ChevronRight,
  Shield,
  Zap,
  CheckCircle2,
  X,
  CreditCard,
  Layers,
  Building2,
  Fingerprint,
  Activity,
  Globe,
  Bell,
  LogOut,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getMe();
        setProfileData(data);
      } catch (err) {
        console.error('Personnel sync failure');
      }
    };
    fetchProfile();
  }, []);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <div className="max-w-[1400px] mx-auto space-y-12">
      
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
           <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <ShieldCheck size={12} className="text-luna-aqua" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.4em]">Personnel Identity Archive</span>
              </div>
           </div>
           <h1 className="text-6xl font-black text-white tracking-tighter leading-none">Personnel <span className="text-luna-aqua">Record</span></h1>
           <p className="text-text-muted font-medium mt-4 text-xl">High-fidelity identity management and executive access tier control.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
           <button onClick={logout} className="luna-button-outline !px-8 !py-4 flex items-center gap-3 group">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Terminate Session
           </button>
           <button onClick={() => setShowUpdateModal(true)} className="luna-button !px-10 !py-4 shadow-xl shadow-luna-aqua/20">
              Refine Identity
           </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* Left Panel: Profile Summary */}
        <div className="xl:col-span-4 space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="luna-card !p-0 overflow-hidden shadow-2xl"
          >
            <div className="h-48 bg-gradient-to-br from-luna-steel/40 via-luna-navy to-luna-midnight relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
               <motion.div 
                 animate={{ opacity: [0.1, 0.2, 0.1] }} 
                 transition={{ duration: 4, repeat: Infinity }}
                 className="absolute inset-0 bg-luna-aqua/10 blur-3xl" 
               />
               <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-luna-midnight to-transparent" />
            </div>

            <div className="px-12 pb-12 relative">
               <div className="flex flex-col items-center -mt-24 relative z-10 text-center">
                  <div className="relative group">
                     <motion.div 
                       whileHover={{ rotate: 10, scale: 1.05 }}
                       className="w-40 h-40 rounded-[2.5rem] bg-luna-midnight border-8 border-luna-midnight flex items-center justify-center text-white text-5xl font-black shadow-2xl luna-glow group-hover:border-luna-aqua/30 transition-all duration-500"
                     >
                        <span className="text-luna-aqua tracking-tighter">{initials}</span>
                     </motion.div>
                     <button className="absolute bottom-2 right-2 w-12 h-12 bg-luna-aqua text-luna-midnight rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform luna-glow">
                        <Camera size={20} />
                     </button>
                  </div>
                  
                  <h2 className="text-4xl font-black text-white tracking-tighter mt-8">{user?.username}</h2>
                  <div className="flex items-center gap-3 text-[10px] font-black text-luna-cyan uppercase tracking-[0.3em] mt-3">
                     <Shield size={14} className="text-luna-aqua" />
                     {user?.role} Access Procedure
                  </div>
                  <p className="text-base font-medium text-text-muted mt-6 opacity-60 leading-relaxed max-w-xs">{user?.email}</p>
               </div>

               <div className="mt-12 pt-12 border-t border-luna-aqua/5 grid grid-cols-2 gap-6">
                  <div className="text-center p-6 rounded-3xl bg-luna-midnight/40 border border-luna-aqua/5 group hover:border-luna-aqua/20 transition-all">
                     <p className="text-3xl font-black text-white tracking-tighter mb-1 leading-none group-hover:text-luna-aqua transition-colors">99.8</p>
                     <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Trust Index</p>
                  </div>
                  <div className="text-center p-6 rounded-3xl bg-luna-midnight/40 border border-luna-aqua/5 group hover:border-luna-aqua/20 transition-all">
                     <p className="text-3xl font-black text-white tracking-tighter mb-1 leading-none group-hover:text-luna-cyan transition-colors">4.2</p>
                     <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Clearance</p>
                  </div>
               </div>
            </div>
          </motion.div>

          <div className="luna-card !p-10 border-luna-aqua/5 relative overflow-hidden group">
             <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <ShieldCheck size={120} />
             </div>
             <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
               Security Metadata <Fingerprint size={14} className="text-luna-aqua" />
             </h3>
             <div className="space-y-8">
                <SecurityRow label="Multi-Factor Auth" value="Optimal" active />
                <SecurityRow label="Global Sync" value="Updated" active />
                <SecurityRow label="Access Latency" value="0.04ms" />
             </div>
          </div>
        </div>

        {/* Right Panel: Advanced Controls */}
        <div className="xl:col-span-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <IntelligencePanel icon={<CreditCard size={24} />} label="Personnel UID" value={user?.id || 'SYN-000-000'} isMono />
             <IntelligencePanel icon={<ShieldCheck size={24} />} label="Authorization Class" value={user?.role === 'ADMIN' ? 'Executive Alpha' : 'Member Standard'} />
             <IntelligencePanel icon={<Zap size={24} />} label="Directory State" value="Verified & Active" color="text-luna-aqua" />
             <IntelligencePanel icon={<Layers size={24} />} label="Infrastructure Access" value="Full Suite Enabled" />
          </div>

          <div className="luna-card !p-0 overflow-hidden">
             <div className="px-10 py-8 border-b border-luna-aqua/10 bg-luna-midnight/40 flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-black text-white tracking-tight">System Configuration</h3>
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Operational Environment Settings</p>
                </div>
                <Sparkles size={20} className="text-luna-aqua/20" />
             </div>
             <div className="p-10 space-y-6">
                <SettingsToggle icon={<Bell size={20} />} label="Real-time Operational Intel" active />
                <SettingsToggle icon={<Lock size={20} />} label="Extended Identity Audit" active />
                <SettingsToggle icon={<Activity size={20} />} label="High-Fidelity Telemetry Logging" />
                <SettingsToggle icon={<Globe size={20} />} label="Global CDN Synchronization" active />
             </div>
          </div>

          <div className="luna-card bg-gradient-to-br from-luna-steel/10 to-transparent !p-12 group relative overflow-hidden">
             <div className="absolute right-0 top-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity translate-x-12 -translate-y-12">
                <Building2 size={320} />
             </div>
             <div className="relative z-10">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                  Quick Navigation <ArrowRight size={16} className="text-luna-aqua" />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <ModuleShortcut 
                     onClick={() => navigate('/facilities')}
                     title="Asset System"
                     desc="Browse campus infrastructure portfolio."
                     icon={<Building2 size={24} />}
                   />
                   <ModuleShortcut 
                     onClick={() => navigate('/tickets')}
                     title="Incident Archive"
                     desc="Review synchronized support records."
                     icon={<Layers size={24} />}
                   />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Identity Refinement Modal */}
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
    </div>
  );
}

function SecurityRow({ label, value, active }) {
  return (
    <div className="flex items-center justify-between p-6 rounded-2xl bg-luna-midnight/60 border border-luna-aqua/5 group hover:border-luna-aqua/20 transition-all">
       <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{label}</span>
       <div className="flex items-center gap-3">
          {active && <div className="w-1.5 h-1.5 rounded-full bg-luna-aqua animate-pulse" />}
          <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-luna-aqua' : 'text-white'}`}>{value}</span>
       </div>
    </div>
  );
}

function IntelligencePanel({ icon, label, value, isMono, color = "text-white" }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="luna-card group hover:border-luna-aqua/30 transition-all !p-8"
    >
      <div className="w-12 h-12 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua mb-6 group-hover:luna-glow transition-all">
        {icon}
      </div>
      <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-2">{label}</p>
      <p className={`text-lg font-black truncate tracking-tight ${color} ${isMono ? 'font-mono text-base' : ''}`}>
        {value}
      </p>
    </motion.div>
  );
}

function SettingsToggle({ icon, label, active = false }) {
  return (
    <div className="flex items-center justify-between p-6 rounded-3xl bg-luna-midnight/40 border border-luna-aqua/5 group hover:bg-luna-aqua/5 transition-all">
      <div className="flex items-center gap-6">
        <div className="text-luna-aqua group-hover:luna-glow transition-all shrink-0">
          {icon}
        </div>
        <span className="text-sm font-black text-white tracking-tight group-hover:text-luna-aqua transition-colors">{label}</span>
      </div>
      <div className={`w-14 h-7 rounded-full p-1.5 transition-all cursor-pointer ${active ? 'bg-luna-aqua' : 'bg-luna-steel/20'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-lg ${active ? 'translate-x-7' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}

function ModuleShortcut({ onClick, title, desc, icon }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-luna-midnight/60 border border-luna-aqua/5 group hover:border-luna-aqua/30 transition-all text-left"
    >
       <div className="w-16 h-16 luna-glass rounded-3xl flex items-center justify-center text-luna-aqua group-hover:luna-glow group-hover:rotate-6 transition-all duration-500">
          {icon}
       </div>
       <div className="min-w-0">
          <h4 className="text-xl font-black text-white tracking-tight group-hover:text-luna-aqua transition-colors">{title}</h4>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-2 group-hover:text-white transition-colors">{desc}</p>
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
      setTimeout(() => onSuccess(data.token, { username: data.username, email: data.email, role: data.role }), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Identity synchronization failure.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-luna-midnight/95 backdrop-blur-2xl flex items-center justify-center z-50 px-8"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="luna-card w-full max-w-xl border-luna-aqua/20 !p-0 overflow-hidden shadow-2xl shadow-luna-aqua/20"
      >
        <div className="p-12 border-b border-luna-aqua/10 bg-luna-midnight/60 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter">Identity Sync</h3>
            <p className="text-[9px] font-black text-luna-aqua uppercase tracking-[0.4em] mt-2">Record Modification Procedure</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-luna-aqua/10 text-luna-aqua flex items-center justify-center hover:bg-luna-aqua hover:text-luna-midnight transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-12">
           {success ? (
             <div className="text-center py-20">
                <motion.div 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="w-24 h-24 bg-luna-aqua/10 text-luna-aqua rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-luna-aqua/20 luna-glow shadow-xl shadow-luna-aqua/10"
                >
                   <CheckCircle2 size={48} />
                </motion.div>
                <p className="text-2xl font-black text-white tracking-tight uppercase tracking-[0.2em]">Record Updated</p>
             </div>
           ) : (
             <form onSubmit={handleSubmit} className="space-y-10">
               {error && (
                 <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-[10px] font-black text-red-400 uppercase tracking-[0.2em] flex items-center gap-4">
                   <Zap size={18} /> {error}
                 </div>
               )}
               
               <div className="group">
                 <label className="luna-label !ml-2">Personnel Identifier</label>
                 <div className="relative">
                   <User className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                   <input
                     type="text"
                     name="username"
                     value={form.username}
                     onChange={handleChange}
                     className="luna-input !pl-16 !py-5"
                     required
                   />
                 </div>
               </div>
               
               <div className="group">
                 <label className="luna-label !ml-2">Secure Email Channel</label>
                 <div className="relative">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                   <input
                     type="email"
                     name="email"
                     value={form.email}
                     onChange={handleChange}
                     className="luna-input !pl-16 !py-5"
                     required
                   />
                 </div>
               </div>

               <div className="flex gap-8 pt-8">
                 <button type="button" onClick={onClose} className="flex-1 luna-button-outline !py-5 text-[10px] font-black uppercase tracking-[0.3em]">
                   Abort
                 </button>
                 <button type="submit" disabled={submitting} className="flex-1 luna-button !py-5 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-luna-aqua/10">
                   {submitting ? 'Transmitting...' : 'Confirm Sync'}
                 </button>
               </div>
             </form>
           )}
        </div>
      </motion.div>
    </motion.div>
  );
}
