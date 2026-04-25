import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets, getMyTickets } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import TechnicianFilters from '../components/technician/TechnicianFilters';
import { 
  Plus, 
  Ticket, 
  Calendar,
  Layers,
  ArrowRight,
  Globe,
  Clock,
  MapPin,
  Zap
} from 'lucide-react';

export default function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTickets = useCallback(async (params = filterParams, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      let res;
      if (user.role === 'USER') {
        res = await getMyTickets(params);
      } else {
        res = await getAllTickets(params);
      }
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to synchronize incident archive');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user.role, filterParams]);

  useEffect(() => {
    fetchTickets(filterParams, true);
    const interval = setInterval(() => fetchTickets(filterParams, false), 60000);
    return () => clearInterval(interval);
  }, [filterParams, fetchTickets]);

  const handleFilterChange = (newFilters) => {
    setFilterParams(newFilters);
  };

  if (loading && tickets.length === 0) return <LoadingSpinner fullScreen message="Synchronizing Global Registry..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
      
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
           <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <Globe size={12} className="text-luna-aqua animate-pulse" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.2em]">Global Intelligence Feed</span>
              </div>
           </div>
           <h1 className="text-6xl font-black text-white tracking-tighter">Raise a <span className="text-luna-aqua">Ticket</span></h1>
           <p className="text-text-muted font-medium mt-4 text-xl">High-fidelity incident monitoring and operational resource tracking.</p>
        </motion.div>
        
        {user.role === 'USER' && (
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/tickets/new')} 
            className="luna-button !px-10 !py-4 flex items-center gap-4 shadow-2xl shadow-luna-aqua/20"
          >
            <Plus size={20} /> Register Discrepancy
          </motion.button>
        )}
      </div>

      {/* Professional Filters */}
      <TechnicianFilters 
        onFilterChange={handleFilterChange}
        resultsCount={tickets.length}
      />

      {/* Incident Visualization Grid */}
      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="popLayout">
          {tickets.map((ticket, idx) => (
            <motion.div 
              key={ticket.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="luna-card group cursor-pointer relative overflow-hidden !p-0 hover:border-luna-aqua/30"
            >
              <div className="px-10 py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="flex items-center gap-10 flex-1">
                  <div className="w-20 h-20 luna-glass rounded-[2rem] flex items-center justify-center text-luna-aqua group-hover:luna-glow transition-all shrink-0">
                    <Ticket size={32} className="group-hover:rotate-12 transition-transform" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-5 mb-3">
                      <span className={`luna-badge !px-4 !py-1 ${getStatusStyles(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Code: {ticket.ticketCode}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white group-hover:text-luna-aqua transition-colors truncate tracking-tight">{ticket.title}</h3>
                    <div className="flex flex-wrap items-center gap-8 mt-5 text-text-muted font-black text-[10px] uppercase tracking-[0.2em]">
                       <span className="flex items-center gap-2 group-hover:text-white transition-colors"><Calendar size={14} className="text-luna-aqua" /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                       <span className="flex items-center gap-2 group-hover:text-white transition-colors"><Layers size={14} className="text-luna-aqua" /> {ticket.category}</span>
                       <span className="flex items-center gap-2 group-hover:text-white transition-colors"><MapPin size={14} className="text-luna-aqua" /> {ticket.location || 'Sector Alpha'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-2">Priority Tier</p>
                    <div className="flex items-center gap-3 justify-end">
                       <Zap size={14} className={getPriorityStyles(ticket.priority).text} />
                       <p className={`text-base font-black ${getPriorityStyles(ticket.priority).text}`}>{ticket.priority}</p>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-[1.5rem] bg-luna-steel/10 flex items-center justify-center text-text-muted group-hover:bg-luna-aqua group-hover:text-luna-midnight transition-all group-hover:translate-x-3 shadow-lg group-hover:luna-glow">
                    <ArrowRight size={28} />
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 h-1 bg-luna-aqua/5 w-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: ticket.status === 'CLOSED' || ticket.status === 'RESOLVED' ? '100%' : ticket.status === 'IN_PROGRESS' ? '50%' : '10%' }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className={`h-full bg-luna-aqua ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'luna-glow' : ''}`} 
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {tickets.length === 0 && !loading && (
          <div className="py-40 text-center luna-card border-dashed border-luna-aqua/10 flex flex-col items-center gap-8">
            <div className="w-32 h-32 luna-glass rounded-[3rem] flex items-center justify-center text-text-muted opacity-10">
              <Plus size={64} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white/20 tracking-tighter italic uppercase">Registry Sync Failed</h3>
              <p className="text-base font-medium text-text-muted mt-4">No incident entries detected for current synchronization parameters.</p>
            </div>
          </div>
        )}
      </div>

      {/* Global Status Footer */}
      <div className="flex items-center justify-between pt-12 border-t border-luna-aqua/10 text-[9px] font-black text-text-muted uppercase tracking-[0.5em]">
         <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-luna-aqua animate-pulse" />
            Central Hub Synchronized
         </div>
         <div className="flex items-center gap-8">
            <span>Operational Integrity: 99.9%</span>
            <span>Uptime: 432:12:08</span>
         </div>
      </div>
    </div>
  );
}

const getStatusStyles = (status) => {
  switch (status) {
    case 'OPEN': return 'bg-luna-steel/10 text-luna-cyan border-luna-cyan/20';
    case 'IN_PROGRESS': return 'bg-luna-cyan/10 text-luna-cyan border-luna-cyan/20';
    case 'RESOLVED': return 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20 luna-glow';
    case 'CLOSED': return 'bg-text-muted/10 text-text-muted border-text-muted/20';
    case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-white/5 text-text-muted border-white/5';
  }
};

const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'URGENT': return { text: 'text-red-400' };
    case 'HIGH': return { text: 'text-luna-aqua' };
    case 'MEDIUM': return { text: 'text-luna-cyan' };
    default: return { text: 'text-text-muted' };
  }
};
