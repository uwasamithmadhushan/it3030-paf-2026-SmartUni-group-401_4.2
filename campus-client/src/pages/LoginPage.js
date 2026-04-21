import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser, googleLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/dashboard';

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
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
      const { data } = await loginUser(form);
      login(data.token, { id: data.id, username: data.username, email: data.email, role: data.role });
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.response?.status === 401 ? 'Invalid credentials.' : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-plum-dark flex items-center justify-center p-6 relative overflow-hidden font-['Outfit']">
      {/* Premium Background Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-deep/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-mauve-dusty/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10 animate-luxury">
        <div className="bg-wine-muted/20 backdrop-blur-3xl rounded-luxury shadow-luxury border border-ivory-warm/10 p-10 lg:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-mauve-dusty to-wine-muted rounded-3xl mb-6 shadow-soft">
              <svg className="w-10 h-10 text-ivory-warm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-ivory-warm tracking-tight">Luxury Entry</h1>
            <p className="text-sm font-medium text-blush-soft mt-2 uppercase tracking-widest">Smart Campus Concierge</p>
          </div>

          {serverError && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-bold text-rose-400 flex items-center gap-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-blush-soft uppercase tracking-widest mb-2 ml-4">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Ex: beauty.admin"
                className="luxury-input"
              />
              {errors.username && <p className="mt-2 text-[10px] font-bold text-rose-400 ml-4">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black text-blush-soft uppercase tracking-widest mb-2 ml-4">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="luxury-input"
              />
              {errors.password && <p className="mt-2 text-[10px] font-bold text-rose-400 ml-4">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full luxury-button mt-4"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          <p className="text-center text-xs font-medium text-ivory-warm/40 mt-8">
            New here?{' '}
            <Link to="/register" className="text-blush-soft font-black hover:text-ivory-warm transition-colors underline decoration-ivory-warm/20 underline-offset-4">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
