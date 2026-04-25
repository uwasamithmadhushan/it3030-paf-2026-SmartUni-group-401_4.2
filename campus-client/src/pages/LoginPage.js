import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser, loginWithGoogle } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck,
  Globe,
  Zap,
  Activity,
  Shield
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = '/dashboard';

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Identity identifier required';
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
      const { data } = await loginUser(form);
      login(data.token, { id: data.id, username: data.username, email: data.email, role: data.role });
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.response?.status === 401 ? 'Identity verification failed.' : 'System synchronization error.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const { data } = await loginWithGoogle(credentialResponse.credential);
      login(data.token, { id: data.id, username: data.username, email: data.email, role: data.role });
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setServerError('Google Login was unsuccessful. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden bg-luna-midnight">
      
      {/* Dynamic Background Pulse */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-luna-aqua blur-[160px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.03, 0.08, 0.03]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-luna-cyan blur-[160px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "circOut" }}
        className="w-full max-w-xl luna-card relative z-10 p-16 overflow-hidden !bg-luna-midnight/80 backdrop-blur-3xl border-luna-aqua/10"
      >
        {/* Superior Status Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luna-aqua to-transparent luna-glow" />
        
        <div className="flex flex-col items-center text-center mb-14">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 1 }}
            className="w-24 h-24 luna-glass rounded-[2rem] flex items-center justify-center mb-8 border-luna-aqua/20 luna-glow shadow-2xl shadow-luna-aqua/20"
          >
            <ShieldCheck className="w-12 h-12 text-luna-aqua" />
          </motion.div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-2 h-2 rounded-full bg-luna-aqua animate-pulse" />
             <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.4em]">Secure Gateway Active</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none">
            Smart<span className="text-luna-aqua">Uni</span> <span className="text-white/20">Nexus</span>
          </h1>
          <p className="text-text-muted font-medium text-lg uppercase tracking-widest opacity-60">High-End Identity Access</p>
        </div>

        <AnimatePresence mode="wait">
          {serverError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-10 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-xs font-black text-red-400 flex items-center gap-4 uppercase tracking-widest"
            >
              <Shield className="w-5 h-5 shrink-0" />
              {serverError}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-8">
            <div className="group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-2 mb-4 block group-focus-within:text-luna-aqua transition-all">
                Access Identifier
              </label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter credential ID..."
                  className="luna-input !pl-16 !py-5 !rounded-2xl"
                />
              </div>
              {errors.username && <p className="text-[10px] font-black text-red-400 ml-2 mt-2 uppercase tracking-widest">{errors.username}</p>}
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-2 mb-4 block group-focus-within:text-luna-aqua transition-all">
                Security Token
              </label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="luna-input !pl-16 !pr-16 !py-5 !rounded-2xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted hover:text-luna-aqua transition-all focus:outline-none"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] font-black text-red-400 ml-2 mt-2 uppercase tracking-widest">{errors.password}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
             <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-5 h-5 rounded-md border border-luna-aqua/20 bg-luna-midnight flex items-center justify-center group-hover:border-luna-aqua transition-all">
                   <div className="w-2.5 h-2.5 rounded-sm bg-luna-aqua opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest group-hover:text-white transition-all">Persistence Mode</span>
             </label>
             <button type="button" className="text-[10px] font-black text-luna-aqua uppercase tracking-widest hover:text-white transition-all">Token Recovery</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full luna-button !py-5 shadow-2xl shadow-luna-aqua/20 relative overflow-hidden group"
          >
            <motion.div 
              initial={false}
              animate={{ x: loading ? 20 : 0 }}
              className="relative z-10 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em]"
            >
              {loading ? 'Verifying Identity...' : 'Initiate Session'}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />}
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </button>
        </form>

        <div className="flex justify-center">
           <GoogleLogin
             onSuccess={handleGoogleSuccess}
             onError={handleGoogleFailure}
             theme="filled_black"
             shape="pill"
             size="large"
             text="signin_with"
           />
        </div>

        <p className="text-center text-sm font-medium text-text-muted mt-14">
          New to the Nexus?{' '}
          <Link to="/register" className="text-luna-aqua font-black hover:text-white transition-colors underline underline-offset-8 decoration-luna-aqua/30 tracking-tight">
            Register Operator Identity
          </Link>
        </p>
      </motion.div>

      {/* Superior Status Footer */}
      <div className="fixed bottom-8 left-8 flex items-center gap-6 opacity-30">
         <div className="flex items-center gap-3">
            <Zap size={14} className="text-luna-aqua" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Quantum Encrypted</span>
         </div>
         <div className="flex items-center gap-3">
            <Activity size={14} className="text-luna-aqua" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Live Node: 401.X</span>
         </div>
      </div>
    </div>
  );
}
