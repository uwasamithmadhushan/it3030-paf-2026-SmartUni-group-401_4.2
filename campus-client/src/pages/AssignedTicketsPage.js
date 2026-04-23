import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssignedTickets, updateTicketStatus } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import TechnicianFilters from '../components/technician/TechnicianFilters';
import { 
  Wrench, Clock, MapPin, CheckCircle2, 
  ArrowRight, ShieldCheck, ClipboardList, AlertTriangle
} from 'lucide-react';

export default function AssignedTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState(null);
  
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchTickets = useCallback(async (params = filterParams, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await getAssignedTickets(params);
      setTickets(data);
    } catch (error) {
      addToast('Failed to sync assignments', 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [filterParams, addToast]);

  useEffect(() => {
    fetchTickets(filterParams, true);
    const interval = setInterval(() => fetchTickets(filterParams, false), 60000);
    return () => clearInterval(interval);
  }, [filterParams, fetchTickets]);

  const handleFilterChange = (newFilters) => {
    setFilterParams(newFilters);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateTicketStatus(id, { status });
      addToast(`Status updated to ${status}`, 'success');
      fetchTickets(filterParams, false);
    } catch (error) {
      addToast('Status update failed', 'error');
    }
  };

  if (loading && tickets.length === 0) return <LoadingSpinner fullScreen message="Accessing Assignment Matrix..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
           <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <Wrench size={12} className="text-luna-aqua" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.4em]">Field Operations</span>
              </div>
           </div>
           <h1 className="text-6xl font-black text-white tracking-tighter leading-none">My <span className="text-luna-aqua">Assignments</span></h1>
           <p className="text-text-muted font-medium mt-4 text-xl">Manage your active field deployments and operational tasks.</p>
        </motion.div>
      </div>

      {/* Filters Section */}
      <TechnicianFilters 
        onFilterChange={handleFilterChange} 
        resultsCount={tickets.length} 
      />

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {tickets.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="luna-card group hover:border-luna-aqua/30 flex flex-col relative overflow-hidden !p-0"
            >
              {/* Card Header Background */}
              <div className="h-20 bg-luna-midnight/60 relative overflow-hidden border-b border-luna-aqua/5">
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                 <div className="absolute inset-0 bg-gradient-to-t from-luna-midnight to-transparent" />
                 <div className="absolute top-5 left-6 flex items-center gap-4">
                    <span className={`luna-badge !px-3 !py-0.5 !text-[8px] ${t.priority === 'URGENT' || t.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20 luna-glow' : 'bg-luna-steel/20 text-luna-cyan border-luna-aqua/10'}`}>
                       {t.priority} DELTA
                    </span>
                    <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em]">{t.ticketCode || `INC-#${t.id.substring(0, 8)}`}</span>
                 </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-white group-hover:text-luna-aqua transition-colors tracking-tighter mb-3 truncate">{t.title}</h3>
                
                <div className="flex flex-wrap gap-4 items-center mb-6 text-[8px] font-black text-text-muted uppercase tracking-widest">
                   <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-luna-aqua" /> {new Date(t.createdAt).toLocaleDateString()}
                   </div>
                   <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-luna-aqua" /> {t.location || 'Central Nexus'}
                   </div>
                </div>

                <div className="p-4 rounded-2xl bg-luna-midnight/60 border border-luna-aqua/5 mb-6 group/assignment hover:border-luna-aqua/20 transition-all">
                   <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-3">Status</p>
                   <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-transform ${
                          t.status === 'RESOLVED' ? 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20' : 
                          t.status === 'IN_PROGRESS' ? 'bg-luna-cyan/10 text-luna-cyan border-luna-cyan/20' :
                          'bg-luna-steel/10 text-text-muted border-luna-steel/20'
                        }`}>
                            {t.status === 'RESOLVED' ? <CheckCircle2 size={18} /> : t.status === 'IN_PROGRESS' ? <Wrench size={18} /> : <AlertTriangle size={18} />}
                        </div>
                        <div>
                            <p className="text-sm font-black text-white tracking-tight">{t.status.replace('_', ' ')}</p>
                        </div>
                      </div>
                      
                      {t.status === 'OPEN' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusUpdate(t.id, 'IN_PROGRESS'); }}
                          className="luna-button !px-4 !py-2 !text-[9px] !rounded-lg bg-luna-cyan/10 hover:bg-luna-cyan/20 text-luna-cyan"
                        >
                          Start
                        </button>
                      )}
                   </div>
                </div>

                <div className="mt-auto pt-6 border-t border-luna-aqua/5 flex justify-end">
                   <button 
                      onClick={() => navigate(`/tickets/${t.id}`)}
                      className="w-10 h-10 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua hover:luna-glow transition-all shadow-xl shadow-luna-aqua/5 group/inspect"
                   >
                      <ArrowRight size={18} className="group-hover/inspect:translate-x-1.5 transition-transform" />
                   </button>
                </div>
              </div>

              {/* Animated Progress Accent */}
              <div className="absolute bottom-0 left-0 h-1 bg-luna-aqua/5 w-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: t.status === 'RESOLVED' ? '100%' : t.status === 'IN_PROGRESS' ? '60%' : '10%' }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className={`h-full ${t.status === 'RESOLVED' ? 'bg-luna-aqua luna-glow' : 'bg-luna-cyan'}`} 
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {tickets.length === 0 && !loading && (
        <div className="py-48 text-center luna-card border-dashed border-luna-aqua/10 flex flex-col items-center gap-10 opacity-20">
          <div className="w-32 h-32 luna-glass rounded-[3rem] flex items-center justify-center text-luna-aqua">
             <ClipboardList size={64} />
          </div>
          <div>
             <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">No Assignments</h3>
             <p className="text-base font-medium text-text-muted mt-4">No active assignments match your current filters.</p>
          </div>
        </div>
      )}
    </div>
  );
}
