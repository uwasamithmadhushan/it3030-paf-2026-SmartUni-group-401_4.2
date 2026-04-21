import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [readNotifs, setReadNotifs] = useState(() => {
    const saved = localStorage.getItem('read_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-plum-dark flex overflow-hidden font-['Outfit']">
      {/* Sidebar - Always visible on desktop, slide-in on mobile */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden lg:ml-72 relative">
        {/* Mobile Header (Overlay) */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-violet-deep/80 backdrop-blur-md border-b border-ivory-warm/10 z-50">
          <button onClick={toggleSidebar} className="text-ivory-warm">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
             </svg>
          </button>
          <span className="text-ivory-warm font-bold tracking-widest uppercase text-xs">Smart Campus</span>
          <div className="w-8 h-8 rounded-lg bg-mauve-dusty flex items-center justify-center text-xs font-bold text-ivory-warm">
            {user?.username?.substring(0, 1).toUpperCase()}
          </div>
        </div>
        
        {/* Desktop Premium Header */}
        <header className="hidden lg:flex px-8 h-20 items-center justify-between bg-violet-deep/40 backdrop-blur-md border-b border-ivory-warm/5 shrink-0 z-40">
          <div className="relative w-96">
            <svg className="w-4 h-4 text-ivory-warm/40 absolute left-4 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Luxury search..." 
              className="w-full pl-11 pr-4 py-2.5 bg-plum-dark/40 border border-ivory-warm/10 rounded-xl text-sm focus:ring-2 focus:ring-blush-soft/30 transition-all outline-none text-ivory-warm placeholder:text-ivory-warm/30"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button className="p-2 rounded-xl text-ivory-warm/60 hover:text-ivory-warm hover:bg-white/5 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>

            <div className="relative">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mauve-dusty to-wine-muted flex items-center justify-center font-bold text-ivory-warm text-sm shadow-soft group-hover:shadow-luxury transition-all">
                  {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-ivory-warm leading-tight">{user?.username || 'Guest'}</span>
                  <span className="text-[9px] font-black text-blush-soft uppercase tracking-wider">{user?.role || 'User'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
