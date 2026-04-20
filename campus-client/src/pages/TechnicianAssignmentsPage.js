import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTickets, updateTicketStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AssignmentSkeleton = () => (
  <tr className="animate-pulse border-b border-slate-50">
    <td className="px-8 py-6">
      <div className="h-3 bg-slate-100 rounded w-16 mb-2"></div>
      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
    </td>
    <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
    <td className="px-8 py-6"><div className="h-6 bg-slate-100 rounded-full w-16"></div></td>
    <td className="px-8 py-6"><div className="h-10 bg-slate-100 rounded w-20"></div></td>
    <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
    <td className="px-8 py-6 text-right"><div className="h-10 bg-slate-100 rounded-xl w-24 ml-auto"></div></td>
  </tr>
);

const TechnicianAssignmentsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchTickets(true);
      const interval = setInterval(() => fetchTickets(false), 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchTickets = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await getAllTickets();
      setTickets(data.filter(t => t.assignedTechnicianId === user.id));
    } catch (error) {
      addToast('Error fetching assignments', 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateTicketStatus(id, { status, note: `Technician updated status to ${status}` });
      addToast(`Status updated to ${status.replace('_', ' ')}`, 'success');
      fetchTickets();
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (t.location && t.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 max-w-[1600px] mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Work Order Management</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Manage and update your assigned incident reports</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100">
              {filteredTickets.length} Jobs Total
           </div>
           <button onClick={fetchTickets} className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
           </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative col-span-2">
          <input 
            type="text" 
            placeholder="Search by ID, title or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <svg className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
        </select>
        <select 
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden min-h-[400px]">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">Job Details</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Location</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Priority</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">SLA Time</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Status</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-48">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [...Array(5)].map((_, i) => <AssignmentSkeleton key={i} />)
            ) : (
              filteredTickets.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-6">
                  <p className="text-xs font-black text-indigo-600 mb-0.5">#{t.id.substring(0, 8)}</p>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => navigate(`/tickets/${t.id}`)}>{t.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Reported: {new Date(t.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-8 py-6">
                   <p className="text-sm font-bold text-slate-700">📍 {t.location || 'General Site'}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getPriorityStyles(t.priority)}`}>{t.priority}</span>
                </td>
                <td className="px-8 py-6">
                   <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Remaining</p>
                      <p className="text-sm font-black text-slate-900">1h 45m</p>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${t.status === 'IN_PROGRESS' ? 'bg-amber-500 animate-pulse' : t.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t.status.replace('_', ' ')}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-3">
                     <StatusDropdown 
                        currentStatus={t.status} 
                        onUpdate={(newStatus) => handleStatusUpdate(t.id, newStatus)} 
                     />
                     <button 
                        onClick={() => navigate(`/tickets/${t.id}`)} 
                        className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                     >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                     </button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
        {filteredTickets.length === 0 && (
           <div className="py-20 text-center">
              <p className="text-slate-400 font-bold italic">No matching assignments found.</p>
           </div>
        )}
      </div>
    </motion.div>
  );
};

function getPriorityStyles(priority) {
  switch (priority) {
    case 'CRITICAL': return 'bg-rose-50 text-rose-600 border-rose-100';
    case 'HIGH': return 'bg-orange-50 text-orange-600 border-orange-100';
    case 'MEDIUM': return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'LOW': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    default: return 'bg-slate-50 text-slate-400 border-slate-100';
  }
}

function StatusDropdown({ currentStatus, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const options = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'COMPLETED'];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-white hover:border-indigo-300 transition-all shadow-sm active:scale-95"
      >
        {currentStatus.replace('_', ' ')}
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 animate-scale-up">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onUpdate(opt); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors ${currentStatus === opt ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500'}`}
              >
                {opt.replace('_', ' ')}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default TechnicianAssignmentsPage;
