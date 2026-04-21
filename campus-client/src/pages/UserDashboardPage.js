import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getAllTickets } from '../services/api';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await getAllTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const myTickets = useMemo(() => 
    tickets.filter(t => t.createdById === user?.id), 
    [tickets, user?.id]
  );

  const stats = useMemo(() => ({
    open: myTickets.filter(t => t.status === 'OPEN').length,
    inProgress: myTickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: myTickets.filter(t => t.status === 'RESOLVED').length,
    total: myTickets.length
  }), [myTickets]);

  const recentUpdates = useMemo(() => 
    tickets
      .flatMap(t => t.updates.map(u => ({ ...u, ticketTitle: t.title, ticketId: t.id })))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5),
    [tickets]
  );

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8 min-h-screen pb-20">
      
      {/* Welcome Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#10B981] to-[#059669] rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl shadow-emerald-200/50"
      >
        <div className="relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest mb-6">
            Campus Live Overview
          </span>
          <h1 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">
            Hello, {user?.username?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-white/80 max-w-xl text-lg font-medium leading-relaxed">
            Your personal campus command center. Track your requests, manage bookings, and stay updated with the latest campus activity.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main Feed Content */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ModernStatCard 
              label="Pending Items" 
              value={stats.open} 
              icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              color="amber" 
              delay={0.1}
            />
            <ModernStatCard 
              label="Being Handled" 
              value={stats.inProgress} 
              icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
              color="slate" 
              delay={0.2}
            />
            <ModernStatCard 
              label="Task Resolved" 
              value={stats.resolved} 
              icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              color="emerald" 
              delay={0.3}
            />
          </div>

          {/* Activity Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Activity Pulse</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time status updates</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/tickets')} 
                className="px-4 py-2 text-xs font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all uppercase tracking-widest"
              >
                View Feed
              </button>
            </div>
            
            <div className="divide-y divide-slate-50">
              {recentUpdates.length > 0 ? recentUpdates.map((update, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate(`/tickets/${update.ticketId}`)}
                  className="p-8 hover:bg-slate-50/50 transition-all flex items-start gap-6 group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-xl">💡</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-black text-slate-900 truncate pr-4">{update.ticketTitle}</p>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 line-clamp-2">{update.note}</p>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  </div>
                  <p className="text-slate-400 font-bold italic tracking-tight">No recent activity on your campus pulse.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar Actions */}
        <div className="xl:col-span-4 space-y-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">Launch Pad</h2>
          
          <QuickActionButton
            title="Log New Incident"
            desc="Report a maintenance or technical issue"
            icon="M12 4v16m8-8H4"
            primary
            onClick={() => navigate('/tickets/new')}
          />

          <QuickActionButton
            title="Campus Assets"
            desc="Browse equipment and resources"
            icon="🏛️"
            emoji
            onClick={() => navigate('/facilities')}
          />

          <QuickActionButton
            title="Book a Facility"
            desc="Schedule labs, halls or rooms"
            icon="📅"
            emoji
            onClick={() => navigate('/bookings/new')}
          />

          {/* Productivity Tip */}
          <div className="p-8 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 block">Pro Tip</span>
              <p className="text-sm font-bold text-slate-700 leading-relaxed">
                "Keep your campus running smoothly! Reporting issues early helps our technicians resolve them faster."
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 text-6xl opacity-10 grayscale group-hover:grayscale-0 transition-all duration-700 rotate-12 group-hover:rotate-0">
              🚀
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ModernStatCard({ label, value, icon, color, delay }) {
  const colorStyles = {
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 group hover:border-emerald-200 transition-all cursor-default"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border transition-transform group-hover:rotate-6 ${colorStyles[color]}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 tracking-tight mb-1">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </motion.div>
  );
}

function QuickActionButton({ title, desc, icon, primary, emoji, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-6 rounded-[2rem] transition-all group relative overflow-hidden ${
        primary 
          ? 'bg-[#10B981] text-white shadow-2xl shadow-emerald-200/50 hover:bg-[#059669]' 
          : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-emerald-200 text-slate-900'
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 shrink-0 transition-all group-hover:scale-110 ${
        primary ? 'bg-white/20' : 'bg-slate-50 border border-slate-100'
      }`}>
        {emoji ? (
          <span className="text-2xl leading-none">{icon}</span>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={icon} />
          </svg>
        )}
      </div>
      <div className="text-left">
        <p className="font-black text-sm tracking-tight">{title}</p>
        <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${primary ? 'text-white/70' : 'text-slate-400'}`}>
          {desc}
        </p>
      </div>
      {primary && (
        <div className="absolute right-6 opacity-20 group-hover:translate-x-2 transition-transform">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </div>
      )}
    </button>
  );
}
