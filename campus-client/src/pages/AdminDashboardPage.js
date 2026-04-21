import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';

import { getAllTickets, getAllAssets } from '../services/api';
import {
  getSummary,
  getResourceStats,
  getTechnicianPerformance,
  getBookingTrends,
} from '../services/adminService';

import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

// ── constants ─────────────────────────────────────────────────────────────────

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const TICKET_COLORS = {
  Open:          '#F59E0B',
  'In Progress': '#6366F1',
  Resolved:      '#10B981',
};

const CHART_COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444','#3B82F6','#8B5CF6','#EC4899','#14B8A6'];

// ── custom recharts tooltip ───────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      {label && <p className="font-black text-slate-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

function msToHours(ms) {
  if (ms == null || ms <= 0) return '—';
  const h = Math.round(ms / 3600000);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
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
  return `${Math.floor(hours / 24)}d ago`;
}

function ChartSkeleton({ height }) {
  return <div className="animate-pulse bg-slate-100 rounded-2xl" style={{ height }} />;
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // analytics
  const [summary, setSummary]             = useState(null);
  const [resourceStats, setResourceStats] = useState([]);
  const [techStats, setTechStats]         = useState([]);
  const [trendData, setTrendData]         = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData(true);
    fetchAnalytics();
    const interval = setInterval(() => { fetchData(false); fetchAnalytics(); }, 30000);
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

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [summaryRes, resourceRes, perfRes, trendsRes] = await Promise.all([
        getSummary(),
        getResourceStats(),
        getTechnicianPerformance(),
        getBookingTrends(),
      ]);
      setSummary(summaryRes.data);
      setResourceStats(resourceRes.data);
      setTechStats(perfRes.data);
      setTrendData(
        trendsRes.data.map(p => ({
          label: `${MONTH_LABELS[p.month - 1]} ${p.year}`,
          bookings: p.count,
        }))
      );
    } catch {
      console.error('Failed to fetch analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const ticketStatusData = [
    { name: 'Open',        value: tickets.filter(t => t.status === 'OPEN').length },
    { name: 'In Progress', value: tickets.filter(t => t.status === 'IN_PROGRESS').length },
    { name: 'Resolved',    value: tickets.filter(t => t.status === 'RESOLVED').length },
  ].filter(d => d.value > 0);

  const recentAssets      = [...assets].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);
  const activeTicketsList = tickets.filter(t => t.status === 'OPEN').sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">

      {/* ── Row 1: Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Overview</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Live monitoring of campus infrastructure and support operations.</p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-6 py-2.5 rounded-full font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="text-lg leading-none">+</span> Create Ticket
        </button>
      </div>

      {/* ── Row 2: 4 Stat Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Users"      value={summary?.totalUsers ?? '—'}      subtitle="Registered"   accentColor="border-l-slate-400"   isLoading={analyticsLoading} />
        <StatCard title="Active Bookings"  value={summary?.activeBookings ?? '—'}  subtitle="Approved"     accentColor="border-l-indigo-500"  isLoading={analyticsLoading} />
        <StatCard title="Open Tickets"     value={summary?.pendingTickets ?? '—'}  subtitle="Needs Action" accentColor="border-l-amber-500"   isLoading={analyticsLoading} />
        <StatCard title="Total Resources"  value={summary?.totalResources ?? '—'}  subtitle="System-wide"  accentColor="border-l-emerald-500" isLoading={analyticsLoading} />
      </div>

      {/* ── Row 3: Analytics Charts ────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Analytics &amp; Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Bar Chart – Resource Usage */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-5">Resource Usage</h3>
            {analyticsLoading ? <ChartSkeleton height={220} /> : resourceStats.length === 0 ? (
              <p className="text-sm text-slate-400 py-16 text-center">No booking data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={resourceStats.slice(0, 8)} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="resourceName" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="bookingCount" name="Bookings" radius={[6, 6, 0, 0]}>
                    {resourceStats.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Chart – Ticket Status Distribution */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-5">Ticket Status</h3>
            {tickets.length === 0 ? (
              <p className="text-sm text-slate-400 py-16 text-center">No ticket data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={ticketStatusData} cx="50%" cy="42%" outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                    {ticketStatusData.map((entry, i) => (
                      <Cell key={i} fill={TICKET_COLORS[entry.name] || CHART_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Line Chart – Booking Trends */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-5">Booking Trends</h3>
            {analyticsLoading ? <ChartSkeleton height={220} /> : trendData.length === 0 ? (
              <p className="text-sm text-slate-400 py-16 text-center">No trend data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 4: Technician Performance ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-5">Technician Performance</h3>
        {analyticsLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
          </div>
        ) : techStats.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No resolved tickets yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3 pr-6">Technician</th>
                  <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3 pr-6">Resolved</th>
                  <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3">Avg Resolution Time</th>
                </tr>
              </thead>
              <tbody>
                {techStats.map((t, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 pr-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs">
                          {(t.technicianName || 'T').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800">{t.technicianName || t.technicianId}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-6 text-center">
                      <span className="inline-block bg-emerald-100 text-emerald-700 font-black text-xs px-2.5 py-1 rounded-full">
                        {t.resolvedCount}
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold text-slate-600">
                      {msToHours(t.avgResolutionTimeMs)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Row 5: Banner + Service Health ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#334155] to-[#0F172A] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute right-0 top-0 opacity-20 pointer-events-none">
            <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#ffffff" d="M45.7,-76.4C58.9,-69.3,69.1,-55.3,77.7,-40.8C86.3,-26.3,93.4,-11.3,91.8,2.7C90.2,16.7,79.9,29.7,70.5,41.8C61.1,53.9,52.6,65.1,40.7,72.2C28.8,79.3,13.5,82.3,-0.9,83.8C-15.3,85.3,-30.6,85.3,-43.3,79.2C-56,73.1,-66.1,60.9,-75.5,47.7C-84.9,34.5,-93.6,20.3,-95.1,5.3C-96.6,-9.7,-90.9,-25.5,-81.4,-38.4C-71.9,-51.3,-58.6,-61.3,-44.6,-67.7C-30.6,-74.1,-15.3,-76.9,0.5,-77.8C16.3,-78.7,32.5,-83.5,45.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
            </svg>
          </div>
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-black mb-3">Operations Hub</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8 font-medium">
              Your centralized control panel for managing campus resources.
              Review active incidents, update facility statuses, and maintain operational efficiency.
            </p>
            <div className="flex gap-4">
              <button onClick={() => navigate('/facilities')} className="bg-[#10B981] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#059669] transition-colors shadow-lg shadow-emerald-900/20">
                Resource Directory
              </button>
              <button onClick={() => navigate('/tickets')} className="bg-white/10 text-white border border-white/20 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-white/20 transition-colors">
                Support Queue
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            Service Health
          </h3>
          <div className="space-y-4">
            <ServiceHealthItem label="API Endpoints"    status="Active"   color="emerald" />
            <ServiceHealthItem label="Primary Database" status="Active"   color="emerald" />
            <ServiceHealthItem label="Asset Storage"    status="Syncing"  color="amber" />
          </div>
        </div>
      </div>

      {/* ── Row 6: Recent Assets / Active Tickets / Support ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6 flex items-center justify-between">
            Recent Assets
            <span className="text-xs text-indigo-600 font-bold cursor-pointer hover:underline" onClick={() => navigate('/facilities')}>View All</span>
          </h3>
          <div className="space-y-4">
            {recentAssets.map((asset, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs">
                  {asset.name ? asset.name.substring(0, 2).toUpperCase() : 'AS'}
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

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6 flex items-center justify-between">
            Active Issues
            <span className="text-xs text-emerald-600 font-bold cursor-pointer hover:underline" onClick={() => navigate('/tickets')}>Queue</span>
          </h3>
          <div className="space-y-4">
            {activeTicketsList.map((ticket, i) => (
              <div
                key={i}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="flex items-start justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-colors"
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

        <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-8 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 mb-4 border border-emerald-50">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="font-black text-emerald-900 text-lg mb-2">Technical Assistance</h3>
          <p className="text-emerald-600/80 text-xs font-medium mb-6">Need help with the platform integration?</p>
          <button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm py-3 rounded-xl transition-colors shadow-sm">
            Contact Tech Team
          </button>
        </div>
      </div>

    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function ServiceHealthItem({ label, status, color }) {
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-700',
    amber:   'bg-amber-100 text-amber-700',
    rose:    'bg-rose-100 text-rose-700',
  };
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
      <span className="font-bold text-slate-700 text-sm">{label}</span>
      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${colorMap[color] || colorMap.emerald}`}>
        {status}
      </span>
    </div>
  );
}

