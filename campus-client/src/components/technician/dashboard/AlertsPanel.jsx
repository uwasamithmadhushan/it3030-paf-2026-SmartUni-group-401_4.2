import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, MapPin, Zap } from 'lucide-react';

const AlertsPanel = ({ tickets }) => {
  const urgentTickets = tickets.filter(t => t.priority === 'URGENT' && t.status !== 'RESOLVED');

  return (
    <div className="luna-card flex flex-col h-full overflow-hidden">
      <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3 text-red-400">
        <Zap size={16} className="animate-pulse" /> Urgent Operations
      </h3>

      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
        {urgentTickets.length > 0 ? urgentTickets.map((t, i) => (
          <motion.div 
            key={t.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[1.5rem] bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-sm font-black text-white group-hover:text-red-400 transition-colors leading-snug">{t.title}</h4>
              <div className="px-2 py-1 bg-red-500 text-white text-[8px] font-black rounded uppercase">Emergency</div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest text-text-muted">
              <span className="flex items-center gap-1.5"><Clock size={12} className="text-red-400" /> {new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              <span className="flex items-center gap-1.5"><MapPin size={12} className="text-red-400" /> {t.location || 'Global'}</span>
            </div>
          </motion.div>
        )) : (
          <div className="flex flex-col items-center justify-center h-full opacity-20 text-center">
            <AlertTriangle size={48} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">All Critical Locations Clear</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-white/5">
        <p className="text-[9px] font-black uppercase tracking-widest text-text-muted text-center italic">
          System integrity monitored via Global Proxy
        </p>
      </div>
    </div>
  );
};

export default React.memo(AlertsPanel);
