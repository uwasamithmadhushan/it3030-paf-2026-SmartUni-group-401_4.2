import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Ticket, 
  Users, 
  Calendar, 
  LogOut, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/resources', label: 'Resource Catalogue', icon: <Building2 size={20} /> },
    { to: '/tickets', label: 'Incident Tickets', icon: <Ticket size={20} /> },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ to: '/admin/users', label: 'User Control', icon: <Users size={20} /> });
  } else if (user?.role === 'TECHNICIAN') {
    navItems.push({ to: '/assignments', label: 'My Jobs', icon: <ShieldAlert size={20} /> });
  }

  navItems.push({ to: '/bookings', label: 'Reservations', icon: <Calendar size={20} /> });

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-luna-midnight/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        className={`fixed top-0 left-0 h-full w-72 luna-sidebar z-50 flex flex-col lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-500 ease-in-out`}
      >
        <div className="p-8">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
              className="w-12 h-12 bg-gradient-to-br from-luna-steel to-luna-navy rounded-2xl flex items-center justify-center shadow-lg border border-luna-aqua/20 luna-glow"
            >
               <ShieldAlert className="w-6 h-6 text-luna-aqua" />
            </motion.div>
            <div>
              <h1 className="text-white font-black text-xl tracking-tighter leading-none">Smart<span className="text-luna-aqua">Uni</span></h1>
              <p className="text-[10px] font-black text-luna-cyan uppercase tracking-[0.3em] mt-1">Enterprise</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
              className={({ isActive }) => 
                `luna-nav-link group ${isActive ? 'active' : ''}`
              }
            >
              <span className="transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-luna-aqua/5 bg-luna-midnight/40">
          <div className="flex items-center justify-between luna-glass p-4 rounded-3xl border-luna-aqua/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-luna-navy to-luna-midnight flex items-center justify-center text-luna-aqua font-black border border-luna-aqua/10 shadow-inner">
                {user?.username?.substring(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">{user?.username}</p>
                <p className="text-[9px] font-bold text-luna-cyan uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-luna-aqua/5 text-luna-aqua hover:bg-red-500/20 hover:text-red-400 transition-all border border-luna-aqua/10 hover:border-red-500/30"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
