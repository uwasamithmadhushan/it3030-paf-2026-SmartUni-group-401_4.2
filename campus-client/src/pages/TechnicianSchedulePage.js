import React from 'react';

const TechnicianSchedulePage = () => {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shift Schedule & Planner</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Plan your daily visits and track appointments</p>
        </div>
        <div className="flex gap-2">
           <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Today</button>
           <button className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Month View</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Side (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Maintenance Calendar</h3>
              <div className="flex items-center gap-4">
                 <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                 </button>
                 <span className="text-sm font-black text-slate-700 uppercase tracking-widest">April 2026</span>
                 <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
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
              {[...Array(35)].map((_, i) => {
                 const dayNum = i - 2;
                 const isToday = dayNum === 19;
                 const hasTask = [19, 21, 24].includes(dayNum);
                 return (
                    <div key={i} className={`bg-white h-32 p-3 border-slate-50 transition-colors hover:bg-slate-50 cursor-pointer ${dayNum < 1 || dayNum > 30 ? 'opacity-20' : ''}`}>
                       <span className={`text-xs font-black ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-lg' : 'text-slate-600'}`}>
                          {dayNum > 0 && dayNum <= 30 ? dayNum : ''}
                       </span>
                       {dayNum > 0 && dayNum <= 30 && hasTask && (
                          <div className="mt-2 space-y-1">
                             <div className="px-2 py-0.5 bg-indigo-50 border-l-2 border-indigo-500 rounded text-[9px] font-bold text-indigo-700 truncate">AC Maintenance</div>
                             {dayNum === 19 && <div className="px-2 py-0.5 bg-rose-50 border-l-2 border-rose-500 rounded text-[9px] font-bold text-rose-700 truncate">Urgent Leak</div>}
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
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Tasks For Today</h3>
              <div className="space-y-6">
                 {[
                    { time: '09:00 AM', task: 'Projector Service', loc: 'Room 402', priority: 'MEDIUM' },
                    { time: '11:30 AM', task: 'Network Troubleshooting', loc: 'Server Room', priority: 'HIGH' },
                    { time: '02:00 PM', task: 'Power Outage Check', loc: 'Hostel B', priority: 'CRITICAL' },
                    { time: '04:30 PM', task: 'Site Inspection', loc: 'Canteen', priority: 'LOW' }
                 ].map((t, i) => (
                    <div key={i} className="flex gap-4 group cursor-pointer">
                       <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full border-2 border-white ring-2 ${i === 0 ? 'bg-emerald-500 ring-emerald-50' : i === 1 ? 'bg-indigo-600 ring-indigo-50' : 'bg-slate-200 ring-slate-50'}`}></div>
                          {i < 3 && <div className="w-0.5 flex-1 bg-slate-100 my-1"></div>}
                       </div>
                       <div className="pb-4 group-hover:translate-x-1 transition-transform">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.time}</p>
                          <p className="text-sm font-black text-slate-800">{t.task}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">📍 {t.loc}</p>
                       </div>
                    </div>
                 ))}
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
