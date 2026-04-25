import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, AlertTriangle, Clock, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAssignedTickets, getAllTickets } from '../services/api';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLiveAlerts = useCallback(async () => {
    try {
      let data = [];
      if (user?.role === 'ADMIN') {
        const res = await getAllTickets();
        data = res.data;
      } else {
        const res = await getAssignedTickets();
        data = res.data;
      }
      
      const ticketAlerts = data
        .filter(t => user?.role === 'ADMIN' ? (t.status === 'OPEN' && !t.assignedTechnicianId) : (t.status === 'OPEN' || t.status === 'IN_PROGRESS'))
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .map(t => {
          const isCritical = t.priority === 'URGENT' || t.priority === 'CRITICAL';
          return {
            id: t.id,
            type: 'TICKET_ASSIGNMENT',
            title: isCritical ? 'Critical Action Required' : 'New Task Assignment',
            message: user?.role === 'ADMIN' ? `${t.ticketCode || 'Task'}: "${t.title}" requires administrative review or assignment.` : `${t.ticketCode || 'Task'}: "${t.title}" has been assigned to you. Location: ${t.location || 'TBD'}.`,
            time: new Date(t.updatedAt || t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            icon: isCritical ? <Zap className="text-red-400 animate-pulse" /> : <AlertTriangle className="text-luna-aqua" />,
            priority: isCritical ? 'CRITICAL' : 'NORMAL'
          };
        });

      const alerts = [
        ...ticketAlerts,
        {
          id: 'sys-1',
          type: 'SYSTEM',
          title: 'Mainframe Synchronization Complete',
          message: 'All locations are now reporting healthy operational status.',
          time: 'System',
          icon: <CheckCircle2 className="text-emerald-400" />,
          priority: 'LOW'
        }
      ];

      setNotifications(alerts);
    } catch (error) {
      console.error('Failed to sync comm center');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLiveAlerts();
    const interval = setInterval(fetchLiveAlerts, 5000); 
    return () => clearInterval(interval);
  }, [fetchLiveAlerts]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-12">
      <div className="flex items-center justify-between border-b border-white/5 pb-10">
        <div>
           <div className="flex items-center gap-3 mb-3">
              <div className="px-3 py-1 rounded-full bg-luna-aqua/10 border border-luna-aqua/20 flex items-center gap-2">
                <Bell size={12} className="text-luna-aqua" />
                <span className="text-[10px] font-black text-luna-aqua uppercase tracking-[0.4em]">Operational Broadcasts</span>
              </div>
           </div>
           <h1 className="text-6xl font-black text-white tracking-tighter leading-none">Comm <span className="text-luna-aqua">Center</span></h1>
           <p className="text-text-muted font-medium mt-4 text-xl">Live intelligence feed and critical mission broadcasts.</p>
        </div>
        
        <div className="hidden lg:flex items-center gap-6 luna-glass px-8 py-4 rounded-[2rem]">
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Broadcast Signal</span>
              <span className="text-emerald-400 font-black text-lg">ENCRYPTED</span>
           </div>
           <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {notifications.map((note, i) => (
            <motion.div 
              key={note.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => {
                if (note.type === 'TICKET_ASSIGNMENT') {
                  navigate(`/tickets/${note.id}`);
                }
              }}
              className={`luna-card !p-8 border-l-4 flex gap-8 group hover:bg-luna-aqua/5 transition-all cursor-pointer ${
                note.priority === 'CRITICAL' ? 'border-l-red-500 bg-red-500/5' : 'border-l-luna-aqua'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110 ${
                note.priority === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20 shadow-lg shadow-red-500/10' : 'bg-luna-aqua/10 border-luna-aqua/20 shadow-lg shadow-luna-aqua/10'
              }`}>
                {note.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-xl font-black tracking-tight ${note.priority === 'CRITICAL' ? 'text-red-400' : 'text-white'}`}>
                    {note.title}
                  </h3>
                  <span className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                    <Clock size={12} /> {note.time}
                  </span>
                </div>
                <p className="text-text-muted font-medium leading-relaxed">{note.message}</p>
                
                <div className="mt-6 flex items-center gap-6">
                  <button className="text-[10px] font-black uppercase tracking-widest text-luna-aqua hover:underline">Acknowledge Broadcast</button>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <button className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors">Location Procedure Details</button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {notifications.length === 0 && !loading && (
          <div className="py-40 text-center opacity-20 flex flex-col items-center gap-6">
            <Info size={64} />
            <p className="text-xl font-black uppercase tracking-[0.3em]">Communication Frequency Silent</p>
          </div>
        )}
      </div>
    </div>
  );
}
