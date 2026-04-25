import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginWithGoogle } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Zap,
  Globe,
  Layers,
  ChevronRight,
  Activity
} from 'lucide-react';

const ROLES = [
  { value: 'USER', label: 'Student Hub', desc: 'Personal resource monitoring' },
  { value: 'TECHNICIAN', label: 'Field Specialist', desc: 'Operational mission dispatch' },
  { value: 'ADMIN', label: 'System Executive', desc: 'Global infrastructure oversight' }
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'USER' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const { data } = await loginWithGoogle(credentialResponse.credential);
      login(data.token, { id: data.id, username: data.username, email: data.email, role: data.role });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setServerError('Google Login was unsuccessful. Please try again.');
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Identity identifier required';
    if (!form.email.trim()) e.email = 'Secure email channel required';
    if (!form.password) e.password = 'Security token required';
    return e;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    try {
      const response = await registerUser(form);
      if (response.data?.pending) {
        navigate('/login', { state: { pendingApproval: true } });
      } else {
        navigate('/login', { state: { registered: true } });
      }
    } catch (err) {
      if (err.response?.status === 409) {
        const msg = err.response?.data?.message || '';
        if (msg.toLowerCase().includes('email')) {
          setErrors((e) => ({ ...e, email: 'This email is already registered.' }));
        } else if (msg.toLowerCase().includes('username')) {
          setErrors((e) => ({ ...e, username: 'This username is already taken.' }));
        } else {
          setServerError('Username or email already in use.');
        }
      } else {
        setServerError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luna-midnight flex items-center justify-center p-8 relative overflow-hidden">
      
      {/* Superior Background Pulse */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-luna-aqua blur-[160px]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.02, 0.06, 0.02] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-luna-cyan blur-[160px]" 
        />
      </div>

      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Mission Context */}
        <div className="lg:col-span-5 space-y-12 hidden lg:block">
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
           >
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-2 h-2 rounded-full bg-luna-aqua animate-pulse" />
                 <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.4em]">Protocol Initialize</span>
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-8">
                SmartUni <span className="text-luna-aqua">Registry</span>
              </h1>
              <p className="text-text-muted text-xl font-medium leading-relaxed max-w-md border-l-2 border-luna-aqua/20 pl-8">
                Synchronize your identity with the SmartUni high-end infrastructure matrix. Access state-of-the-art campus intelligence.
              </p>
           </motion.div>

           <div className="space-y-6">
              <IdentityFeature icon={<ShieldCheck size={20} />} label="Encrypted Sync" />
              <IdentityFeature icon={<Globe size={20} />} label="Universal Login" />
              <IdentityFeature icon={<Zap size={20} />} label="Velocity Dispatch" />
           </div>

           <div className="pt-12 border-t border-luna-aqua/10">
              <div className="flex items-center gap-4 text-white/20">
                 <Globe size={24} />
                 <Layers size={24} />
                 <Activity size={24} />
              </div>
           </div>
        </div>

        {/* Right Side: Registration Portal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-7 luna-card !p-0 overflow-hidden shadow-2xl shadow-luna-aqua/10 backdrop-blur-3xl !bg-luna-midnight/80 border-luna-aqua/10"
        >
          {/* Form Header */}
          <div className="bg-luna-midnight/40 px-12 py-10 border-b border-luna-aqua/10 flex justify-between items-center">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua luna-glow border-luna-aqua/20">
                   <UserPlus size={24} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white tracking-tight">Register</h2>
                   <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">Operator Profile Calibration</p>
                </div>
             </div>
             <Sparkles className="text-luna-aqua/20" size={32} />
          </div>

          <form onSubmit={handleSubmit} className="p-12 space-y-10">
            <AnimatePresence mode="wait">
              {serverError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-[10px] font-black text-red-400 uppercase tracking-[0.2em] flex items-center gap-4"
                >
                  <ShieldAlert size={18} />
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="group">
                  <label className="luna-label !ml-2">Username</label>
                  <div className="relative">
                     <User className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={18} />
                     <input
                       type="text"
                       name="username"
                       value={form.username}
                       onChange={handleChange}
                       placeholder="Identity identifier..."
                       className="luna-input !pl-16 !py-4"
                     />
                  </div>
                  {errors.username && <p className="mt-2 text-[9px] font-black text-red-400 uppercase tracking-widest ml-2">{errors.username}</p>}
               </div>

               <div className="group">
                  <label className="luna-label !ml-2">User Type</label>
                  <div className="relative">
                     <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={18} />
                     <select
                       name="role"
                       value={form.role}
                       onChange={handleChange}
                       className="luna-input !pl-16 !py-4 appearance-none cursor-pointer"
                     >
                       {ROLES.map((r) => (
                         <option key={r.value} value={r.value} className="bg-luna-midnight text-white">{r.label}</option>
                       ))}
                     </select>
                  </div>
               </div>
            </div>

            <div className="group">
              <label className="luna-label !ml-2">Email</label>
              <div className="relative">
                 <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={18} />
                 <input
                   type="email"
                   name="email"
                   value={form.email}
                   onChange={handleChange}
                   placeholder="secure.comms@nexus.com"
                   className="luna-input !pl-16 !py-4"
                 />
              </div>
              {errors.email && <p className="mt-2 text-[9px] font-black text-red-400 uppercase tracking-widest ml-2">{errors.email}</p>}
            </div>

            <div className="group">
              <label className="luna-label !ml-2">Password</label>
              <div className="relative">
                 <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={18} />
                 <input
                   type="password"
                   name="password"
                   value={form.password}
                   onChange={handleChange}
                   placeholder="••••••••••••"
                   className="luna-input !pl-16 !py-4"
                 />
              </div>
              {errors.password && <p className="mt-2 text-[9px] font-black text-red-400 uppercase tracking-widest ml-2">{errors.password}</p>}
            </div>

            <div className="pt-8">
               <button
                 type="submit"
                 disabled={loading}
                 className="w-full luna-button !py-5 shadow-2xl shadow-luna-aqua/20 group relative overflow-hidden"
               >
                 <span className="relative z-10 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em]">
                   {loading ? 'Registering...' : 'Register'}
                   {!loading && <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />}
                 </span>
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
               </button>
            </div>

            <div className="relative my-10">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-luna-aqua/5"></div></div>
               <div className="relative flex justify-center text-[10px] font-black tracking-[0.5em] uppercase">
                 <span className="bg-luna-midnight px-8 text-text-muted border border-luna-aqua/10 rounded-full py-2">Or Register With</span>
               </div>
            </div>

            <div className="flex justify-center">
               <GoogleLogin
                 onSuccess={handleGoogleSuccess}
                 onError={handleGoogleFailure}
                 theme="filled_black"
                 shape="pill"
                 size="large"
                 text="signup_with"
               />
            </div>

            <div className="text-center pt-8 mt-8 border-t border-luna-aqua/5">
               <p className="text-xs font-medium text-text-muted">
                 Existing Operator?{' '}
                 <Link to="/login" className="text-luna-aqua font-black hover:text-white transition-colors flex items-center justify-center gap-2 mt-4 uppercase tracking-[0.2em] group">
                   Sign In To Portal <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
               </p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Security Status Line */}
      <div className="fixed bottom-10 right-10 flex items-center gap-6 opacity-30 pointer-events-none">
         <div className="flex items-center gap-3">
            <Zap size={14} className="text-luna-aqua" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Audit Active</span>
         </div>
         <div className="w-1 h-1 rounded-full bg-white/20" />
         <div className="flex items-center gap-3">
            <ShieldCheck size={14} className="text-luna-aqua" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">System Verified</span>
         </div>
      </div>
    </div>
  );
}

const IdentityFeature = ({ icon, label }) => (
  <motion.div 
    whileHover={{ x: 10 }}
    className="flex items-center gap-4 p-5 rounded-3xl bg-luna-midnight/40 border border-luna-aqua/5 hover:border-luna-aqua/20 transition-all cursor-default group"
  >
     <div className="w-10 h-10 luna-glass rounded-xl flex items-center justify-center text-luna-aqua group-hover:luna-glow transition-all shrink-0">
        {icon}
     </div>
     <span className="text-sm font-black text-white uppercase tracking-widest">{label}</span>
  </motion.div>
);
