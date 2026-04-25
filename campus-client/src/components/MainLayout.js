import { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-luna-midnight flex font-['Outfit']" style={{ overflow: 'hidden' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-luna-steel/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-luna-cyan/10 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0 h-screen lg:ml-72 relative" style={{ overflow: 'hidden' }}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 luna-glass border-b border-luna-aqua/10 z-50 shrink-0">
          <button onClick={toggleSidebar} className="text-luna-aqua">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <span className="text-white font-black tracking-widest uppercase text-xs">Smart<span className="text-luna-aqua">Uni</span></span>
          <div className="w-8 h-8 rounded-lg bg-luna-steel flex items-center justify-center text-xs font-bold text-white luna-glow">
            {user?.username?.substring(0, 1).toUpperCase()}
          </div>
        </div>

        {/* Desktop Premium Header */}
        <header className="hidden lg:flex px-8 h-20 items-center justify-between luna-glass border-b border-luna-aqua/5 shrink-0 z-40">
          <div className="relative w-96">
            <svg className="w-4 h-4 text-luna-aqua/40 absolute left-4 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Luna Search..."
              className="luna-input pl-11"
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-luna-steel to-luna-navy flex items-center justify-center font-bold text-white text-sm shadow-soft group-hover:shadow-lg transition-all luna-glow">
                  {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white leading-tight">{user?.username || 'Guest'}</span>
                  <span className="text-[9px] font-black text-luna-aqua uppercase tracking-wider">{user?.role || 'User'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 lg:p-8 relative"
          style={{ scrollbarGutter: 'stable', overflowAnchor: 'none' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
