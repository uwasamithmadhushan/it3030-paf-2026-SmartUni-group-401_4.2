import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { to: '/facilities', label: 'Facilities', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )},
    { to: '/tickets', label: 'Incident Tickets', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    )},
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ to: '/admin/users', label: 'User Management', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )});
  } else if (user?.role === 'TECHNICIAN') {
    navItems.push({ to: '/assignments', label: 'My Assignments', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )});
  }

  const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-plum-dark/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        className={`fixed top-0 left-0 h-full w-72 bg-violet-deep border-r border-ivory-warm/10 z-50 flex flex-col lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Section */}
        <div className="p-8 border-b border-ivory-warm/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-mauve-dusty to-wine-muted rounded-xl flex items-center justify-center shadow-soft">
               <svg className="w-6 h-6 text-ivory-warm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
               </svg>
            </div>
            <div>
              <h1 className="text-ivory-warm font-black text-lg tracking-tight">SmartUni</h1>
              <p className="text-[10px] font-black text-blush-soft uppercase tracking-[0.2em]">Luxury Campus</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => toggleSidebar()}
              className={({ isActive }) => 
                `flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group ${
                  isActive 
                    ? 'bg-blush-soft text-plum-dark shadow-luxury' 
                    : 'text-ivory-warm/60 hover:text-ivory-warm hover:bg-white/5'
                }`
              }
            >
              <span className="transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-6 border-t border-ivory-warm/5 bg-plum-dark/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-wine-muted flex items-center justify-center text-ivory-warm font-bold border border-ivory-warm/10">
                {user?.username?.substring(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-ivory-warm truncate">{user?.username}</p>
                <p className="text-[9px] font-bold text-blush-soft uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/5 text-ivory-warm/40 hover:bg-rose-500/20 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30"
              title="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
