import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getTechnicianDashboardStats, getAssignedTickets } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Dashboard Components
import StatCard from '../components/technician/dashboard/StatCard';
import ChartsSection from '../components/technician/dashboard/ChartsSection';
import RecentTickets from '../components/technician/dashboard/RecentTickets';
import AlertsPanel from '../components/technician/dashboard/AlertsPanel';
import ProductivityWidget from '../components/technician/dashboard/ProductivityWidget';
import MissionTimeline from '../components/technician/dashboard/MissionTimeline';

// Icons
import { 
  Layers, Clock, Zap, CheckCircle2, AlertTriangle, 
  RefreshCcw, ShieldCheck, Activity, Target, Cpu
} from 'lucide-react';

export default function TechnicianDashboardPage() {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchDashboardIntelligence = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        getTechnicianDashboardStats(),
        getAssignedTickets()
      ]);
      setStats(statsRes.data);
      setTickets(ticketsRes.data);
    } catch (error) {
      console.error('Failed to update mission control', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardIntelligence(true);
      const interval = setInterval(() => fetchDashboardIntelligence(false), 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id, fetchDashboardIntelligence]);

  if (loading && !stats) return <LoadingSpinner fullScreen message="Synchronizing Global Hub..." />;

  return (
    <div className="max-w-[1700px] mx-auto space-y-12 pb-20 overflow-x-hidden luna-stable-container">
      
      {/* Dynamic Command Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-12 border-b border-white/5 relative">
        {refreshing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-0 right-0"
          >
            <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
              <RefreshCcw size={10} className="text-luna-aqua animate-spin" />
              <span className="text-[8px] font-black text-luna-aqua uppercase tracking-widest">Live Sync</span>
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
           <div className="flex items-center gap-3 mb-6">
              <div className="px-3 py-1 rounded-lg bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <Cpu size={12} className="text-luna-aqua animate-pulse" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.4em]">Core Node: Technician_v2.4</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Secure Procedure Active</span>
              </div>
           </div>
           <h1 className="text-8xl font-black text-white tracking-tighter leading-none mb-4">Operations <span className="text-luna-aqua">Hub</span></h1>
           <p className="text-text-muted font-medium text-xl italic tracking-tight flex items-center gap-4">
             Welcome back, Specialist <span className="text-white not-italic font-black border-b-2 border-luna-aqua">{user?.username}</span>
           </p>
        </motion.div>
        
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end pr-8 border-r border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">System Entropy</p>
              <p className="text-xl font-black text-white">4.2%</p>
           </div>
           <button 
             onClick={() => fetchDashboardIntelligence(true)} 
             className="w-16 h-16 luna-glass-dark rounded-[2rem] flex items-center justify-center text-luna-aqua hover:luna-glow hover:border-luna-aqua/40 transition-all active:scale-90"
           >
              <RefreshCcw size={28} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      {/* High-Impact Stat Layer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Total Assigned" value={stats?.totalAssigned || 0} icon={<Layers />} color="info" trend={12} />
        <StatCard title="Open Operations" value={stats?.openTickets || 0} icon={<Clock />} color="warning" trend={-5} />
        <StatCard title="Active Sync" value={stats?.inProgressTickets || 0} icon={<Zap />} color="aqua" trend={8} />
        <StatCard title="Resolved Today" value={stats?.resolvedToday || 0} icon={<CheckCircle2 />} color="success" trend={24} />
        <StatCard title="Urgent Delta" value={stats?.urgentTickets || 0} icon={<AlertTriangle />} color="critical" trend={0} />
        <StatCard title="Avg Sync Time" value={`${stats?.avgResolutionTimeHours?.toFixed(1) || 0}h`} icon={<Target />} color="info" trend={-15} />
      </div>

      {/* Hero Visualization Layer */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3">
          <ChartsSection stats={stats} />
        </div>
        <div className="xl:col-span-1">
          <MissionTimeline tickets={tickets} />
        </div>
      </div>

      {/* Operational Directory Layer */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <RecentTickets tickets={tickets.slice(0, 6)} />
        </div>
        <div className="xl:col-span-1">
          <AlertsPanel tickets={tickets} />
        </div>
      </div>

      {/* Performance Pulse Layer */}
      <div className="pt-10">
        <div className="flex items-center gap-6 mb-10">
          <h3 className="text-xs font-black uppercase tracking-[0.5em] text-text-muted whitespace-nowrap">Efficiency Procedure Delta</h3>
          <div className="h-[1px] w-full bg-white/5" />
        </div>
        <ProductivityWidget stats={stats} />
      </div>
    </div>
  );
}
