import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTechnicianDashboardStats, getAssignedTickets } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Dashboard Components
import StatCard from '../components/technician/dashboard/StatCard';
import ChartsSection from '../components/technician/dashboard/ChartsSection';
import RecentTickets from '../components/technician/dashboard/RecentTickets';
import AlertsPanel from '../components/technician/dashboard/AlertsPanel';
import ProductivityWidget from '../components/technician/dashboard/ProductivityWidget';

// Icons
import { 
  Layers, Clock, Zap, CheckCircle2, AlertTriangle, 
  RefreshCcw, ShieldCheck, Activity, Target
} from 'lucide-react';

export default function TechnicianDashboardPage() {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDashboardIntelligence = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        getTechnicianDashboardStats(),
        getAssignedTickets()
      ]);
      setStats(statsRes.data);
      setTickets(ticketsRes.data);
    } catch (error) {
      console.error('Failed to synchronize mission control', error);
    } finally {
      if (showLoading) setLoading(false);
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
    <div className="max-w-[1700px] mx-auto space-y-12 pb-20 overflow-x-hidden">
      
      {/* Executive Overview Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-white/5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
           <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <ShieldCheck size={12} className="text-luna-aqua" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.3em]">Operational Command Center</span>
              </div>
           </div>
           <h1 className="text-7xl font-black text-white tracking-tighter">Strategic <span className="text-luna-aqua">Dashboard</span></h1>
           <p className="text-text-muted font-medium mt-4 text-xl italic tracking-tight">Specialist Profile: <span className="text-white not-italic font-bold">{user?.username}</span> • Status: Mission Active</p>
        </motion.div>
        
        <div className="flex items-center gap-6">
           <button 
             onClick={() => fetchDashboardIntelligence(true)} 
             className="w-14 h-14 luna-glass-dark rounded-2xl flex items-center justify-center text-luna-aqua hover:luna-glow transition-all active:scale-95"
           >
              <RefreshCcw size={24} className={loading ? 'animate-spin' : ''} />
           </button>
           <div className="h-14 px-8 luna-glass-dark rounded-2xl flex items-center gap-4 border-luna-aqua/10">
              <div className="w-2 h-2 rounded-full bg-luna-aqua animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Live System Sync</span>
           </div>
        </div>
      </div>

      {/* Top Intelligence Grid (Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Total Assigned" value={stats?.totalAssigned || 0} icon={<Layers />} color="info" trend={12} />
        <StatCard title="Open Operations" value={stats?.openTickets || 0} icon={<Clock />} color="warning" trend={-5} />
        <StatCard title="Active Sync" value={stats?.inProgressTickets || 0} icon={<Zap />} color="aqua" trend={8} />
        <StatCard title="Resolved Today" value={stats?.resolvedToday || 0} icon={<CheckCircle2 />} color="success" trend={24} />
        <StatCard title="Urgent Delta" value={stats?.urgentTickets || 0} icon={<AlertTriangle />} color="critical" trend={0} />
        <StatCard title="Avg Sync Time" value={`${stats?.avgResolutionTimeHours?.toFixed(1) || 0}h`} icon={<Target />} color="info" trend={-15} />
      </div>

      {/* Primary Intelligence Layer (Graphs) */}
      <ChartsSection stats={stats} />

      {/* Operational Layer (Table & Alerts) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <RecentTickets tickets={tickets.slice(0, 6)} />
        </div>
        <div>
          <AlertsPanel tickets={tickets} />
        </div>
      </div>

      {/* Performance Layer (Productivity) */}
      <div className="space-y-8">
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-muted flex items-center gap-4">
          <Activity size={18} className="text-luna-aqua" /> Efficiency Metrics
        </h3>
        <ProductivityWidget stats={stats} />
      </div>
    </div>
  );
}
