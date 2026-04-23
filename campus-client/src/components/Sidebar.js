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
  ShieldAlert,
  CheckCircle,
  Bell,
  Activity,
  User,
  Settings
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
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ to: '/resources', label: 'Resource Catalogue', icon: <Building2 size={20} /> });
    navItems.push({ to: '/tickets', label: 'Incident Queue', icon: <Ticket size={20} /> });
    navItems.push({ to: '/admin/users', label: 'User Control', icon: <Users size={20} /> });
    navItems.push({ to: '/notifications', label: 'Notifications', icon: <Bell size={20} /> });
  } else if (user?.role === 'TECHNICIAN') {
    navItems.push(
      { to: '/assignments', label: 'My Jobs', icon: <ShieldAlert size={20} /> },
      { to: '/tickets', label: 'Incident Queue', icon: <Ticket size={20} /> },
      { to: '/schedule', label: 'Schedule', icon: <Calendar size={20} /> },
      { to: '/notifications', label: 'Notifications', icon: <Bell size={20} /> },
      { to: '/performance', label: 'Performance', icon: <Activity size={20} /> },
      { to: '/profile', label: 'My Profile', icon: <User size={20} /> }
    );
  } else {
    // USER role
    navItems.push({ to: '/resources', label: 'Resource Catalogue', icon: <Building2 size={20} /> });
    navItems.push({ to: '/tickets', label: 'My Requests', icon: <Ticket size={20} /> });
  }

  // Only show reservations for non-technicians
  if (user?.role !== 'TECHNICIAN') {
    navItems.push({ to: '/bookings', label: 'Reservations', icon: <Calendar size={20} /> });
  }

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
        className={`fixed top-0 left-0 h-full w-72 luna-sidebar z-50 flex flex-col lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-500 ease-in-out border-r border-white/5`}
      >
        <div className="p-10">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 1, type: 'spring' }}
              className="w-12 h-12 bg-gradient-to-br from-luna-steel to-luna-navy rounded-2xl flex items-center justify-center shadow-lg border border-luna-aqua/20 luna-glow"
            >
               <ShieldAlert className="w-6 h-6 text-luna-aqua" />
            </motion.div>
            <div>
              <h1 className="text-white font-black text-xl tracking-tighter leading-none">Smart<span className="text-luna-aqua">Uni</span></h1>
              <p className="text-[10px] font-black text-luna-cyan uppercase tracking-[0.4em] mt-1 opacity-40">Enterprise</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
              className={({ isActive }) => 
                `luna-nav-link group ${isActive ? 'active !text-luna-aqua bg-luna-aqua/5 border-luna-aqua/10' : 'text-text-muted hover:text-white'}`
              }
            >
              <span className="transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
              <span className="flex-1 lowercase first-letter:uppercase tracking-tight font-black">{item.label}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-luna-aqua opacity-0 group-[.active]:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="flex items-center justify-between luna-glass-dark p-5 rounded-3xl border-white/5 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-luna-navy to-luna-midnight flex items-center justify-center text-luna-aqua font-black border border-luna-aqua/10 shadow-inner group-hover:luna-glow transition-all">
                {user?.username?.substring(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">{user?.username}</p>
                <p className="text-[9px] font-black text-luna-cyan uppercase tracking-widest opacity-40">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
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
