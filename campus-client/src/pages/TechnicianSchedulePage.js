import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllTickets } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const TechnicianSchedulePage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await getAllTickets();
      const myTickets = data.filter(t => t.assignedTechnicianId === user?.id);
      setTickets(myTickets);
    } catch (error) {
      console.error('Failed to load schedule data');
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
    // Previous month padding
    const prevMonthDays = daysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      grid.push({ day: prevMonthDays - i, currentMonth: false });
    }
    // Current month
    for (let i = 1; i <= days; i++) {
      grid.push({ day: i, currentMonth: true });
    }
    // Next month padding
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      grid.push({ day: i, currentMonth: false });
    }
    return grid;
  }, [currentDate]);

  const ticketsForSelectedDate = useMemo(() => {
    return tickets.filter(t => {
      const ticketDate = new Date(t.createdAt);
      return ticketDate.getDate() === selectedDate.getDate() &&
             ticketDate.getMonth() === selectedDate.getMonth() &&
             ticketDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [tickets, selectedDate]);

  if (loading && tickets.length === 0) return <LoadingSpinner fullScreen message="Syncing Schedule..." />;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Shift Schedule & Planner</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Plan your daily visits and track appointments</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}
             className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
           >
             Today
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Side (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black tracking-tight">Maintenance Calendar</h3>
              <div className="flex items-center gap-4">
                 <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                 </button>
                 <span className="text-sm font-black text-slate-700 uppercase tracking-widest min-w-[140px] text-center">{monthYearLabel}</span>
                 <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-2xl overflow-hidden border border-slate-100">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                 <div key={day} className="bg-slate-50 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
                      className={`bg-white h-24 sm:h-32 p-3 border-slate-50 transition-all cursor-pointer hover:bg-indigo-50/30 ${!d.currentMonth ? 'opacity-20 pointer-events-none' : ''} ${isSelected ? 'ring-2 ring-inset ring-indigo-600 bg-indigo-50/20' : ''}`}
                    >
                       <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : isSelected ? 'text-indigo-600' : 'text-slate-600'}`}>
                          {d.day}
                       </span>
                       {d.currentMonth && dayTickets.length > 0 && (
                          <div className="mt-2 space-y-1 overflow-hidden">
                             <div className="px-2 py-0.5 bg-indigo-100 border-l-2 border-indigo-500 rounded text-[9px] font-bold text-indigo-700 truncate">{dayTickets.length} Task{dayTickets.length > 1 ? 's' : ''}</div>
                             {hasUrgent && <div className="px-2 py-0.5 bg-rose-100 border-l-2 border-rose-500 rounded text-[9px] font-bold text-rose-700 truncate">Urgent</div>}
                          </div>
                       )}
                    </div>
                  );
              })}
           </div>
        </div>

        {/* Task List (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
                Tasks for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h3>
              <div className="space-y-6">
                 {ticketsForSelectedDate.length > 0 ? (
                   ticketsForSelectedDate.map((t, i) => (
                    <div key={t.id} className="flex gap-4 group cursor-pointer border-l-2 border-transparent hover:border-indigo-600 pl-2 transition-all">
                       <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full border-2 border-white ring-2 ${t.priority === 'CRITICAL' ? 'bg-rose-500 ring-rose-50' : t.priority === 'HIGH' ? 'bg-amber-500 ring-amber-50' : 'bg-emerald-500 ring-emerald-50'}`}></div>
                          {i < ticketsForSelectedDate.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-1"></div>}
                       </div>
                       <div className="pb-4 group-hover:translate-x-1 transition-transform min-w-0 flex-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-sm font-black text-slate-800 truncate">{t.title}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider truncate">📍 {t.location}</p>
                          <div className="mt-1">
                             <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                {t.status}
                             </span>
                          </div>
                       </div>
                    </div>
                   ))
                 ) : (
                   <div className="text-center py-10">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                         <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <p className="text-xs font-bold text-slate-400">No tasks scheduled for this day.</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden">
              <div className="relative z-10">
                 <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-4">Location Planning</h3>
                 <p className="text-sm font-bold opacity-80 leading-relaxed mb-6">Optimize your route between buildings to save maintenance time.</p>
                 <button className="w-full py-3 bg-white text-indigo-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-colors shadow-lg">Start Route</button>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                 <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianSchedulePage;
