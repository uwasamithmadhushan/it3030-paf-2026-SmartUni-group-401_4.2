import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTickets } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCcw,
  ChevronRight,
  MapPin,
  Activity,
  Zap,
  Layout,
  Layers,
  Cpu,
  Target,
  Bell,
  ShieldCheck
} from 'lucide-react';

export default function TechnicianDashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
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
      // Filter assignments for this technician
      setTickets(data.filter(t => t.assignedTechnicianId === user.id));
    } catch (error) {
      console.error('Failed to synchronize field intelligence');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = tickets.length;
    const completed = tickets.filter(t => t.status === 'RESOLVED').length;
    const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const pending = tickets.filter(t => t.status === 'OPEN').length;
    const critical = tickets.filter(t => t.priority === 'CRITICAL' && t.status !== 'RESOLVED').length;
    
    const weekData = [40, 65, 50, 90, 70, 85, 60]; 
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, inProgress, pending, critical, completionRate, weekData };
  }, [tickets]);

  if (loading) return <LoadingSpinner fullScreen message="Calibrating Specialist Command..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      
      {/* Technician Header */}
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
           <button onClick={() => fetchTickets(true)} className="w-12 h-12 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua hover:luna-glow transition-all">
              <RefreshCcw size={20} />
           </button>
           <button onClick={() => navigate('/technician/reports')} className="luna-button !px-8 flex items-center gap-3 shadow-lg shadow-luna-aqua/20">
             Mission Reports <ChevronRight size={18} />
           </button>
        </div>
      </div>

      {/* KPI Performance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        <KPICard title="Deployment Registry" value={stats.total} icon={<Layers size={24} />} color="navy" />
        <KPICard title="Awaiting Action" value={stats.pending} icon={<Clock size={24} />} color="steel" />
        <KPICard title="Field Active" value={stats.inProgress} icon={<Zap size={24} />} color="cyan" />
        <KPICard title="Cycle Resolved" value={stats.completed} icon={<CheckCircle2 size={24} />} color="aqua" />
        <KPICard title="Critical Delta" value={stats.critical} icon={<AlertTriangle size={24} />} color="critical" />
      </div>

      {/* Main Mission Control Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Workload Matrix Area */}
        <div className="lg:col-span-2 space-y-12">
          
          <div className="luna-card !p-0 overflow-hidden">
            <div className="px-10 py-8 border-b border-luna-aqua/10 flex justify-between items-center bg-luna-midnight/40">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Active Work Orders</h3>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Assignments requiring immediate field sync</p>
              </div>
              <div className="w-10 h-10 luna-glass rounded-xl flex items-center justify-center text-luna-aqua">
                <Wrench size={20} />
              </div>
            </div>
            
            <div className="divide-y divide-luna-aqua/5">
              <AnimatePresence>
                {tickets.filter(t => t.status !== 'RESOLVED').length > 0 ? (
                  tickets.filter(t => t.status !== 'RESOLVED').map((t, i) => (
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
                              t.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20'
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="luna-card group">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-10 text-white flex items-center gap-3">
                  <Activity size={16} className="text-luna-aqua" /> Service Velocity Pulse
                </h3>
                <div className="flex items-end justify-between h-48 gap-3 px-2">
                   {stats.weekData.map((h, i) => (
                      <div key={i} className="flex-1 bg-luna-aqua/5 rounded-2xl relative group/bar overflow-hidden">
                         <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: `${h}%` }}
                           className="absolute bottom-0 w-full bg-luna-aqua/20 group-hover/bar:bg-luna-aqua transition-all duration-700" 
                         />
                      </div>
                   ))}
                </div>
                <div className="flex justify-between mt-6 text-[9px] font-black text-text-muted uppercase tracking-[0.3em] px-2">
                   <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
             </div>

             <div className="luna-card !bg-luna-midnight/40 border-luna-aqua/10 flex flex-col justify-center !p-10">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted mb-10 flex items-center gap-3">
                  <Target size={16} className="text-luna-aqua" /> Strategic Efficiency
                </h3>
                <div className="space-y-10">
                   <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-white">Response Latency</span>
                         <span className="text-luna-aqua">99.2%</span>
                      </div>
                      <div className="w-full h-1.5 bg-luna-steel/10 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: '99.2%' }} className="h-full bg-luna-aqua luna-glow"></motion.div>
                   </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-white">Resolution Ratio</span>
                         <span className="text-luna-cyan">{stats.completionRate}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-luna-steel/10 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${stats.completionRate}%` }} className="h-full bg-luna-cyan"></motion.div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Diagnostic Sidebar */}
        <div className="space-y-12">
           <div className="luna-card text-center flex flex-col items-center !p-12">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-12 text-luna-aqua">Operational Matrix</h3>
              <div className="relative w-64 h-64 mb-12">
                 <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(167, 235, 242, 0.03)" strokeWidth="3" />
                    <motion.circle 
                      cx="18" cy="18" r="16" 
                      fill="none" 
                      stroke="#A7EBF2" 
                      strokeWidth="3" 
                      strokeDasharray={`${stats.completionRate} 100`} 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 100" }}
                      animate={{ strokeDasharray: `${stats.completionRate} 100` }}
                      transition={{ duration: 2 }}
                      className="luna-glow"
                    />
                  </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-white tracking-tighter">{stats.completionRate}%</span>
                    <span className="text-[10px] font-black text-luna-cyan uppercase tracking-[0.2em] mt-2">Resolution Rate</span>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6 w-full">
                 <div className="p-8 luna-glass rounded-[2rem] border-luna-aqua/5">
                    <p className="text-4xl font-black text-white tracking-tighter mb-1">{stats.total}</p>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Total</p>
                 </div>
                 <div className="p-8 bg-red-500/10 rounded-[2rem] border border-red-500/20">
                    <p className="text-4xl font-black text-red-400 tracking-tighter mb-1">{stats.critical}</p>
                    <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Critical</p>
                 </div>
              </div>
           </div>

           <div className="luna-card !p-0 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Bell size={64} className="animate-bounce" />
              </div>
              <div className="px-10 py-6 border-b border-luna-aqua/10 bg-luna-midnight/40">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Critical Alert Registry</h3>
              </div>
              <div className="divide-y divide-luna-aqua/5">
                 {tickets.filter(t => t.priority === 'CRITICAL' && t.status !== 'RESOLVED').slice(0, 3).map((t, i) => (
                    <motion.div 
                      key={t.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-10 hover:bg-luna-aqua/5 transition-all cursor-pointer group" 
                      onClick={() => navigate(`/tickets/${t.id}`)}
                    >
                       <div className="flex justify-between items-start mb-4">
                          <span className="luna-badge !bg-red-500/20 !text-red-400 !border-red-500/20">Immediate Action</span>
                          <span className="text-[10px] font-black text-text-muted uppercase">Ref #{t.id.substring(0, 6)}</span>
                       </div>
                       <h4 className="text-lg font-black text-white group-hover:text-luna-aqua transition-colors tracking-tight">{t.title}</h4>
                    </motion.div>
                 ))}
                 {tickets.filter(t => t.priority === 'CRITICAL' && t.status !== 'RESOLVED').length === 0 && (
                   <div className="py-20 text-center text-[10px] font-black text-text-muted uppercase tracking-widest italic opacity-20">No Priority Deltas</div>
                 )}
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
