import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Asset List', icon: '🏛️' },
  { to: '/add', label: 'Add Asset', icon: '➕' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col shadow-lg shrink-0">
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-xl font-bold tracking-wide text-indigo-400">Smart Campus</h1>
        <p className="text-xs text-gray-400 mt-1">Operations Hub</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
          Module A — Facilities
        </p>
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">Smart Campus v1.0</p>
      </div>
    </aside>
  );
}
