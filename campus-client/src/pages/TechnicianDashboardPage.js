import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const TechnicianDashboardPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchTickets(true);
      const interval = setInterval(() => fetchTickets(false), 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchTickets = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await getAllTickets();
      setTickets(data.filter(t => t.assignedTechnicianId === user.id));
    } catch (error) {
      if (showLoading) addToast('Error syncing field data', 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = tickets.length;
    const completed = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'COMPLETED' || t.status === 'CLOSED').length;
    const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const pending = tickets.filter(t => t.status === 'OPEN' || t.status === 'ON_HOLD').length;
    const urgent = tickets.filter(t => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && (t.status !== 'RESOLVED' && t.status !== 'COMPLETED' && t.status !== 'CLOSED')).length;
    
    const weekData = [20, 45, 30, 80, 50, 65, 40]; // Placeholder for visualization scaling
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, inProgress, pending, urgent, completionRate, weekData };
  }, [tickets]);

  if (loading) return <LoadingSpinner fullScreen message="Calibrating Work Orders..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-luxury">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-ivory-warm/10">
        <div>
           <h1 className="text-4xl font-black text-ivory-warm tracking-tight">Technical Studio</h1>
           <p className="text-sm font-bold text-blush-soft uppercase tracking-widest mt-2">Specialist: {user?.username} • Live Status</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              On Duty
           </div>
           <button onClick={() => fetchTickets()} className="p-2.5 rounded-xl bg-white/5 text-ivory-warm/60 hover:text-ivory-warm hover:bg-white/10 transition-all border border-ivory-warm/10">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard title="Assigned" value={stats.total} icon="📋" color="violet" />
        <KPICard title="Awaiting" value={stats.pending} icon="⏳" color="wine" />
        <KPICard title="Active" value={stats.inProgress} icon="⚡" color="mauve" />
        <KPICard title="Resolved" value={stats.completed} icon="✅" color="blush" />
        <KPICard title="Urgent" value={stats.urgent} icon="🔥" color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Active Assignments */}
          <div className="luxury-card !p-0 overflow-hidden bg-gradient-to-br from-violet-deep/20 to-wine-muted/20">
            <div className="px-8 py-6 border-b border-ivory-warm/5 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-ivory-warm">Current Work Orders</h3>
              <button onClick={() => navigate('/assignments')} className="text-[10px] font-black text-blush-soft uppercase tracking-widest hover:text-ivory-warm transition-colors">Queue Management</button>
            </div>
            <div className="divide-y divide-ivory-warm/5">
              {tickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').slice(0, 4).map(t => (
                <div key={t.id} className="px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer group" onClick={() => navigate(`/tickets/${t.id}`)}>
                  <div className="flex gap-5 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-plum-dark/40 border border-ivory-warm/5 flex items-center justify-center text-xl shadow-soft group-hover:border-blush-soft/30 transition-all">🛠️</div>
                    <div>
                      <p className="text-base font-bold text-ivory-warm group-hover:text-blush-soft transition-colors">{t.title}</p>
                      <p className="text-[10px] text-ivory-warm/40 font-bold uppercase tracking-widest mt-1">📍 {t.location || 'Central'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getPriorityStyles(t.priority)}`}>{t.priority}</span>
                    <svg className="w-4 h-4 text-ivory-warm/20 group-hover:text-ivory-warm/60 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              ))}
              {tickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length === 0 && (
                <div className="p-16 text-center text-ivory-warm/30 italic text-sm font-medium">Your agenda is clear. Enjoy the serenity.</div>
              )}
            </div>
          </div>

          {/* Performance Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="luxury-card">
                <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-blush-soft">Resolution Pulse</h3>
                <div className="flex items-end justify-between h-40 gap-3 px-2">
                   {stats.weekData.map((h, i) => (
                      <div key={i} className="flex-1 bg-white/5 rounded-2xl relative group">
                         <div className="absolute bottom-0 w-full rounded-2xl bg-gradient-to-t from-violet-deep to-mauve-dusty transition-all duration-1000 group-hover:brightness-125" style={{ height: `${h}%` }}></div>
                      </div>
                   ))}
                </div>
                <div className="flex justify-between mt-6 text-[10px] font-black text-ivory-warm/30 uppercase tracking-[0.2em] px-2">
                   <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
             </div>

             <div className="luxury-card bg-violet-deep/30 flex flex-col justify-center">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-8 text-ivory-warm">Efficiency Matrix</h3>
                <div className="space-y-8">
                   <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-ivory-warm">
                         <span>SLA Compliance</span>
                         <span className="text-emerald-400">98.4%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: '98.4%' }} transition={{ duration: 1.5 }} className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]"></motion.div>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-ivory-warm">
                         <span>Project Velocity</span>
                         <span className="text-blush-soft">{stats.completionRate}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${stats.completionRate}%` }} transition={{ duration: 1.5 }} className="h-full bg-blush-soft shadow-[0_0_10px_rgba(223,182,178,0.3)]"></motion.div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Statistics */}
        <div className="lg:col-span-4 space-y-8">
           <div className="luxury-card text-center">
              <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-blush-soft">Workload Load</h3>
              <div className="relative w-48 h-48 mx-auto mb-8">
                 <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(251, 228, 216, 0.05)" strokeWidth="3" />
                    <motion.circle 
                      cx="18" cy="18" r="16" 
                      fill="none" 
                      stroke="#DFB6B2" 
                      strokeWidth="3" 
                      strokeDasharray={`${stats.completionRate} 100`} 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 100" }}
                      animate={{ strokeDasharray: `${stats.completionRate} 100` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-ivory-warm tracking-tighter">{stats.completionRate}%</span>
                    <span className="text-[10px] font-black text-blush-soft uppercase tracking-widest mt-1">Resolution</span>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 bg-white/5 rounded-2xl border border-ivory-warm/5">
                    <p className="text-2xl font-black text-ivory-warm tracking-tighter">{stats.total}</p>
                    <p className="text-[10px] font-bold text-ivory-warm/40 uppercase mt-1">Assigned</p>
                 </div>
                 <div className="p-5 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                    <p className="text-2xl font-black text-rose-400 tracking-tighter">{stats.urgent}</p>
                    <p className="text-[10px] font-bold text-rose-400 uppercase mt-1">Critical</p>
                 </div>
              </div>
           </div>

           <div className="luxury-card !p-0 overflow-hidden">
              <div className="px-8 py-5 border-b border-ivory-warm/5 bg-white/5">
                 <h3 className="text-[10px] font-black text-ivory-warm uppercase tracking-[0.3em]">Immediate Priority</h3>
              </div>
              <div className="divide-y divide-ivory-warm/5">
                 {tickets.filter(t => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && t.status !== 'COMPLETED' && t.status !== 'RESOLVED').slice(0, 3).map(t => (
                    <div key={t.id} className="p-6 hover:bg-white/5 transition-all cursor-pointer group" onClick={() => navigate(`/tickets/${t.id}`)}>
                       <div className="flex justify-between items-start mb-3">
                          <span className="text-[9px] font-black px-2.5 py-1 bg-rose-500/20 text-rose-400 rounded-lg uppercase tracking-widest border border-rose-500/20">{t.priority}</span>
                          <span className="text-[10px] font-bold text-ivory-warm/20">#{t.id.substring(0, 6)}</span>
                       </div>
                       <h4 className="text-sm font-bold text-ivory-warm group-hover:text-blush-soft transition-colors">{t.title}</h4>
                    </div>
                 ))}
                 {tickets.filter(t => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && t.status !== 'COMPLETED' && t.status !== 'RESOLVED').length === 0 && (
                   <div className="p-10 text-center text-[11px] font-medium text-ivory-warm/30 italic">No urgent repairs required.</div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, color }) => {
  const colorMap = {
    violet: 'bg-violet-deep/20 text-ivory-warm border-ivory-warm/10 shadow-[0_0_20px_rgba(43,18,76,0.3)]',
    wine: 'bg-wine-muted/20 text-ivory-warm border-ivory-warm/10',
    mauve: 'bg-mauve-dusty/20 text-ivory-warm border-ivory-warm/10',
    blush: 'bg-blush-soft/10 text-blush-soft border-blush-soft/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className="luxury-card !p-6 hover:-translate-y-2 group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border transition-transform duration-500 group-hover:rotate-12 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="mt-5">
        <p className="text-[10px] font-black text-ivory-warm/40 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-ivory-warm tracking-tighter leading-none">{value}</p>
      </div>
    </div>
  );
};

const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'HIGH': return 'bg-mauve-dusty/10 text-blush-soft border-mauve-dusty/20';
    case 'MEDIUM': return 'bg-wine-muted/10 text-ivory-warm/60 border-wine-muted/20';
    case 'LOW': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    default: return 'bg-white/5 text-ivory-warm/30 border-white/10';
  }
};

export default TechnicianDashboardPage;
