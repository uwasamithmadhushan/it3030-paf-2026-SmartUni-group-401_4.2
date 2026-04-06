import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <NavLink to="/dashboard" className="flex items-center gap-2 text-indigo-600 font-bold text-lg hover:opacity-80 transition">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          Smart Campus
        </NavLink>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <NavLink
            to="/facilities"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            🏛️ Facility
          </NavLink>

          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed select-none"
            title="Coming soon"
            disabled
          >
            📅 Bookings
          </button>
        </nav>

        {/* User area */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-gray-500 hidden sm:block">
              {user.username}
              <span className="ml-2 text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {user.role}
              </span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
