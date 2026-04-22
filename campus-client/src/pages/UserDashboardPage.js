import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllTickets } from '../services/api';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await getAllTickets();
        setTickets(data);
      } catch (err) {
        console.error('Failed to fetch tickets');
      } finally {
        setLoadingTickets(false);
      }
    };
    fetchTickets();
  }, []);

  const myTickets = tickets.filter(t => t.createdById === user?.id);

  const stats = {
    open: myTickets.filter(t => t.status === 'OPEN').length,
    inProgress: myTickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: myTickets.filter(t => t.status === 'RESOLVED').length,
  };

  const recentUpdates = tickets
    .flatMap(t => t.updates.map(u => ({ ...u, ticketTitle: t.title, ticketId: t.id })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back, {user?.username}. Here is an overview of your campus activity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Actions & Metrics */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard 
              title="Open Requests" 
              value={stats.open} 
              icon="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" 
              colorClass="text-blue-600 bg-blue-50 border-blue-200" 
            />
            <MetricCard 
              title="In Progress" 
              value={stats.inProgress} 
              icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              colorClass="text-amber-600 bg-amber-50 border-amber-200" 
            />
            <MetricCard 
              title="Resolved" 
              value={stats.resolved} 
              icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              colorClass="text-emerald-600 bg-emerald-50 border-emerald-200" 
            />
          </div>

          {/* Ticket Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="font-semibold text-slate-900">Recent Updates</h2>
              </div>
              <button onClick={() => navigate('/tickets')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                View All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            
            <div className="divide-y divide-slate-100">
              {recentUpdates.length > 0 ? recentUpdates.map((update, i) => (
                <div key={i} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{update.ticketTitle}</p>
                      <p className="mt-1 text-sm text-slate-500">{update.note}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 whitespace-nowrap">
                      {new Date(update.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  <p className="text-sm font-medium">No Recent Activity</p>
                  <p className="text-xs mt-1">Your timeline is quiet right now</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Links */}
        <div className="space-y-6">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Quick Actions</h2>
          
          <button
            onClick={() => navigate('/tickets/new')}
            className="w-full flex items-center p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors text-left group"
          >
            <div className="p-3 bg-white/20 rounded-lg mr-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">New Request</p>
              <p className="text-xs text-indigo-100 mt-0.5">Report a new incident</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/facilities')}
            className="w-full flex items-center p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-sm transition-colors text-left group"
          >
            <div className="p-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg mr-4 group-hover:bg-slate-100 transition-colors">
              <span className="text-xl leading-none">🏛️</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Facilities &amp; Assets</p>
              <p className="text-xs text-slate-500 mt-0.5">Browse resources</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/bookings/new')}
            className="w-full flex items-center p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-sm transition-colors text-left group"
          >
            <div className="p-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg mr-4 group-hover:bg-slate-100 transition-colors">
              <span className="text-xl leading-none">📅</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">Book a Facility</p>
              <p className="text-xs text-slate-500 mt-0.5">Schedule a resource</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, colorClass }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg border ${colorClass}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
