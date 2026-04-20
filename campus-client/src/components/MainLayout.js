import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { getAllTickets } from '../services/api';

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [readNotifs, setReadNotifs] = useState(() => {
    const saved = localStorage.getItem('read_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { data } = await getAllTickets();
        const myTickets = data.filter(t => t.assignedTechnicianId === user?.id);
        setTickets(myTickets);
      } catch (e) {
        console.error("Notif fetch failed");
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const notifications = useMemo(() => {
    return tickets
      .filter(t => !readNotifs.includes(t.id))
      .map(t => ({
        id: t.id,
        title: 'New Task Assigned',
        message: `${t.title} in ${t.location}`,
        time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      }));
  }, [tickets, readNotifs]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    const updated = [...readNotifs, id];
    setReadNotifs(updated);
    localStorage.setItem('read_notifications', JSON.stringify(updated));
    navigate(`/tickets/${id}`);
    setIsNotifOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden lg:ml-72">
        <Header toggleSidebar={toggleSidebar} />
        
        <header className="hidden lg:flex px-8 h-20 items-center justify-between bg-white border-b border-slate-100 shrink-0">
          <div className="relative w-96">
            <svg className="w-4 h-4 text-gray-400 absolute left-4 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search for resources, tickets..." 
              className="w-full pl-11 pr-4 py-2.5 bg-[#F8FAFC] border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 transition-shadow outline-none text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-6">
            {/* ... rest of header ... */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-xl transition-all ${isNotifOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-up z-50">
                  <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900">Notifications</span>
                    {unreadCount > 0 && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-all flex gap-3 ${!n.read ? 'bg-indigo-50/30' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!n.read ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs ${!n.read ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>{n.title}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">{n.message}</p>
                            <p className="text-[9px] font-black text-slate-300 uppercase mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                           <svg className="w-6 h-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </div>
                        <p className="text-xs font-bold text-slate-400">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate('/profile')}
              >
                <div className="w-10 h-10 rounded-xl bg-[#22C55E] flex items-center justify-center font-bold text-white text-sm shadow-sm group-hover:shadow-md transition-shadow">
                  {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">{user?.username || 'User'}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user?.role || 'USER'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
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
