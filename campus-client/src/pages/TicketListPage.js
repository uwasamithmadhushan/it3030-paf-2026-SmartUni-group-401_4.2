import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllTickets, deleteTicket } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy] = useState('newest');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, ticketId: null });

  const navigate = useNavigate();
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
      let filtered = data;
      if (user.role === 'USER') {
        filtered = data.filter(t => t.createdById === user.id);
      } else if (user.role === 'TECHNICIAN') {
        filtered = data.filter(t => t.assignedTechnicianId === user.id);
      }
      setTickets(filtered);
    } catch (err) {
      addToast('Failed to retrieve reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);

  if (loading) return <LoadingSpinner fullScreen message="Accessing Archive..." />;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-luxury">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-ivory-warm/10">
        <div>
           <h1 className="text-4xl font-black text-ivory-warm tracking-tight">Support Queue</h1>
           <p className="text-sm font-bold text-blush-soft uppercase tracking-widest mt-2">Active Incident Registry</p>
        </div>
        <button onClick={() => navigate('/tickets/new')} className="luxury-button">
          New Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === f 
                ? 'bg-blush-soft text-plum-dark shadow-luxury' 
                : 'bg-white/5 text-ivory-warm/40 hover:text-ivory-warm hover:bg-white/10'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map((ticket) => (
          <div 
            key={ticket.id} 
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            className="luxury-card group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg className="w-16 h-16 text-ivory-warm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
            </div>

            <div className="flex justify-between items-start mb-6">
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-bold text-ivory-warm/20 uppercase">#{ticket.id.substring(0, 8)}</span>
            </div>

            <h3 className="text-xl font-black text-ivory-warm mb-2 group-hover:text-blush-soft transition-colors line-clamp-1">{ticket.title}</h3>
            <p className="text-sm text-ivory-warm/50 line-clamp-2 mb-6 font-medium leading-relaxed">{ticket.description}</p>

            <div className="flex items-center justify-between pt-6 border-t border-ivory-warm/5">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-blush-soft uppercase tracking-widest">Priority</span>
                <span className={`text-xs font-bold ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black text-ivory-warm/30 uppercase tracking-widest">Raised</span>
                <p className="text-[10px] font-bold text-ivory-warm/60">{new Date(ticket.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="py-32 text-center luxury-card border-dashed">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
             <span className="text-4xl opacity-20">📂</span>
          </div>
          <h3 className="text-xl font-black text-ivory-warm/40 italic tracking-tight">No matching reports found</h3>
        </div>
      )}
    </div>
  );
}

const getStatusStyles = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'IN_PROGRESS': return 'bg-violet-deep/20 text-ivory-warm border-ivory-warm/20';
    case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'CLOSED': return 'bg-white/5 text-ivory-warm/40 border-white/10';
    default: return 'bg-white/5 text-ivory-warm/40 border-white/10';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'text-rose-400';
    case 'HIGH': return 'text-blush-soft';
    case 'MEDIUM': return 'text-ivory-warm/60';
    case 'LOW': return 'text-emerald-400';
    default: return 'text-ivory-warm/30';
  }
};
