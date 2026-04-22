import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets, updateTicketStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const TechnicianDashboardPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await getAllTickets();
      // Filter for tickets assigned to this technician
      setTickets(data.filter(t => t.assignedTechnicianId === user.id));
    } catch (error) {
      addToast('Error fetching assigned tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUpdate = async (id, status) => {
    try {
      await updateTicketStatus(id, { 
        status, 
        note: `Technician quick-status update to ${status}` 
      });
      addToast(`Status updated to ${status.replace('_', ' ')}`, 'success');
      fetchTickets();
    } catch (error) {
      addToast('Quick update failed', 'error');
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading your queue..." />;

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    highPriority: tickets.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL').length,
    completedToday: tickets.filter(t => 
      t.status === 'RESOLVED' && 
      new Date(t.updatedAt).toDateString() === new Date().toDateString()
    ).length
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Technician Dashboard</h1>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Online: {user.username} (Staff ID: {user.id.substring(0, 8)})
          </p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={fetchTickets}
             className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm flex items-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             Refresh Queue
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="My Workload" value={stats.total} icon="📋" color="indigo" />
        <StatCard title="High Priority" value={stats.highPriority} icon="🔥" color="rose" />
        <StatCard title="Active" value={stats.inProgress} icon="⚡" color="amber" />
        <StatCard title="Done Today" value={stats.completedToday} icon="✅" color="emerald" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-900">Primary Queue</h2>
          <div className="flex gap-2">
            <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">{tickets.length} Items</span>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6 group">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${getPriorityStyles(ticket.priority)}`}>
                      {ticket.priority} Priority
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">#{ticket.id.substring(0, 8)}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#5B5CE6] transition-colors cursor-pointer mb-1" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                      {ticket.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="text-slate-400">Reporter:</span>
                        <span className="text-slate-700 font-bold">{ticket.createdByUsername}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        {ticket.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border text-center ${getStatusStyles(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    {ticket.status === 'OPEN' && (
                      <button 
                        onClick={() => handleQuickUpdate(ticket.id, 'IN_PROGRESS')}
                        className="flex-1 px-4 py-2 bg-[#5B5CE6] text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        Accept
                      </button>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => handleQuickUpdate(ticket.id, 'RESOLVED')}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Resolve
                      </button>
                    )}
                    <button 
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="flex-1 px-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12">
              <EmptyState 
                title="Zero Active Issues" 
                message="Your queue is completely clear. You're all caught up on your assigned tickets."
                icon="🎉"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border ${colorMap[color] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
};

const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'text-rose-600 border-rose-200 bg-rose-50';
    case 'HIGH': return 'text-orange-600 border-orange-200 bg-orange-50';
    case 'MEDIUM': return 'text-amber-600 border-amber-200 bg-amber-50';
    case 'LOW': return 'text-emerald-600 border-emerald-200 bg-emerald-50';
    default: return 'text-slate-500 border-slate-200 bg-slate-50';
  }
};

const getStatusStyles = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

export default TechnicianDashboardPage;
