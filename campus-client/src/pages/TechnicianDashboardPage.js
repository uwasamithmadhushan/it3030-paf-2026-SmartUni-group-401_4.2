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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-4">Technician Workspace</h1>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Online: {user.username} (Staff ID: {user.id.substring(0, 8)})
          </p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={fetchTickets}
             className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition shadow-sm active:scale-95"
           >
             Refresh Queue
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="My Workload" value={stats.total} icon="📋" color="indigo" />
        <StatCard title="High Priority" value={stats.highPriority} icon="🔥" color="rose" />
        <StatCard title="Active" value={stats.inProgress} icon="🟡" color="yellow" />
        <StatCard title="Done Today" value={stats.completedToday} icon="✅" color="emerald" />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-50 overflow-hidden">
        <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center">
          <h2 className="font-black text-xl text-gray-900">Primary Queue</h2>
          <div className="flex gap-2">
            <span className="text-[10px] font-black uppercase text-gray-400">Items: {tickets.length}</span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-50">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div key={ticket.id} className="p-10 hover:bg-indigo-50/10 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8 group">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${getPriorityStyles(ticket.priority)}`}>
                      {ticket.priority} Priority
                    </span>
                    <span className="text-[10px] font-black text-gray-300 tracking-widest uppercase">#{ticket.id.substring(0, 8)}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-black text-gray-900 text-2xl group-hover:text-indigo-600 transition-colors cursor-pointer mb-2" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                      {ticket.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium">
                      <span className="flex items-center gap-2 bg-gray-100/50 px-3 py-1 rounded-xl">
                        <span className="opacity-50">Reporter:</span>
                        <span className="text-gray-900 font-bold">{ticket.createdByUsername}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        {ticket.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <span className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border w-full sm:w-auto text-center ${getStatusStyles(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    {ticket.status === 'OPEN' && (
                      <button 
                        onClick={() => handleQuickUpdate(ticket.id, 'IN_PROGRESS')}
                        className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                      >
                        Accept
                      </button>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => handleQuickUpdate(ticket.id, 'RESOLVED')}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition shadow-lg shadow-green-100"
                      >
                        Resolve
                      </button>
                    )}
                    <button 
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="flex-1 px-6 py-3 bg-white border-2 border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl transition"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState 
              title="Zero Active Issues" 
              message="Congratulations! Your queue is completely clear. You're all caught up on your assigned tickets."
              icon="🚀"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-50 flex items-center gap-6 relative overflow-hidden group">
    {/* Background accent */}
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-${color}-500 rounded-full opacity-0 group-hover:opacity-5 transition-opacity blur-2xl`}></div>
    
    <div className={`w-16 h-16 rounded-2xl bg-${color}-50 flex items-center justify-center text-3xl shadow-inner`}>
      {icon}
    </div>
    <div>
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</div>
      <div className="text-4xl font-black text-gray-900 tracking-tighter">{value}</div>
    </div>
  </div>
);

const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'text-red-600 border-red-100 bg-red-50';
    case 'HIGH': return 'text-orange-600 border-orange-100 bg-orange-50';
    case 'MEDIUM': return 'text-yellow-600 border-yellow-100 bg-yellow-50';
    case 'LOW': return 'text-green-600 border-green-100 bg-green-50';
    default: return 'text-gray-400 border-gray-50 bg-gray-50';
  }
};

const getStatusStyles = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'IN_PROGRESS': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-100';
    default: return 'bg-gray-50 text-gray-700 border-gray-100';
  }
};

export default TechnicianDashboardPage;
