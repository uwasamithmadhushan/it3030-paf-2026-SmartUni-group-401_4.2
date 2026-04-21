import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'USER' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
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
      await registerUser(form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setServerError('Registration failed. Identity already exists or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-plum-dark flex items-center justify-center p-6 relative overflow-hidden font-['Outfit']">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-deep/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-wine-muted/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-lg relative z-10 animate-luxury">
        <div className="bg-wine-muted/20 backdrop-blur-3xl rounded-luxury shadow-luxury border border-ivory-warm/10 p-10 lg:p-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-ivory-warm tracking-tighter">New Membership</h1>
            <p className="text-sm font-medium text-blush-soft mt-2 uppercase tracking-widest">Join the SmartUni Executive Tier</p>
          </div>

          {serverError && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-bold text-rose-400">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-blush-soft uppercase tracking-widest mb-1 ml-4">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Ex: beauty.admin"
                    className="luxury-input"
                  />
                  {errors.username && <p className="mt-1 text-[9px] font-bold text-rose-400 ml-4">{errors.username}</p>}
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-blush-soft uppercase tracking-widest mb-1 ml-4">Account Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="luxury-input cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
               </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-blush-soft uppercase tracking-widest mb-1 ml-4">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@excellence.com"
                className="luxury-input"
              />
              {errors.email && <p className="mt-1 text-[9px] font-bold text-rose-400 ml-4">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-blush-soft uppercase tracking-widest mb-1 ml-4">Secure Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="luxury-input"
              />
              {errors.password && <p className="mt-1 text-[9px] font-bold text-rose-400 ml-4">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full luxury-button mt-4"
            >
              {loading ? 'Creating Identity...' : 'Confirm Registration'}
            </button>
          </form>

          <p className="text-center text-xs font-medium text-ivory-warm/40 mt-8">
            Already a member?{' '}
            <Link to="/login" className="text-blush-soft font-black hover:text-ivory-warm transition-colors underline decoration-ivory-warm/20 underline-offset-4">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
