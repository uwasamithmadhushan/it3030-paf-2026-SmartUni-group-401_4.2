import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

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

  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await getAllTickets();
      setTickets(data);
    } catch (err) {
      setError('Failed to load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Memoized Filtered and Sorted Tickets
  const processedTickets = useMemo(() => {
    let result = [...tickets];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(term) || 
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
      );
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      result = result.filter(t => t.status === statusFilter);
    }

    // Priority Filter
    if (priorityFilter !== 'ALL') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    // Sorting
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

  // Derived Pagination
  const totalPages = Math.ceil(processedTickets.length / itemsPerPage);
  const currentTickets = processedTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <LoadingSpinner fullScreen message="Fetching support tickets..." />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Support Tickets</h1>
          <p className="text-gray-500 font-medium">Manage and track campus support requests</p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold transition shadow-lg hover:shadow-indigo-200 flex items-center gap-2 group w-full md:w-auto justify-center"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Report New Issue
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden mb-8">
        {/* Advanced Filters */}
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative col-span-1 md:col-span-1">
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 py-2.5"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">🔵 Open</option>
            <option value="IN_PROGRESS">🟡 In Progress</option>
            <option value="RESOLVED">🟢 Resolved</option>
            <option value="CLOSED">⚪ Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
            className="rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 py-2.5"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 py-2.5"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
            <option value="priority">Sort by: Priority</option>
          </select>
        </div>

        {processedTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.1em] font-black">
                  <th className="px-8 py-5">Ticket Info</th>
                  <th className="px-8 py-5">Status & Category</th>
                  <th className="px-8 py-5">Priority</th>
                  <th className="px-8 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-mono text-gray-400">#{ticket.id.substring(0, 8)}</span>
                        <div className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{ticket.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{ticket.description}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                          {ticket.category.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-sm font-bold ${getPriorityColor(ticket.priority)} flex items-center gap-1.5`}>
                        <span className={`w-2 h-2 rounded-full ${getPriorityDotColor(ticket.priority)} animate-pulse`}></span>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="bg-gray-50 hover:bg-indigo-600 hover:text-white text-gray-600 p-2.5 rounded-xl transition-all shadow-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            title="No Tickets Found" 
            message={searchTerm ? "Try adjusting your search or filters to find what you're looking for." : "You haven't reported any issues yet. Click the button above to start."}
            onAction={searchTerm ? () => { setSearchTerm(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); } : null}
            actionText="Clear Filters"
          />
        )}

        {/* Improved Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-50 bg-gray-50/20 flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">
              Showing <span className="text-gray-900 font-bold">{Math.min(processedTickets.length, (currentPage-1)*itemsPerPage + 1)}-{Math.min(processedTickets.length, currentPage*itemsPerPage)}</span> of {processedTickets.length}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-xl border border-gray-200 hover:bg-white transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold transition ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-gray-100 text-gray-600 border border-transparent'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-xl border border-gray-200 hover:bg-white transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusStyles = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'IN_PROGRESS': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-100';
    default: return 'bg-gray-50 text-gray-500 border-gray-100';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'text-red-700';
    case 'HIGH': return 'text-orange-600';
    case 'MEDIUM': return 'text-yellow-600';
    case 'LOW': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

const getPriorityDotColor = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'bg-red-600';
    case 'HIGH': return 'bg-orange-500';
    case 'MEDIUM': return 'bg-yellow-500';
    case 'LOW': return 'bg-green-500';
    default: return 'bg-gray-400';
  }
};

export default TicketListPage;
