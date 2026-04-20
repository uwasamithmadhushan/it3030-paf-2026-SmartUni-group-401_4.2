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

  if (loading) return <LoadingSpinner fullScreen />;

  const stats = {
    totalAssets: assets.length,
    activeAssets: assets.filter(a => a.status === 'AVAILABLE' || a.status === 'ACTIVE').length,
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'OPEN').length,
  };

  const recentAssets = [...assets].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);
  const activeTicketsList = tickets.filter(t => t.status === 'OPEN').sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Row 1: Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Overview</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Live monitoring of campus infrastructure and support operations.</p>
        </div>
        <button 
          onClick={() => navigate('/tickets/new')}
          className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-6 py-2.5 rounded-full font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="text-lg leading-none">+</span> Create Ticket
        </button>
      </div>

      {/* Row 2: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="TOTAL ASSETS" value={stats.totalAssets} change="System wide" color="border-l-indigo-500" />
        <StatCard title="ACTIVE FACILITIES" value={stats.activeAssets} change="Operational" color="border-l-emerald-500" />
        <StatCard title="SUPPORT TICKETS" value={stats.totalTickets} change="Lifetime" color="border-l-amber-500" />
        <StatCard title="UNRESOLVED" value={stats.openTickets} change="Needs Action" color="border-l-rose-500" />
      </div>

      {/* Row 3: Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Banner (span 2) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute right-0 top-0 opacity-20 pointer-events-none">
            <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#ffffff" d="M45.7,-76.4C58.9,-69.3,69.1,-55.3,77.7,-40.8C86.3,-26.3,93.4,-11.3,91.8,2.7C90.2,16.7,79.9,29.7,70.5,41.8C61.1,53.9,52.6,65.1,40.7,72.2C28.8,79.3,13.5,82.3,-0.9,83.8C-15.3,85.3,-30.6,85.3,-43.3,79.2C-56,73.1,-66.1,60.9,-75.5,47.7C-84.9,34.5,-93.6,20.3,-95.1,5.3C-96.6,-9.7,-90.9,-25.5,-81.4,-38.4C-71.9,-51.3,-58.6,-61.3,-44.6,-67.7C-30.6,-74.1,-15.3,-76.9,0.5,-77.8C16.3,-78.7,32.5,-83.5,45.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
            </svg>
          </div>
          
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-black mb-3">Operations Hub</h2>
            <p className="text-indigo-200 text-sm leading-relaxed mb-8 font-medium">
              Your centralized control panel for managing campus resources. 
              Review active incidents, update facility statuses, and maintain operational efficiency.
            </p>
            <div className="flex gap-4">
              <button onClick={() => navigate('/facilities')} className="bg-white text-indigo-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-indigo-50 transition-colors">
                Resource Directory
              </button>
              <button onClick={() => navigate('/tickets')} className="bg-white/10 text-white border border-white/20 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-white/20 transition-colors">
                Support Queue
              </button>
            </div>
          </div>
        </div>

        {/* System Status (span 1) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            Service Health
          </h3>
          <div className="space-y-4">
            <ServiceHealthItem label="API Endpoints" status="Active" color="emerald" />
            <ServiceHealthItem label="Primary Database" status="Active" color="emerald" />
            <ServiceHealthItem label="Asset Storage" status="Syncing" color="amber" />
          </div>
        </div>
      </div>

      {/* Row 4: Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Recent Facilities */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6 flex items-center justify-between">
            Recent Assets
            <span className="text-xs text-indigo-600 font-bold cursor-pointer hover:underline" onClick={() => navigate('/facilities')}>View All</span>
          </h3>
          <div className="space-y-4">
            {recentAssets.map((asset, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs">
                  {asset.name ? asset.name.substring(0,2).toUpperCase() : 'AS'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{asset.name || 'Facility'}</h4>
                  <p className={`text-[10px] font-black uppercase ${asset.status === 'AVAILABLE' || asset.status === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'}`}>{asset.status}</p>
                </div>
              </div>
            ))}
            {recentAssets.length === 0 && <p className="text-sm text-slate-400">No assets found.</p>}
          </div>
        </div>

        {/* Active Tickets */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6 flex items-center justify-between">
            Active Issues
            <span className="text-xs text-indigo-600 font-bold cursor-pointer hover:underline" onClick={() => navigate('/tickets')}>Queue</span>
          </h3>
          <div className="space-y-4">
            {activeTicketsList.map((ticket, i) => (
              <div 
                key={i} 
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="flex items-start justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0 cursor-pointer group hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="pr-2">
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{ticket.title}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{getTimeAgo(ticket.createdAt)}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-black uppercase px-2 py-1 rounded border ${ticket.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {ticket.priority || 'NORMAL'}
                </span>
              </div>
            ))}
            {activeTicketsList.length === 0 && <p className="text-sm text-slate-400">No open issues.</p>}
          </div>
        </div>

        {/* Need Support */}
        <div className="bg-indigo-50 rounded-3xl border border-indigo-100 p-8 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-4 border border-indigo-50">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <h3 className="font-black text-indigo-900 text-lg mb-2">Technical Assistance</h3>
          <p className="text-indigo-600/80 text-xs font-medium mb-6">Need help with the platform integration?</p>
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 rounded-xl transition-colors shadow-sm">
            Contact Tech Team
          </button>
        </div>

      </div>

    </div>
  );
}

function StatCard({ title, value, change, color }) {
  return (
    <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 ${color}`}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <p className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{value}</p>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{change}</span>
      </div>
    </div>
  );
}

function ServiceHealthItem({ label, status, color }) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
      <span className="font-bold text-slate-700 text-sm">{label}</span>
      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-${color}-100 text-${color}-700`}>
        {status}
      </span>
    </div>
  );
}

function getTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
