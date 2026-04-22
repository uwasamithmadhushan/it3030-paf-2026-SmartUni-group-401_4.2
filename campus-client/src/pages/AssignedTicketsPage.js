import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssignedTickets, updateTicketStatus } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { 
  Wrench, Search, Clock, MapPin, Activity, Layers, CheckCircle2, 
  ChevronRight, ArrowRight, ShieldCheck, ClipboardList, AlertTriangle
} from 'lucide-react';

export default function AssignedTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchTickets = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await getAssignedTickets();
      setTickets(data);
    } catch (error) {
      addToast('Failed to sync assignments', 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(true);
    const interval = setInterval(() => fetchTickets(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateTicketStatus(id, { status });
      addToast(`Status updated to ${status}`, 'success');
      fetchTickets(false);
    } catch (error) {
      addToast('Status update failed', 'error');
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = (t.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                           (t.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

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

      {/* Filters */}
      <div className="luna-card !bg-luna-midnight/40 border-luna-aqua/5 !p-10">
        <div className="flex flex-col xl:flex-row gap-10 items-end">
          <div className="flex-1 min-w-[320px] group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">Incident Scan Archive</label>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={22} />
              <input 
                type="text" 
                placeholder="Search ticket title or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="luna-input !pl-16 !py-5"
              />
            </div>
          </div>
          
          <div className="w-full xl:w-72 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">Operational Status</label>
            <div className="relative">
              <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={22} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="luna-input !pl-16 !py-5 appearance-none cursor-pointer"
              >
                <option value="ALL" className="bg-luna-midnight">All Operational States</option>
                <option value="OPEN" className="bg-luna-midnight">Open Request</option>
                <option value="IN_PROGRESS" className="bg-luna-midnight">In Progress</option>
                <option value="RESOLVED" className="bg-luna-midnight">Resolved</option>
                <option value="CLOSED" className="bg-luna-midnight">Closed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 px-6 py-5 bg-luna-aqua/5 border border-luna-aqua/10 rounded-3xl">
             <Activity size={20} className="text-luna-aqua animate-pulse" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">{filteredTickets.length} Deployments Found</span>
          </div>
        </div>
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <AnimatePresence mode="popLayout">
          {filteredTickets.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="luna-card group hover:border-luna-aqua/30 flex flex-col relative overflow-hidden !p-0"
            >
              {/* Card Header Background */}
              <div className="h-32 bg-luna-midnight/60 relative overflow-hidden border-b border-luna-aqua/5">
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                 <div className="absolute inset-0 bg-gradient-to-t from-luna-midnight to-transparent" />
                 <div className="absolute top-8 left-10 flex items-center gap-5">
                    <span className={`luna-badge !px-4 !py-1 ${t.priority === 'URGENT' || t.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20 luna-glow' : 'bg-luna-steel/20 text-luna-cyan border-luna-aqua/10'}`}>
                       {t.priority} DELTA
                    </span>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">INC-#{t.id.substring(0, 12)}</span>
                 </div>
              </div>

              <div className="p-10 flex-1 flex flex-col">
                <h3 className="text-3xl font-black text-white group-hover:text-luna-aqua transition-colors tracking-tighter mb-4">{t.title}</h3>
                
                <div className="flex flex-wrap gap-8 items-center mb-10 text-[10px] font-black text-text-muted uppercase tracking-widest">
                   <div className="flex items-center gap-2">
                      <Clock size={14} className="text-luna-aqua" /> Created: {new Date(t.createdAt).toLocaleDateString()}
                   </div>
                   <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-luna-aqua" /> Sector: {t.location || 'Central Nexus'}
                   </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-luna-midnight/60 border border-luna-aqua/5 mb-10 group/assignment hover:border-luna-aqua/20 transition-all">
                   <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-4">Operational Status</p>
                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform ${
                          t.status === 'RESOLVED' ? 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20' : 
                          t.status === 'IN_PROGRESS' ? 'bg-luna-cyan/10 text-luna-cyan border-luna-cyan/20' :
                          'bg-luna-steel/10 text-text-muted border-luna-steel/20'
                        }`}>
                            {t.status === 'RESOLVED' ? <CheckCircle2 size={24} /> : t.status === 'IN_PROGRESS' ? <Wrench size={24} /> : <AlertTriangle size={24} />}
                        </div>
                        <div>
                            <p className="text-lg font-black text-white tracking-tight">{t.status.replace('_', ' ')}</p>
                        </div>
                      </div>
                      
                      {t.status === 'OPEN' && (
                        <button 
                          onClick={() => handleStatusUpdate(t.id, 'IN_PROGRESS')}
                          className="luna-button !px-6 !py-3 !text-xs !rounded-xl bg-luna-cyan/10 hover:bg-luna-cyan/20 text-luna-cyan"
                        >
                          Start Work
                        </button>
                      )}
                   </div>
                </div>

                <div className="mt-auto pt-10 border-t border-luna-aqua/5 flex justify-end">
                   <button 
                      onClick={() => navigate(`/tickets/${t.id}`)}
                      className="w-16 h-16 luna-glass rounded-3xl flex items-center justify-center text-luna-aqua hover:luna-glow transition-all shadow-xl shadow-luna-aqua/5 group/inspect"
                   >
                      <ArrowRight size={24} className="group-hover/inspect:translate-x-2 transition-transform" />
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

      {filteredTickets.length === 0 && (
        <div className="py-48 text-center luna-card border-dashed border-luna-aqua/10 flex flex-col items-center gap-10 opacity-20">
          <div className="w-32 h-32 luna-glass rounded-[3rem] flex items-center justify-center text-luna-aqua">
             <ClipboardList size={64} />
          </div>
          <div>
             <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">No Assignments</h3>
             <p className="text-base font-medium text-text-muted mt-4">No active assignments match your current filters.</p>
          </div>
          <button onClick={() => {setSearchTerm(''); setStatusFilter('ALL');}} className="luna-button-outline !px-12 !py-4">Reset Filters</button>
        </div>
      )}
    </div>
  );
}
