import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getAllTickets } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  Calendar as CalendarIcon,
  Navigation,
  Activity,
  Layers,
  Search,
  MoreVertical
} from 'lucide-react';

export default function TechnicianSchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await getAllTickets();
      const myTickets = data.filter(t => t.assignedTechnicianId === user?.id);
      setTickets(myTickets);
    } catch (error) {
      console.error('Failed to synchronize schedule intelligence');
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const monthYearLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    const grid = [];
    const prevMonthDays = daysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      grid.push({ day: prevMonthDays - i, currentMonth: false });
    }
    for (let i = 1; i <= days; i++) {
      grid.push({ day: i, currentMonth: true });
    }
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      grid.push({ day: i, currentMonth: false });
    }
    return grid;
  }, [currentDate]);

  const ticketsForSelectedDate = useMemo(() => {
    const isTodaySelected = 
      selectedDate.getDate() === new Date().getDate() &&
      selectedDate.getMonth() === new Date().getMonth() &&
      selectedDate.getFullYear() === new Date().getFullYear();

    return tickets.filter(t => {
      const ticketDate = new Date(t.createdAt);
      const isSameDay = ticketDate.getDate() === selectedDate.getDate() &&
                        ticketDate.getMonth() === selectedDate.getMonth() &&
                        ticketDate.getFullYear() === selectedDate.getFullYear();
      
      if (isTodaySelected) {
        return isSameDay || t.status === 'PENDING' || t.status === 'IN_PROGRESS';
      }
      return isSameDay;
    });
  }, [tickets, selectedDate]);

  if (loading && tickets.length === 0) return <LoadingSpinner fullScreen message="Synchronizing Temporal Schedule..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-luna-aqua/10">
        <div>
           <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <ShieldCheck size={12} className="text-luna-aqua" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-widest">Maintenance Planner</span>
              </div>
           </div>
           <h1 className="text-5xl font-black text-white tracking-tighter">Shift <span className="text-luna-aqua">Schedule</span></h1>
           <p className="text-text-muted font-medium mt-2">Executive temporal planning and deployment synchronization.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}
             className="luna-button !px-8 shadow-lg shadow-luna-aqua/20"
           >
             Today
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Calendar Side */}
        <div className="xl:col-span-8 luna-card">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <CalendarIcon size={16} className="text-luna-aqua" /> Maintenance Registry
              </h3>
              <div className="flex items-center gap-6 luna-glass px-4 py-2 rounded-2xl">
                 <button onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center text-luna-aqua hover:luna-glow transition-all">
                    <ChevronLeft size={20} />
                 </button>
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] min-w-[160px] text-center">{monthYearLabel}</span>
                 <button onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center text-luna-aqua hover:luna-glow transition-all">
                    <ChevronRight size={20} />
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-7 gap-px bg-luna-aqua/10 rounded-[2rem] overflow-hidden border border-luna-aqua/5">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                 <div key={day} className="bg-luna-midnight/40 py-5 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                    {day}
                 </div>
              ))}
              {calendarDays.map((d, i) => {
                  const isToday = d.currentMonth && d.day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                  const isSelected = d.currentMonth && d.day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear();
                  const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d.day);
                  const dayTickets = tickets.filter(t => {
                    const tDate = new Date(t.createdAt);
                    return tDate.getDate() === d.day && tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
                  });
                  const hasUrgent = dayTickets.some(t => t.priority === 'CRITICAL' || t.priority === 'HIGH');
                  
                  return (
                    <div 
                      key={i} 
                      onClick={() => d.currentMonth && setSelectedDate(dayDate)}
                      className={`bg-luna-midnight/20 h-20 sm:h-24 p-2 sm:p-3 flex flex-col transition-all cursor-pointer hover:bg-luna-aqua/5 border-luna-aqua/5 ${!d.currentMonth ? 'opacity-10 pointer-events-none' : ''} ${isSelected ? 'bg-luna-aqua/10 !border-luna-aqua/20 luna-glow-inset' : ''}`}
                    >
                       <span className={`text-[10px] font-black w-6 h-6 flex shrink-0 items-center justify-center rounded-lg transition-all ${isToday ? 'bg-luna-aqua text-luna-midnight shadow-lg luna-glow' : isSelected ? 'text-luna-aqua' : 'text-text-muted'}`}>
                          {d.day}
                       </span>
                       {d.currentMonth && dayTickets.length > 0 && (
                          <div className="mt-auto space-y-1 overflow-hidden">
                             <div className="px-2 py-0.5 bg-luna-aqua/10 border-l border-luna-aqua rounded text-[7px] font-black text-luna-aqua uppercase tracking-widest truncate">{dayTickets.length} Job{dayTickets.length > 1 ? 's' : ''}</div>
                             {hasUrgent && <div className="px-2 py-0.5 bg-red-500/10 border-l border-red-500 rounded text-[7px] font-black text-red-400 uppercase tracking-widest truncate">Alert</div>}
                          </div>
                       )}
                    </div>
                  );
              })}
           </div>
        </div>

        {/* Deployment List */}
        <div className="xl:col-span-4 space-y-12">
           <div className="luna-card">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <Activity size={16} className="text-luna-aqua" /> Deployment Queue
                <span className="ml-auto text-[10px] font-black text-luna-cyan">{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </h3>
              <div className="space-y-8">
                 <AnimatePresence mode="popLayout">
                   {ticketsForSelectedDate.length > 0 ? (
                     ticketsForSelectedDate.map((t, i) => (
                      <motion.div 
                        key={t.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => navigate(`/tickets/${t.id}`)}
                        className="flex gap-6 group cursor-pointer border-l border-luna-aqua/10 hover:border-luna-aqua pl-6 transition-all"
                      >
                         <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full luna-glow ${t.priority === 'CRITICAL' ? 'bg-red-500' : t.priority === 'HIGH' ? 'bg-orange-500' : 'bg-luna-aqua'}`}></div>
                            {i < ticketsForSelectedDate.length - 1 && <div className="w-px flex-1 bg-luna-aqua/10 my-2"></div>}
                         </div>
                         <div className="pb-6 group-hover:translate-x-2 transition-transform min-w-0 flex-1">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">
                              {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-base font-black text-white group-hover:text-luna-aqua transition-colors truncate tracking-tight">{t.title}</p>
                            <div className="flex items-center gap-2 mt-2 opacity-50">
                               <MapPin size={10} className="text-luna-aqua" />
                               <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate">{t.location}</span>
                            </div>
                            <div className="mt-3">
                               <span className={`luna-badge !px-3 !py-0.5 text-[8px] ${t.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20'}`}>
                                  {t.status.replace('_', ' ')}
                               </span>
                            </div>
                         </div>
                      </motion.div>
                     ))
                   ) : (
                     <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                        <Clock size={48} />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Deployments Scheduled</p>
                     </div>
                   )}
                 </AnimatePresence>
              </div>
           </div>

           <div className="luna-card !bg-gradient-to-br from-luna-navy to-luna-midnight border-luna-aqua/20 relative overflow-hidden group">
              <div className="relative z-10">
                 <h3 className="text-xs font-black text-luna-aqua uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                   <Navigation size={16} /> Sector Planning
                 </h3>
                 <p className="text-sm font-medium text-text-muted leading-relaxed mb-8">Optimize your maintenance route between campus sectors to maximize operational efficiency.</p>
                 <button className="w-full luna-button group-hover:luna-glow">Execute Route Analysis</button>
              </div>
              <div className="absolute -right-12 -bottom-12 text-luna-aqua/10 group-hover:text-luna-aqua/20 transition-colors">
                 <Navigation size={160} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
