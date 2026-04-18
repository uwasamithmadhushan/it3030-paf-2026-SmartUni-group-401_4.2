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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[120%] bg-white/5 blur-[120px] rounded-full mix-blend-overlay"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[100%] bg-purple-500/20 blur-[100px] rounded-full mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Live Tracking
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
              Support Hub
            </h1>
            <p className="text-indigo-200/80 font-medium text-lg max-w-xl leading-relaxed">
              Report issues, track progress, and manage campus maintenance requests in real-time.
            </p>
          </div>
          <button
            onClick={() => navigate('/tickets/new')}
            className="group relative inline-flex items-center justify-center gap-2 bg-white text-indigo-900 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] w-full md:w-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <svg className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            <span className="relative z-10">Report New Issue</span>
          </button>
        </div>

        {/* Floating Glass Control Bar */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 p-2 mb-8 flex flex-col md:flex-row gap-2 relative z-10">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by title, ID, or description..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50/50 border-transparent hover:bg-gray-100/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-700 placeholder-gray-400"
            />
            <svg className="w-5 h-5 text-indigo-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-3.5 rounded-2xl bg-gray-50/50 border-transparent hover:bg-gray-100/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-600 appearance-none min-w-[160px] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-3.5 rounded-2xl bg-gray-50/50 border-transparent hover:bg-gray-100/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-600 appearance-none min-w-[160px] cursor-pointer"
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
              className="px-4 py-3.5 rounded-2xl bg-indigo-50/80 border-transparent hover:bg-indigo-100/80 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-indigo-700 appearance-none min-w-[170px] cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="priority">Sort: Priority</option>
            </select>
          </div>
        </div>

        {/* Data Grid / Cards List */}
        {processedTickets.length > 0 ? (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] uppercase tracking-widest font-bold text-gray-400">
                    <th className="px-8 py-5 whitespace-nowrap">Ticket Info</th>
                    <th className="px-8 py-5 whitespace-nowrap">Status</th>
                    <th className="px-8 py-5 whitespace-nowrap">Priority</th>
                    <th className="px-8 py-5 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentTickets.map((ticket) => (
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
                        <button
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-transparent hover:shadow-[0_8px_20px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 transition-all duration-300"
                        >
                          View Details
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
              title="No Tickets Found" 
              message={searchTerm ? "Try adjusting your search or filters to find what you're looking for." : "You haven't reported any issues yet. Click the button above to start."}
              onAction={searchTerm ? () => { setSearchTerm(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); } : null}
              actionText="Clear Filters"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusStyles = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-100/50 text-blue-700';
    case 'IN_PROGRESS': return 'bg-yellow-100/50 text-yellow-700';
    case 'RESOLVED': return 'bg-emerald-100/50 text-emerald-700';
    case 'REJECTED': return 'bg-red-100/50 text-red-700';
    default: return 'bg-gray-100/50 text-gray-600';
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
