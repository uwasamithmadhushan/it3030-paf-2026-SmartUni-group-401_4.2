import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, AlertTriangle, ShieldCheck, Clock, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAssignedTickets } from '../services/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLiveAlerts = useCallback(async () => {
    try {
      // For this demo, we derive notifications from recent tickets and system status
      const { data } = await getAssignedTickets();
      
      const alerts = [
        {
          id: 'sys-1',
          type: 'SYSTEM',
          title: 'Mainframe Synchronization Complete',
          message: 'All sectors are now reporting healthy operational status.',
          time: 'Just now',
          icon: <ShieldCheck className="text-emerald-400" />,
          priority: 'LOW'
        },
        ...data.filter(t => t.priority === 'URGENT').map(t => ({
          id: t.id,
          type: 'URGENT_TICKET',
          title: 'Immediate Action Required',
          message: `Critical Ticket: ${t.title} requires specialist intervention in ${t.location || 'Sector Alpha'}.`,
          time: 'Live',
          icon: <Zap className="text-luna-aqua animate-pulse" />,
          priority: 'CRITICAL'
        })).slice(0, 3)
      ];

      setNotifications(alerts);
    } catch (error) {
      console.error('Failed to sync comm center');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveAlerts();
    const interval = setInterval(fetchLiveAlerts, 15000); // High frequency polling for "real-time"
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
              className={`luna-card !p-8 border-l-4 flex gap-8 group hover:bg-luna-aqua/5 transition-all ${
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
                  <button className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors">Sector Protocol Details</button>
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
