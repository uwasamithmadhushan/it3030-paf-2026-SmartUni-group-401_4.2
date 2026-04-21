import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets, getAllAssets } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [ticketsRes, assetsRes] = await Promise.all([
        getAllTickets(),
        getAllAssets()
      ]);
      setTickets(ticketsRes.data);
      setAssets(assetsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Curating Dashboard..." />;

  const stats = {
    totalAssets: assets.length,
    activeAssets: assets.filter(a => a.status === 'AVAILABLE' || a.status === 'ACTIVE').length,
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'OPEN').length,
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-luxury">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-ivory-warm/10">
        <div>
          <h1 className="text-4xl font-black text-ivory-warm tracking-tight">Executive Hub</h1>
          <p className="mt-2 text-sm font-bold text-blush-soft uppercase tracking-widest">Global Campus Operations</p>
        </div>
        <button 
          onClick={() => navigate('/tickets/new')}
          className="luxury-button"
        >
          Report Incident
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Resources" value={stats.totalAssets} label="Asset Inventory" />
        <StatCard title="Active Facilities" value={stats.activeAssets} label="Operational" color="text-emerald-400" />
        <StatCard title="Support Tickets" value={stats.totalTickets} label="Lifetime Reports" />
        <StatCard title="Unresolved" value={stats.openTickets} label="Immediate Action" color="text-blush-soft" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Featured Section */}
        <div className="lg:col-span-2 luxury-card relative overflow-hidden bg-gradient-to-br from-violet-deep to-wine-muted">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-20 -translate-y-20">
            <svg width="400" height="400" viewBox="0 0 200 200">
              <path fill="#FBE4D8" d="M45,-76C58,-69,69,-55,77,-41C86,-26,93,-11,91,3C90,17,80,30,70,42C61,54,53,65,41,72C29,79,14,82,-1,84C-15,85,-31,85,-43,79C-56,73,-66,61,-76,48C-85,35,-94,20,-95,5C-97,-10,-91,-26,-81,-38C-72,-51,-59,-61,-45,-68C-31,-74,-15,-77,1,-78C16,-79,33,-84,45,-76Z" transform="translate(100 100)" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-ivory-warm mb-4">Operations Pulse</h2>
            <p className="text-ivory-warm/70 text-base leading-relaxed mb-10 max-w-lg">
              Manage your high-end facilities and student support systems from this centralized command center. 
              Efficiency and elegance combined.
            </p>
            <div className="flex gap-4">
              <button onClick={() => navigate('/facilities')} className="px-6 py-2.5 rounded-xl bg-ivory-warm text-plum-dark font-black text-xs uppercase tracking-widest hover:bg-blush-soft transition-colors">
                Resource Directory
              </button>
              <button onClick={() => navigate('/tickets')} className="px-6 py-2.5 rounded-xl bg-white/10 text-ivory-warm border border-ivory-warm/20 font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-colors">
                Support Queue
              </button>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="luxury-card flex flex-col justify-center">
          <h3 className="text-xs font-black text-blush-soft uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Health
          </h3>
          <div className="space-y-6">
            <HealthItem label="Core API" status="Pristine" />
            <HealthItem label="Database" status="Syncing" />
            <HealthItem label="Media Cloud" status="Active" />
          </div>
        </div>
      </div>

      {/* Secondary Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="luxury-card">
           <h3 className="text-xs font-black text-blush-soft uppercase tracking-[0.2em] mb-6">Recent Activity</h3>
           <div className="space-y-4">
              {tickets.slice(0, 3).map((t, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-ivory-warm/5 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-violet-deep flex items-center justify-center text-[10px] font-black text-ivory-warm">#{t.id.substring(0,2)}</div>
                    <div>
                      <p className="text-sm font-bold text-ivory-warm truncate w-40">{t.title}</p>
                      <p className="text-[10px] font-bold text-blush-soft uppercase">{t.status}</p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/tickets/${t.id}`)} className="p-2 text-ivory-warm/40 hover:text-ivory-warm transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              ))}
           </div>
        </div>

        <div className="luxury-card bg-mauve-dusty/10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-blush-soft mb-4 border border-ivory-warm/10">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-lg font-black text-ivory-warm mb-2">Concierge Support</h3>
          <p className="text-xs font-medium text-ivory-warm/50 mb-6">Need assistance with the management suite?</p>
          <button className="px-8 py-3 rounded-xl bg-violet-deep text-ivory-warm font-black text-xs uppercase tracking-widest hover:bg-wine-muted transition-all">Contact Specialist</button>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, label, color = "text-ivory-warm" }) {
  return (
    <div className="luxury-card hover:-translate-y-1">
      <p className="text-[10px] font-black text-blush-soft uppercase tracking-[0.2em] mb-3">{title}</p>
      <div className="flex items-end justify-between">
        <p className={`text-4xl font-black ${color} tracking-tighter`}>{value}</p>
        <span className="text-[9px] font-black text-ivory-warm/40 uppercase">{label}</span>
      </div>
    </div>
  );
}

function HealthItem({ label, status }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-plum-dark/40 border border-ivory-warm/5 group hover:border-blush-soft/20 transition-all">
      <span className="text-sm font-bold text-ivory-warm/80">{label}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{status}</span>
    </div>
  );
}
