import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTechnicianDashboardStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TechnicianTabs from '../components/technician/TechnicianTabs';
import SummaryCards from '../components/technician/SummaryCards';
import MyJobsTab from '../components/technician/MyJobsTab';
import IncidentQueueTab from '../components/technician/IncidentQueueTab';
import { ShieldCheck, RefreshCcw, Activity } from 'lucide-react';

export default function TechnicianDashboardPage() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await getTechnicianDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard intelligence', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchStats(true);
      const interval = setInterval(() => fetchStats(false), 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id, fetchStats]);

  if (loading && !stats) return <LoadingSpinner fullScreen message="Calibrating Mission Control..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
      
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <div>
           <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <ShieldCheck size={12} className="text-luna-aqua" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-widest">Technician Command Center</span>
              </div>
           </div>
           <h1 className="text-6xl font-black text-white tracking-tighter">Mission <span className="text-luna-aqua">Control</span></h1>
           <p className="text-text-muted font-medium mt-4 text-xl italic tracking-tight">Operator: <span className="text-white not-italic font-bold">{user?.username}</span> • Operational Efficiency Level: High</p>
        </div>
        
        <div className="flex items-center gap-6">
           <button onClick={() => fetchStats(true)} className="w-12 h-12 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua hover:luna-glow transition-all" title="Sync Intelligence">
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
           <TechnicianTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Dynamic Summary Layer */}
      <SummaryCards stats={stats} type={activeTab} />

      {/* Main Mission Layer */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'jobs' ? (
            <motion.div
              key="jobs-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-10">
                 <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-4">
                    <Activity size={24} className="text-luna-aqua" /> Personal Mission Briefing
                 </h2>
                 <p className="text-text-muted text-sm mt-1">High-priority assignments requiring immediate field intervention.</p>
              </div>
              <MyJobsTab />
            </motion.div>
          ) : (
            <motion.div
              key="queue-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-10">
                 <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-4">
                    <ShieldCheck size={24} className="text-luna-aqua" /> Global Incident Archive
                 </h2>
                 <p className="text-text-muted text-sm mt-1">Real-time system-wide incident tracking and resource management.</p>
              </div>
              <IncidentQueueTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
