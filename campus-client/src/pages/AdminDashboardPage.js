import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTickets, getAllAssets, getAllUsers } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  Users, 
  Ticket, 
  Building2,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Bell,
  Zap,
  Layers,
  Cpu,
  Globe,
  PieChart,
  Target
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [ticketsRes, assetsRes, usersRes] = await Promise.all([
        getAllTickets(),
        getAllAssets(),
        getAllUsers()
      ]);
      setTickets(ticketsRes.data);
      setAssets(assetsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to update executive intelligence archive');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Accessing Executive Mission Control..." />;

  const stats = [
    { title: "Infrastructure", value: assets.length, label: "Global Asset Directory", icon: Building2, trend: "+2.4%", color: "text-luna-aqua" },
    { title: "Personnel", value: users.length, label: "Authenticated Specialists", icon: Users, trend: "+12.1%", color: "text-luna-cyan" },
    { title: "Active Incidents", value: tickets.filter(t => t.status === 'OPEN').length, label: "Immediate Priority", icon: Ticket, trend: "Stable", color: "text-red-400" },
    { title: "Resolution Rate", value: tickets.length > 0 ? Math.round((tickets.filter(t => t.status === 'RESOLVED').length / tickets.length) * 100) : 0 + "%", label: "System Efficiency", icon: ShieldCheck, trend: "94.2%", color: "text-luna-aqua" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <div>
           <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <ShieldCheck size={12} className="text-luna-aqua" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-widest">Administrative Mission Control</span>
              </div>
           </div>
           <h1 className="text-6xl font-black text-white tracking-tighter">Executive <span className="text-luna-aqua">Hub</span></h1>
           <p className="text-text-muted font-medium mt-2 text-lg">Centralized campus management & infrastructure oversight.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/admin/users')} className="luna-button-outline !px-8">
             Personnel Directory
           </button>
           <button onClick={() => navigate('/tickets')} className="luna-button !px-8 flex items-center gap-3 shadow-lg shadow-luna-aqua/20">
             Incident Queue <ArrowUpRight size={18} />
           </button>
        </div>
      </div>

      {/* Intelligence Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="luna-card group hover:border-luna-aqua/30 transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua group-hover:luna-glow transition-all">
                <stat.icon size={24} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-luna-cyan uppercase tracking-widest">{stat.trend}</span>
                <TrendingUp size={14} className="text-luna-cyan/40" />
              </div>
            </div>
            <p className={`text-4xl font-black mb-1 ${stat.color}`}>{stat.value}</p>
            <div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{stat.title}</h3>
              <p className="text-[9px] font-black text-text-muted mt-1 uppercase tracking-tighter">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Command Center Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Pulse Area */}
        <div className="lg:col-span-2 space-y-12">
          <div className="luna-card relative overflow-hidden bg-gradient-to-br from-luna-steel/10 to-transparent !p-12 group">
            <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none translate-x-20 -translate-y-20 group-hover:opacity-[0.07] transition-opacity duration-1000">
              <Cpu size={500} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <Target className="text-luna-aqua" size={20} />
                 <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.3em]">Operational Trajectory</span>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter mb-6">Real-time <span className="text-luna-aqua">System Pulse</span></h2>
              <p className="text-text-muted text-lg font-medium leading-relaxed mb-10 max-w-2xl border-l-2 border-luna-aqua/20 pl-8">
                Advanced monitoring of all high-end campus facilities and student support flows. 
                Maintain peak system performance through real-time executive oversight.
              </p>
              <div className="flex flex-wrap gap-6 pt-4">
                <button onClick={() => navigate('/facilities')} className="luna-button !px-10">
                  Infrastructure Directory
                </button>
                <button onClick={() => navigate('/tickets')} className="luna-button-outline !px-10">
                  System Diagnostics
                </button>
              </div>
            </div>
          </div>

          {/* Active Incidents Queue */}
          <div className="luna-card !p-0 overflow-hidden">
            <div className="px-10 py-8 border-b border-luna-aqua/10 flex justify-between items-center bg-luna-midnight/40">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Priority Incident Queue</h3>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Real-time critical classification</p>
              </div>
              <div className="w-10 h-10 luna-glass rounded-xl flex items-center justify-center text-luna-aqua">
                <Bell size={20} className="animate-pulse" />
              </div>
            </div>
            <div className="divide-y divide-luna-aqua/5">
              <AnimatePresence>
                {tickets.filter(t => t.status === 'OPEN').slice(0, 5).map((t, i) => (
                  <motion.div 
                    key={t.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-10 py-8 flex items-center justify-between hover:bg-luna-aqua/5 transition-all group cursor-pointer" 
                    onClick={() => navigate(`/tickets/${t.id}`)}
                  >
                    <div className="flex items-center gap-8">
                      <div className="w-14 h-14 luna-glass rounded-[1.25rem] flex items-center justify-center text-luna-aqua group-hover:luna-glow transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest">#{t.id.substring(0,2)}</span>
                      </div>
                      <div>
                        <p className="text-lg font-black text-white group-hover:text-luna-aqua transition-colors tracking-tight">{t.title}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="luna-badge !px-3 !py-0.5 bg-red-500/10 text-red-400 border-red-500/20">Priority Delta</span>
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                             <Globe size={12} className="text-luna-aqua" />
                             {t.category || 'General Site'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-text-muted group-hover:text-white transition-all group-hover:translate-x-2" />
                  </motion.div>
                ))}
              </AnimatePresence>
              {tickets.filter(t => t.status === 'OPEN').length === 0 && (
                <div className="py-20 text-center opacity-20 italic">
                   <ShieldCheck size={48} className="mx-auto mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Incident Directory Clear</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Intelligence Sidebar */}
        <div className="space-y-12">
          <div className="luna-card">
            <div className="mb-10 pb-6 border-b border-luna-aqua/5">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                <Cpu size={24} className="text-luna-aqua" /> Core Health
              </h3>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Backend operational status</p>
            </div>
            
            <div className="space-y-6">
              <HealthMetric label="Global Gateway" status="Optimal" />
              <HealthMetric label="Intelligence Cluster" status="Synced" />
              <HealthMetric label="Infrastructure Tracker" status="Stable" />
              <HealthMetric label="Authorization Engine" status="Secured" />
            </div>
          </div>

          <div className="luna-card !bg-luna-midnight/60 border-luna-aqua/10 flex flex-col items-center justify-center text-center !p-12 group">
            <div className="w-20 h-20 bg-luna-aqua/5 rounded-[2rem] flex items-center justify-center text-luna-aqua mb-8 border border-luna-aqua/20 luna-glow group-hover:rotate-6 transition-transform">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight mb-3">Concierge Support</h3>
            <p className="text-xs font-medium text-text-muted mb-10 leading-relaxed px-4">
              Direct secure line to our infrastructure specialists for advanced mission configuration.
            </p>
            <button className="w-full luna-button !py-4 shadow-lg shadow-luna-aqua/10">Synchronize Specialist</button>
          </div>
          
          <div className="luna-card !bg-luna-steel/10 border-transparent overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-br from-luna-aqua/5 to-transparent pointer-events-none" />
             <div className="relative z-10 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-luna-cyan uppercase tracking-widest mb-1">Archive State</p>
                   <p className="text-lg font-black text-white">Cloud Synced</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-luna-aqua/10 flex items-center justify-center text-luna-aqua">
                   <Layers size={18} />
                </div>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function HealthMetric({ label, status }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-3xl bg-luna-midnight/40 border border-luna-aqua/5 group hover:border-luna-aqua/20 transition-all">
      <span className="text-sm font-black text-white/80 group-hover:text-luna-aqua transition-colors">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-luna-aqua luna-glow animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-luna-aqua">{status}</span>
      </div>
    </div>
  );
}
