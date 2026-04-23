import React, { useState, useEffect, useCallback } from 'react';
import { getAssignedTickets, updateTicketStatus } from '../../services/api';
import TechnicianFilters from './TechnicianFilters';
import TicketSkeleton from './TicketSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Clock, MapPin, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const MyJobsTab = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchJobs = useCallback(async (params = filters) => {
    setLoading(true);
    try {
      const { data } = await getAssignedTickets(params);
      setTickets(data);
    } catch (err) {
      addToast('Failed to sync workload', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    fetchJobs();
  }, [filters, fetchJobs]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateTicketStatus(id, { status });
      addToast(`Mission state updated: ${status}`, 'success');
      fetchJobs();
    } catch (err) {
      addToast('Status transition failed', 'error');
    }
  };

  return (
    <div className="space-y-10">
      <TechnicianFilters onFilterChange={setFilters} resultsCount={tickets.length} />
      
      <div className="luna-stable-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <TicketSkeleton key={i} />)
          ) : (
            <AnimatePresence mode="popLayout">
              {tickets.map((t, idx) => (
                <JobCard 
                  key={t.id} 
                  ticket={t} 
                  onStatusUpdate={handleStatusUpdate} 
                  onView={() => navigate(`/tickets/${t.id}`)}
                  index={idx}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

const JobCard = ({ ticket, onStatusUpdate, onView, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
    className="luna-card group hover:border-luna-aqua/30 flex flex-col relative overflow-hidden !p-0 min-h-[400px]"
  >
    <div className="h-20 bg-luna-midnight/60 relative overflow-hidden border-b border-luna-aqua/5">
       <div className="absolute top-5 left-6 flex items-center gap-4">
          <span className={`luna-badge !px-3 !py-0.5 !text-[8px] ${ticket.priority === 'URGENT' ? 'bg-red-500/10 text-red-400 border-red-500/20 luna-glow' : 'bg-luna-steel/20 text-luna-cyan border-luna-aqua/10'}`}>
             {ticket.priority} DELTA
          </span>
          <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em]">{ticket.ticketCode || `INC-#${ticket.id.substring(0, 8)}`}</span>
       </div>
    </div>

    <div className="p-6 flex-1 flex flex-col">
      <h3 className="text-xl font-black text-white group-hover:text-luna-aqua transition-colors tracking-tighter mb-3 truncate">{ticket.title}</h3>
      <div className="flex flex-wrap gap-4 items-center mb-6 text-[8px] font-black text-text-muted uppercase tracking-widest">
         <div className="flex items-center gap-1.5"><Clock size={12} className="text-luna-aqua" /> {new Date(ticket.createdAt).toLocaleDateString()}</div>
         <div className="flex items-center gap-1.5"><MapPin size={12} className="text-luna-aqua" /> {ticket.location || 'Sector Alpha'}</div>
      </div>

      <div className="p-4 rounded-2xl bg-luna-midnight/60 border border-luna-aqua/5 mb-6">
         <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-3">Status Matrix</p>
         <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                ticket.status === 'RESOLVED' ? 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20' : 
                ticket.status === 'IN_PROGRESS' ? 'bg-luna-cyan/10 text-luna-cyan border-luna-cyan/20' :
                'bg-luna-steel/10 text-text-muted border-luna-steel/20'
              }`}>
                  {ticket.status === 'RESOLVED' ? <CheckCircle2 size={18} /> : <Wrench size={18} />}
              </div>
              <p className="text-sm font-black text-white">{ticket.status.replace('_', ' ')}</p>
            </div>
            
            {ticket.status === 'OPEN' && (
              <button onClick={() => onStatusUpdate(ticket.id, 'IN_PROGRESS')} className="luna-button !px-4 !py-2 !text-[9px] !rounded-lg bg-luna-cyan/10 hover:bg-luna-cyan/20 text-luna-cyan">Start Mission</button>
            )}
            {ticket.status === 'IN_PROGRESS' && (
              <button onClick={() => onStatusUpdate(ticket.id, 'RESOLVED')} className="luna-button !px-4 !py-2 !text-[9px] !rounded-lg bg-luna-aqua/10 hover:bg-luna-aqua/20 text-luna-aqua">Resolve</button>
            )}
         </div>
      </div>

      <div className="mt-auto pt-6 border-t border-luna-aqua/5 flex justify-end">
         <button onClick={onView} className="w-10 h-10 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua hover:luna-glow transition-all">
            <ArrowRight size={18} />
         </button>
      </div>
    </div>
  </motion.div>
);

export default React.memo(MyJobsTab);
