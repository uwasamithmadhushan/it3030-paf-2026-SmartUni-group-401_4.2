import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ toggleSidebar }) {
  const { user } = useAuth();
  
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 lg:hidden">
      <div className="px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <span className="font-black text-slate-900 tracking-tight">SmartUni</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-xs">
            {user?.username?.charAt(0).toUpperCase()}
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

          {user?.role !== 'ADMIN' && (
            <NavLink
              to="/bookings/my"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              📅 Bookings
            </NavLink>
          )}

          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin/bookings"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              🗂️ Manage Bookings
            </NavLink>
          )}
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
