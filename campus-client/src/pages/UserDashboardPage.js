import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, getMyBookings, getMyTickets } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Plus, 
  ArrowRight, 
  Calendar, 
  Ticket, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function UserDashboardPage() {
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, bookingsRes, ticketsRes] = await Promise.all([
        getMe(),
        getMyBookings(),
        getMyTickets()  // Only fetch this user's own tickets
      ]);
      setUserData(userRes.data);
      setBookings(bookingsRes.data);
      setTickets(ticketsRes.data);  // Backend already filters by user
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) return <LoadingSpinner fullScreen message="Synthesizing Personal Hub..." />;

  const stats = [
    { label: 'Active Reports', value: tickets.filter(t => t.status !== 'RESOLVED').length, icon: Ticket, trend: 'Field action pending', color: 'luna-aqua' },
    { label: 'Reservations', value: bookings.length, icon: Calendar, trend: 'Scheduled access', color: 'luna-cyan' },
    { label: 'System Sync', value: 'Optimal', icon: Activity, trend: 'Stable state', color: 'white' },
    { label: 'Resolved', value: tickets.filter(t => t.status === 'RESOLVED').length, icon: CheckCircle2, trend: 'Archived cases', color: 'luna-steel' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      
      {/* Student Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
           <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <Sparkles size={12} className="text-luna-aqua" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-widest">Active Workspace</span>
              </div>
           </div>
           <h1 className="text-5xl font-black text-white tracking-tighter">
             Hi!, <span className="text-luna-aqua">{userData?.username}</span>
           </h1>
           <p className="text-text-muted font-medium mt-2 text-lg">Welcome back to your high-end personal campus command.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
           <button onClick={() => navigate('/resources')} className="luna-button-outline !px-8">
             Browse Assets
           </button>
           <button onClick={() => navigate('/tickets/new')} className="luna-button !px-8 flex items-center gap-3 shadow-lg shadow-luna-aqua/20">
             <Plus size={18} /> New Report
           </button>
        </motion.div>
      </div>

      {/* Metric Intelligence Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="luna-card group hover:border-luna-aqua/30 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 luna-glass rounded-2xl flex items-center justify-center text-${stat.color} group-hover:luna-glow transition-all`}>
                <stat.icon size={24} />
              </div>
              <ChevronRight size={14} className="text-text-muted group-hover:text-white transition-all group-hover:translate-x-1" />
            </div>
            <p className="text-4xl font-black text-white mb-1 leading-none">{stat.value}</p>
            <div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{stat.label}</h3>
              <p className="text-[9px] font-black text-text-muted mt-1 uppercase tracking-widest">{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Activity Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* Incident Monitoring Area */}
        <div className="xl:col-span-8 space-y-12">
          <div className="luna-card !p-0 overflow-hidden">
            <div className="px-10 py-8 border-b border-luna-aqua/10 flex justify-between items-center bg-luna-midnight/40">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Personal Incident Feed</h3>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Real-time status of your service requests</p>
              </div>
              <button onClick={() => navigate('/tickets')} className="text-[10px] font-black text-luna-aqua hover:text-white transition-all uppercase tracking-[0.2em] flex items-center gap-2 luna-glass px-4 py-2 rounded-xl">
                Archive Access <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="divide-y divide-luna-aqua/5">
              <AnimatePresence mode="popLayout">
                {tickets.length > 0 ? (
                  tickets.slice(0, 5).map((t, i) => (
                    <motion.div 
                      key={t.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-10 py-8 flex items-center justify-between hover:bg-luna-aqua/5 transition-all group cursor-pointer" 
                      onClick={() => navigate(`/tickets/${t.id}`)}
                    >
                      <div className="flex gap-8 items-center">
                        <div className={`w-14 h-14 luna-glass rounded-[1.25rem] flex items-center justify-center transition-all ${
                          t.status === 'OPEN' ? 'text-luna-cyan' : 
                          t.status === 'RESOLVED' ? 'text-luna-aqua luna-glow' : 'text-white/20'
                        }`}>
                          <Ticket size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white group-hover:text-luna-aqua transition-colors tracking-tight">{t.title}</h4>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`luna-badge !px-3 !py-0.5 ${
                              t.status === 'RESOLVED' ? 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20' : 'bg-luna-cyan/10 text-luna-cyan border-luna-cyan/20'
                            }`}>{t.status.replace('_', ' ')}</span>
                            <span className="text-[10px] text-text-muted font-black uppercase tracking-widest flex items-center gap-2">
                               <Clock size={12} className="text-luna-aqua" />
                               Synced {new Date(t.updatedAt || t.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="text-text-muted group-hover:text-white transition-all group-hover:translate-x-2" size={24} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-24 text-center opacity-20 flex flex-col items-center gap-6"
                  >
                    <div className="w-20 h-20 luna-glass rounded-[2rem] flex items-center justify-center text-text-muted">
                      <ShieldCheck size={40} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest italic leading-relaxed">No priority incidents recorded.<br/>Personal environment is stable.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="luna-card bg-gradient-to-br from-luna-steel/10 to-transparent !p-12 relative overflow-hidden group">
             <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none translate-x-20 -translate-y-20 group-hover:opacity-[0.06] transition-opacity duration-1000">
                <Building2 size={400} />
             </div>
             <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                   <Zap className="text-luna-aqua" size={20} />
                   <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.3em]">Resource Flow</span>
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter mb-6">Campus <span className="text-luna-aqua">Asset Sync</span></h2>
                <p className="text-text-muted text-lg font-medium leading-relaxed mb-10 border-l-2 border-luna-aqua/20 pl-8">
                   Explore and reserve state-of-the-art campus facilities. 
                   From high-performance labs to collaborative studios, update your access with the central directory.
                </p>
                <button onClick={() => navigate('/facilities')} className="luna-button !px-10 shadow-lg shadow-luna-aqua/20">Explore Infrastructure</button>
             </div>
          </div>
        </div>

        {/* Temporal Sidebar */}
        <div className="xl:col-span-4 space-y-12">
          <div className="luna-card flex flex-col min-h-[500px]">
            <div className="mb-10 pb-6 border-b border-luna-aqua/5">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                <Layers size={24} className="text-luna-aqua" /> Reservations
              </h3>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Temporal access directory</p>
            </div>
            
            <div className="flex-1 space-y-8">
              <AnimatePresence mode="popLayout">
                {bookings.length > 0 ? (
                  bookings.slice(0, 3).map((b, i) => (
                    <motion.div 
                      key={b.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 rounded-[2rem] bg-luna-midnight/40 border border-luna-aqua/5 group hover:border-luna-aqua/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="px-3 py-1 rounded-lg bg-luna-aqua/5 border border-luna-aqua/10 text-[9px] font-black text-luna-aqua uppercase tracking-widest">
                           {b.assetName || 'Site Alpha'}
                        </div>
                        <ArrowRight size={14} className="text-text-muted group-hover:text-luna-aqua transition-all" />
                      </div>
                      <p className="text-xl font-black text-white group-hover:text-luna-aqua transition-colors tracking-tight">
                        {new Date(b.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-3 mt-2 opacity-50">
                         <Clock size={12} className="text-luna-aqua" />
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">
                           {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center opacity-20 py-20"
                  >
                    <Calendar size={48} className="mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No temporal access<br/>reservations recorded</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button onClick={() => navigate('/my-bookings')} className="w-full luna-button-outline mt-10 group !py-4">
              Temporal Management <Plus size={16} className="group-hover:rotate-90 transition-transform ml-2" />
            </button>
          </div>

          <div className="luna-card !bg-luna-midnight/60 border-luna-aqua/10 flex flex-col items-center justify-center text-center !p-12 group">
            <div className="w-20 h-20 bg-luna-aqua/5 rounded-[2rem] flex items-center justify-center text-luna-aqua mb-8 border border-luna-aqua/20 luna-glow group-hover:scale-110 transition-transform">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight mb-3">Concierge Access</h3>
            <p className="text-xs font-medium text-text-muted mb-10 leading-relaxed px-6">
              Immediate secure line to campus technical specialists for priority infrastructure support.
            </p>
            <button className="w-full luna-button !py-4 shadow-lg shadow-luna-aqua/10">Synchronize Specialist</button>
          </div>
        </div>
      </div>

    </div>
  );
}
