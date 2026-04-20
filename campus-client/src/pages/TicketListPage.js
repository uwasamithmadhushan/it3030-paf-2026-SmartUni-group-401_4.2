import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTickets, deleteTicket } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';

const TicketSkeleton = () => (
  <tr className="animate-pulse border-b border-gray-50">
    <td className="px-8 py-6">
      <div className="flex flex-col gap-2">
        <div className="h-4 bg-slate-100 rounded-md w-1/4"></div>
        <div className="h-6 bg-slate-100 rounded-lg w-3/4"></div>
        <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
      </div>
    </td>
    <td className="px-8 py-6"><div className="h-8 bg-slate-100 rounded-xl w-24"></div></td>
    <td className="px-8 py-6"><div className="h-8 bg-slate-100 rounded-full w-20"></div></td>
    <td className="px-8 py-6 text-right"><div className="h-10 bg-slate-100 rounded-xl w-32 ml-auto"></div></td>
  </tr>
);

const TicketListPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, ticketId: null });

  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchTickets(true);
    const interval = setInterval(() => fetchTickets(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await getAllTickets();
      setTickets(data);
    } catch (err) {
      setError('Failed to load tickets. Please try again later.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTicket(id);
      addToast('Ticket deleted successfully', 'success');
      fetchTickets(false);
    } catch (err) {
      addToast('Failed to delete ticket', 'error');
    }
  };

  // Memoized Filtered and Sorted Tickets
  const processedTickets = useMemo(() => {
    let result = [...tickets];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(term) || 
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(t => t.status === statusFilter);
    }

    if (priorityFilter !== 'ALL') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'priority') {
        const levels = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return levels[b.priority] - levels[a.priority];
      }
      return 0;
    });

    return result;
  }, [tickets, searchTerm, statusFilter, priorityFilter, sortBy]);

  const totalPages = Math.ceil(processedTickets.length / itemsPerPage);
  const currentTickets = processedTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative pb-10"
    >
      {/* Header Section */}
      <div className="bg-[#10B981] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-6 shadow-sm">
        <div className="text-white">
          <h1 className="text-2xl font-bold mb-1">My Incident Reports</h1>
          <p className="text-white/80 text-sm">Track and manage your submitted campus issues.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTickets}
            className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          {user?.role !== 'TECHNICIAN' && (
            <button
              onClick={() => navigate('/tickets/new')}
              className="inline-flex items-center gap-2 bg-white text-[#10B981] px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-gray-50 shadow-sm"
            >
              <span className="text-lg leading-none mb-0.5">+</span>
              <span>New Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-8 flex flex-col md:flex-row gap-3 relative z-10">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by title, location or description..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 placeholder-gray-400"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 md:border-l md:border-gray-100 md:pl-4">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="py-2 pr-8 pl-3 bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Data Grid / Cards List */}
      {(processedTickets.length > 0 || loading) ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100/80 overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-widest font-black text-slate-400">
                  <th className="px-8 py-5 w-1/2">Ticket Info</th>
                  <th className="px-8 py-5 w-32">Status</th>
                  <th className="px-8 py-5 w-40">Priority</th>
                  <th className="px-8 py-5 w-40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(5)].map((_, i) => <TicketSkeleton key={i} />)
                ) : (
                  currentTickets.map((ticket) => (
                  <tr key={ticket.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-md tracking-wider">
                            #{ticket.id.substring(0, 8)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md tracking-wider">
                            {ticket.category.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {ticket.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1 max-w-md font-medium">
                          {ticket.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold leading-5 shadow-sm border border-white ${getStatusStyles(ticket.status)}`}>
                         {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-inner ${getPriorityIconBg(ticket.priority)}`}>
                          <div className={`w-2 h-2 rounded-full ${getPriorityDotColor(ticket.priority)}`}></div>
                        </div>
                        <span className={`text-sm font-bold tracking-wide ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-emerald-600 hover:text-white hover:border-transparent transition-all"
                        >
                          View
                        </button>
                        {(user.role === 'ADMIN' || ticket.createdById === user?.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({ isOpen: true, ticketId: ticket.id });
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Delete Ticket"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <ConfirmationModal 
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, ticketId: null })}
            onConfirm={() => handleDelete(deleteModal.ticketId)}
            title="Delete Incident Report"
            message="Are you sure you want to permanently delete this incident report? This action cannot be undone and will remove all associated data."
            confirmText="Delete Ticket"
            type="danger"
          />

          {/* Pagination Grid Footer */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-500 font-medium">
                Showing <span className="text-indigo-900 font-bold px-1">{Math.min(processedTickets.length, (currentPage-1)*itemsPerPage + 1)} - {Math.min(processedTickets.length, currentPage*itemsPerPage)}</span> of <span className="font-bold px-1">{processedTickets.length}</span> tickets
              </span>
              <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex px-2 items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                        currentPage === i + 1 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState 
            title={searchTerm || statusFilter !== 'ALL' ? "No Tickets Found" : "No tickets found"} 
            message={searchTerm || statusFilter !== 'ALL' ? "Try adjusting your search or filters to find what you're looking for." : "You haven't reported any incidents yet."}
            onAction={searchTerm || statusFilter !== 'ALL' ? () => { setSearchTerm(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); } : () => navigate('/tickets/new')}
            actionText={searchTerm || statusFilter !== 'ALL' ? "Clear Filters" : "Report Your First Incident"}
          />
        </div>
      )}
      
      {/* Modal Outlet for Nested Routes (like CreateTicketPage) */}
      <Outlet context={{ refreshTickets: fetchTickets }} />
    </motion.div>
  );
};

const getStatusStyles = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-amber-100/50 text-amber-700';
    case 'IN_PROGRESS': return 'bg-slate-100/50 text-slate-700';
    case 'RESOLVED': return 'bg-emerald-100/50 text-emerald-700';
    case 'REJECTED': return 'bg-rose-100/50 text-rose-700';
    default: return 'bg-slate-100/50 text-slate-600';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'text-rose-600';
    case 'HIGH': return 'text-orange-600';
    case 'MEDIUM': return 'text-amber-600';
    case 'LOW': return 'text-emerald-600';
    default: return 'text-slate-600';
  }
};

const getPriorityIconBg = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'bg-rose-50';
    case 'HIGH': return 'bg-orange-50';
    case 'MEDIUM': return 'bg-amber-50';
    case 'LOW': return 'bg-emerald-50';
    default: return 'bg-slate-50';
  }
};

const getPriorityDotColor = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
    case 'HIGH': return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]';
    case 'MEDIUM': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
    case 'LOW': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
    default: return 'bg-slate-400';
  }
};

export default TicketListPage;
