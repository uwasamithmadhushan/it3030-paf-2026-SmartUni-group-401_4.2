import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, Zap, Clock, ShieldCheck, TrendingUp, Award, Cpu } from 'lucide-react';
import { getTechnicianDashboardStats } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Reuse StatCard and Chart logic
import StatCard from '../components/technician/dashboard/StatCard';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell
} from 'recharts';

export default function PerformancePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPerformanceTelemetry = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await getTechnicianDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to sync performance metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformanceTelemetry();
    const interval = setInterval(() => fetchPerformanceTelemetry(false), 30000);
    return () => clearInterval(interval);
  }, [fetchPerformanceTelemetry]);

  if (loading && !stats) return <LoadingSpinner fullScreen message="Loading Performance Telemetry..." />;

  const COLORS = ['#A7EBF2', '#22d3ee', '#818cf8', '#f472b6'];

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-white/5">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
           <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <Activity size={12} className="text-luna-aqua animate-pulse" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.4em]">Biometric Performance Monitoring</span>
              </div>
           </div>
           <h1 className="text-7xl font-black text-white tracking-tighter">Efficiency <span className="text-luna-aqua">Analytics</span></h1>
           <p className="text-text-muted font-medium mt-4 text-xl italic tracking-tight">Real-time resolution pulse and operational impact tracking.</p>
        </motion.div>
        
        <div className="flex gap-6">
           <div className="luna-card !p-6 flex flex-col items-center justify-center min-w-[160px] border-emerald-500/20">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-2">SLA Status</span>
              <span className="text-2xl font-black text-white tracking-tighter">99.8%</span>
           </div>
           <div className="luna-card !p-6 flex flex-col items-center justify-center min-w-[160px] border-luna-aqua/20">
              <span className="text-[9px] font-black uppercase tracking-widest text-luna-aqua mb-2">Rank Index</span>
              <span className="text-2xl font-black text-white tracking-tighter">#04</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Resolved Week" value={stats?.resolvedThisWeek || 0} icon={<Award />} color="success" trend={14} />
        <StatCard title="Avg Time" value={`${stats?.avgResolutionTimeHours?.toFixed(1) || 0}h`} icon={<Clock />} color="aqua" trend={-8} />
        <StatCard title="SLA Success" value="98.2%" icon={<Target />} color="info" trend={1} />
        <StatCard title="Peak Sync" value="12m" icon={<Zap />} color="warning" trend={-2} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 luna-card">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
             <TrendingUp size={16} className="text-luna-aqua" /> Resolution Velocity Trend
           </h3>
           <div className="h-[400px] min-h-[400px] min-w-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={Object.entries(stats?.weeklyCompletedTickets || {}).map(([d, c]) => ({ name: d, value: c }))}>
                  <defs>
                    <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A7EBF2" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#A7EBF2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid rgba(167,235,242,0.1)', borderRadius: '1rem' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#A7EBF2" fillOpacity={1} fill="url(#colorPerf)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="xl:col-span-1 luna-card flex flex-col">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
             <Cpu size={16} className="text-luna-cyan" /> Location Impact
           </h3>
           <div className="flex-1 h-[300px] min-h-[300px] min-w-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(stats?.ticketsByStatus || {}).map(([n, v]) => ({ name: n, value: v }))}>
                   <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                   <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {Object.entries(stats?.ticketsByStatus || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                   </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
           <p className="mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted text-center italic">
             Core operational impact calculated via Neural Nexus.
           </p>
        </div>
      </div>
    </div>
  );
}
