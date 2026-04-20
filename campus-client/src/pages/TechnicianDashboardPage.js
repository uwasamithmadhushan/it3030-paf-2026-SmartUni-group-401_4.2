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
      // Filter for current technician
      setTickets(data.filter(t => t.assignedTechnicianId === user.id));
    } catch (error) {
      console.error('Fetch error:', error);
      if (showLoading) addToast('Error fetching summary', 'error');
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
    
    // Calculate weekly progress (last 7 days)
    const weekData = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
    const today = new Date();
    tickets.forEach(t => {
      const updateDate = new Date(t.updatedAt || t.createdAt);
      const diffTime = Math.abs(today - updateDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7 && (t.status === 'RESOLVED' || t.status === 'COMPLETED' || t.status === 'CLOSED')) {
        const dayIndex = (updateDate.getDay() + 6) % 7; // Convert Sun-Sat to Mon-Sun
        weekData[dayIndex]++;
      }
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Mock SLA based on high priority resolution (just to show something real-ish)
    const sla = total > 0 ? 100 - (urgent * 5) : 100;

    return { 
      total, completed, inProgress, pending, urgent, completionRate, 
      weekData: weekData.map(v => Math.max(v * 20, 10)), // Scale for visualization
      realCounts: weekData,
      sla: Math.max(sla, 60)
    };
  }, [tickets]);

  if (loading) return <LoadingSpinner fullScreen message="Syncing Maintenance Data..." />;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Overview</h1>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Maintenance Command Center • Logged in as {user?.username}</p>
        </div>
        <div className="text-right">
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Shift Status</p>
           <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">On Duty</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard title="Assigned" value={stats.total} icon="📋" color="indigo" trend="Total queue" />
        <KPICard title="Pending" value={stats.pending} icon="⏳" color="amber" trend="Awaiting action" />
        <KPICard title="In Progress" value={stats.inProgress} icon="⚡" color="blue" trend="Active now" />
        <KPICard title="Completed" value={stats.completed} icon="✅" color="emerald" trend="Lifetime resolved" />
        <KPICard title="Urgent" value={stats.urgent} icon="🔥" color="rose" trend="Immediate action" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          
          {/* Active Assignments Preview */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Active Work Order Preview</h3>
              <button onClick={() => navigate('/assignments')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View Full Queue</button>
            </div>
            <div className="divide-y divide-slate-50">
              {tickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').slice(0, 4).map(t => (
                <div key={t.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => navigate(`/tickets/${t.id}`)}>
                  <div className="flex gap-4 items-center">
                    <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xs shadow-inner">🛠️</span>
                    <div>
                      <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{t.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">📍 {t.location || 'General'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getPriorityStyles(t.priority)}`}>{t.priority}</span>
                  </div>
                </div>
              ))}
              {tickets.filter(t => t.status !== 'COMPLETED' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length === 0 && (
                <div className="p-12 text-center text-slate-400 italic text-sm">No active tasks assigned.</div>
              )}
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-900">Weekly Progress</h3>
                <div className="flex items-end justify-between h-32 gap-2 px-2">
                   {stats.weekData.map((h, i) => (
                      <div key={i} className="flex-1 bg-slate-100 rounded-t-lg relative group">
                         <div className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-700 ${i === new Date().getDay()-1 ? 'bg-indigo-600' : 'bg-slate-300 group-hover:bg-indigo-300'}`} style={{ height: `${h}%` }}>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                              {stats.realCounts[i]}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
                <div className="flex justify-between mt-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                   <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
             </div>

             <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/20 text-white relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-6">Efficiency Pulse</h3>
                   <div className="space-y-6">
                      <div>
                         <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                            <span>SLA Compliance</span>
                            <span>{stats.sla}%</span>
                         </div>
                         <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${stats.sla}%` }}></div>
                         </div>
                      </div>
                      <div>
                         <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                            <span>Completion Target</span>
                            <span>{stats.completionRate}%</span>
                         </div>
                         <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${stats.completionRate}%` }}></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar / Right Side */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-white">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-900">Workload Pulse</h3>
              <div className="flex flex-col items-center">
                 <div className="relative w-36 h-36 mb-6">
                    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                       <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F1F5F9" strokeWidth="3.5" />
                       <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10B981" strokeWidth="3.5" strokeDasharray={`${stats.completionRate} 100`} strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-2xl font-black text-slate-900">{stats.completionRate}%</span>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rate</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 w-full gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                       <p className="text-xl font-black text-slate-900">{stats.total}</p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                       <p className="text-xl font-black text-rose-600">{stats.urgent}</p>
                       <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Urgent</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-50 flex items-center gap-2">
                 <span className="text-rose-600">🔥</span>
                 <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Immediate Attention</h3>
              </div>
              <div className="divide-y divide-slate-50">
                 {tickets.filter(t => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && t.status !== 'COMPLETED' && t.status !== 'RESOLVED').slice(0, 3).map(t => (
                    <div key={t.id} className="p-6 hover:bg-rose-50/10 transition-colors cursor-pointer group" onClick={() => navigate(`/tickets/${t.id}`)}>
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[8px] font-black px-2 py-0.5 bg-rose-100 text-rose-600 rounded uppercase tracking-widest">{t.priority}</span>
                          <span className="text-[9px] font-bold text-slate-400">#{t.id.substring(0, 6)}</span>
                       </div>
                       <h4 className="text-xs font-black text-slate-800 line-clamp-1">{t.title}</h4>
                    </div>
                 ))}
                 {tickets.filter(t => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && t.status !== 'COMPLETED' && t.status !== 'RESOLVED').length === 0 && <div className="p-6 text-center text-[10px] font-bold text-slate-400 italic">No urgent jobs currently.</div>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, color, trend }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100'
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:scale-[1.03] transition-all group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border ${colorMap[color]} group-hover:rotate-12 transition-transform mb-4`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
        <p className="text-[9px] font-bold text-slate-400 mt-2">{trend}</p>
      </div>
    </div>
  );
};

const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'bg-rose-50 text-rose-600 border-rose-100';
    case 'HIGH': return 'bg-orange-50 text-orange-600 border-orange-100';
    case 'MEDIUM': return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'LOW': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    default: return 'bg-slate-50 text-slate-400 border-slate-100';
  }
};

export default TechnicianDashboardPage;
