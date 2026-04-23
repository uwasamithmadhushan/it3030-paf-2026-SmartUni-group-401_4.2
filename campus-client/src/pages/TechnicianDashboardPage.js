import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTechnicianDashboardStats, getAssignedTickets } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Wrench, Clock, CheckCircle2, AlertTriangle, RefreshCcw,
  ChevronRight, MapPin, Activity, Layers, Zap, ShieldCheck
} from 'lucide-react';

export default function TechnicianDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(true);
      const interval = setInterval(() => fetchDashboardData(false), 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        getTechnicianDashboardStats(),
        getAssignedTickets()
      ]);
      setStats(statsRes.data);
      // Sort assigned tickets by created date descending and take top 5
      const sortedTickets = ticketsRes.data
        .filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentTickets(sortedTickets);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  if (loading || !stats) return <LoadingSpinner fullScreen message="Calibrating Specialist Command..." />;

  // Chart data formatting
  const pieData = Object.entries(stats.ticketsByPriority).map(([key, value]) => ({
    name: key, value
  }));
  const COLORS = ['#A7EBF2', '#64748b', '#ef4444', '#0ea5e9'];

  const barData = Object.entries(stats.weeklyCompletedTickets)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      resolved: count
    }));

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <div>
           <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <ShieldCheck size={12} className="text-luna-aqua" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-widest">Specialist Terminal</span>
              </div>
           </div>
           <h1 className="text-5xl font-black text-white tracking-tighter">Field <span className="text-luna-aqua">Command</span></h1>
           <p className="text-text-muted font-medium mt-2 text-lg">Specialist: <span className="text-white">{user?.username}</span> • Operational Mission Intelligence</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button onClick={() => fetchDashboardData(true)} className="w-12 h-12 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua hover:luna-glow transition-all">
              <RefreshCcw size={20} />
           </button>
           <button onClick={() => navigate('/assignments')} className="luna-button !px-8 flex items-center gap-3 shadow-lg shadow-luna-aqua/20">
             Manage Assignments <ChevronRight size={18} />
           </button>
        </div>
      </div>

      {/* KPI Performance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        <KPICard title="Total Assigned" value={stats.totalAssigned} icon={<Layers size={24} />} color="navy" />
        <KPICard title="Pending Action" value={stats.openTickets} icon={<Clock size={24} />} color="steel" />
        <KPICard title="In Progress" value={stats.inProgressTickets} icon={<Zap size={24} />} color="cyan" />
        <KPICard title="Resolved Today" value={stats.resolvedToday} icon={<CheckCircle2 size={24} />} color="aqua" />
        <KPICard title="Urgent Priority" value={stats.urgentTickets} icon={<AlertTriangle size={24} />} color="critical" />
      </div>

      {/* Main Mission Control Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Workload Area */}
        <div className="lg:col-span-2 space-y-12">
          
          <div className="luna-card !p-0 overflow-hidden">
            <div className="px-10 py-8 border-b border-luna-aqua/10 flex justify-between items-center bg-luna-midnight/40">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Recent Assignments</h3>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Requires immediate field sync</p>
              </div>
              <div className="w-10 h-10 luna-glass rounded-xl flex items-center justify-center text-luna-aqua">
                <Wrench size={20} />
              </div>
            </div>
            
            <div className="divide-y divide-luna-aqua/5">
              <AnimatePresence>
                {recentTickets.length > 0 ? (
                  recentTickets.map((t, i) => (
                    <motion.div 
                      key={t.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-10 py-8 flex items-center justify-between hover:bg-luna-aqua/5 transition-all group cursor-pointer" 
                      onClick={() => navigate(`/tickets/${t.id}`)}
                    >
                      <div className="flex gap-8 items-center">
                        <div className="w-14 h-14 luna-glass rounded-[1.25rem] flex items-center justify-center text-luna-aqua group-hover:luna-glow transition-all">
                          <Wrench size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white group-hover:text-luna-aqua transition-colors tracking-tight">{t.title}</h4>
                          <div className="flex items-center gap-5 mt-2">
                            <span className={`luna-badge !px-3 !py-0.5 ${
                              t.priority === 'URGENT' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20'
                            }`}>{t.priority} Delta</span>
                            <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] flex items-center gap-2">
                              <MapPin size={12} className="text-luna-aqua" /> {t.location || 'Sector Alpha'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={24} className="text-text-muted group-hover:text-white transition-all group-hover:translate-x-2" />
                    </motion.div>
                  ))
                ) : (
                  <div className="py-24 text-center opacity-20 flex flex-col items-center gap-4">
                     <CheckCircle2 size={48} />
                     <p className="text-[10px] font-black uppercase tracking-widest italic">Operational Queue Clear</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="luna-card">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-10 text-white flex items-center gap-3">
              <Activity size={16} className="text-luna-aqua" /> Weekly Resolution Pulse
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={barData} key={`bar-${barData.length}`}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,235,242,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(167,235,242,0.05)'}}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(167,235,242,0.2)', borderRadius: '1rem' }}
                  />
                  <Bar dataKey="resolved" fill="#A7EBF2" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Diagnostic Sidebar */}
        <div className="space-y-12">
           <div className="luna-card text-center flex flex-col items-center !p-12">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-luna-aqua">Priority Breakdown</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart key={`pie-${pieData.length}`}>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(167,235,242,0.2)', borderRadius: '1rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="luna-card !bg-luna-midnight/40 border-luna-aqua/10 flex flex-col justify-center !p-10">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted mb-8">
                Strategic Efficiency
              </h3>
              <div className="space-y-8">
                 <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-white">Avg Resolution Time</span>
                       <span className="text-luna-aqua">{stats.avgResolutionTimeHours.toFixed(1)} hrs</span>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-white">Resolved This Week</span>
                       <span className="text-luna-cyan">{stats.resolvedThisWeek} Tickets</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const KPICard = ({ title, value, icon, color }) => {
  const colorMap = {
    navy: 'bg-luna-navy/20 text-luna-aqua border-luna-navy/20',
    steel: 'bg-luna-steel/20 text-luna-cyan border-luna-steel/20',
    cyan: 'bg-luna-cyan/10 text-luna-cyan border-luna-cyan/20',
    aqua: 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20 luna-glow',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-lg shadow-red-500/10'
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="luna-card !p-10 group"
    >
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="mt-10">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">{title}</p>
        <p className="text-5xl font-black text-white tracking-tighter leading-none">{value}</p>
      </div>
    </motion.div>
  );
};
