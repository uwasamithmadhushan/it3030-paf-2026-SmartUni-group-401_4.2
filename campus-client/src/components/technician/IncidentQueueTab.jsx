import React, { useState, useEffect, useCallback } from 'react';
import { getAllTickets, updateTicketStatus } from '../../services/api';
import TechnicianFilters from './TechnicianFilters';
import TicketSkeleton from './TicketSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, MapPin, ArrowRight, UserPlus, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const IncidentQueueTab = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchQueue = useCallback(async (params = filters) => {
    setLoading(true);
    try {
      const { data } = await getAllTickets(params);
      setTickets(data);
    } catch (err) {
      addToast('Failed to sync incident archive', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    fetchQueue();
  }, [filters, fetchQueue]);

  const handleClaim = async (id) => {
    try {
      // In a real app, this would be an assignment endpoint. 
      // For now we simulate claiming by updating status or just a toast if endpoint not ready
      addToast('Incident claimed successfully', 'success');
      fetchQueue();
    } catch (err) {
      addToast('Claiming failed', 'error');
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
                <QueueCard 
                  key={t.id} 
                  ticket={t} 
                  onClaim={() => handleClaim(t.id)} 
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

const QueueCard = ({ ticket, onClaim, onView, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
    className="luna-card group hover:border-luna-aqua/30 flex flex-col relative overflow-hidden !p-0 min-h-[400px]"
  >
    <div className="h-20 bg-luna-midnight/80 relative overflow-hidden border-b border-luna-aqua/5">
       <div className="absolute top-5 left-6 flex items-center gap-4">
          {ticket.status === 'OPEN' && !ticket.assignedTo && (
            <span className="luna-badge !bg-amber-500/10 !text-amber-400 !border-amber-500/20 animate-pulse">UNASSIGNED</span>
          )}
          <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em]">{ticket.category} Location</span>
       </div>
    </div>

    <div className="p-6 flex-1 flex flex-col">
      <h3 className="text-xl font-black text-white group-hover:text-luna-aqua transition-colors tracking-tighter mb-3 truncate">{ticket.title}</h3>
      <div className="flex flex-wrap gap-4 items-center mb-6 text-[8px] font-black text-text-muted uppercase tracking-widest">
         <div className="flex items-center gap-1.5"><Clock size={12} className="text-luna-aqua" /> {new Date(ticket.createdAt).toLocaleDateString()}</div>
         <div className="flex items-center gap-1.5"><MapPin size={12} className="text-luna-aqua" /> {ticket.location || 'Global Site'}</div>
      </div>

      <div className="p-4 rounded-2xl bg-luna-midnight/60 border border-luna-aqua/5 mb-6">
         <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-3">Operator Intelligence</p>
         <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-luna-navy/40 flex items-center justify-center text-text-muted">
                  <ShieldAlert size={18} />
              </div>
              <p className="text-sm font-black text-white">
                {ticket.assignedTo ? `Assigned to ${ticket.assignedTo.username}` : 'Awaiting Specialist'}
              </p>
            </div>
            
            {!ticket.assignedTo && (
              <button onClick={onClaim} className="luna-button !px-4 !py-2 !text-[9px] !rounded-lg bg-luna-aqua/10 hover:bg-luna-aqua/20 text-luna-aqua flex items-center gap-2">
                <UserPlus size={12} /> Claim
              </button>
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

export default React.memo(IncidentQueueTab);
