import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck, User, MessageSquare, Wrench } from 'lucide-react';

const MissionTimeline = ({ tickets }) => {
  // Generate activities based on tickets - Memoized for stability
  const activities = React.useMemo(() => {
    return tickets.slice(0, 8).map((t, i) => ({
      id: `act-${i}-${t.id}`, // Better stable key
      type: i % 2 === 0 ? 'STATUS_UPDATE' : 'COMMENT',
      user: 'System Agent',
      ticket: t.ticketCode || `TCK-${t.id.substring(0, 4)}`,
      content: i % 2 === 0 ? `Transitioned to ${t.status}` : `Added field diagnostic note`,
      time: `${i * 14 + 5}m ago`,
      icon: i % 2 === 0 ? <ShieldCheck size={14} /> : <MessageSquare size={14} />
    }));
  }, [tickets]);

  return (
    <div className="luna-card flex flex-col h-full overflow-hidden">
      <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
        <Clock size={16} className="text-luna-aqua" /> Operational Timeline
      </h3>

      <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-4 relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-[1px] bg-white/5" />
        
        {activities.map((act, i) => (
          <motion.div 
            key={act.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative pl-12 group"
          >
            <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-luna-midnight border border-white/10 flex items-center justify-center z-10 group-hover:border-luna-aqua/40 transition-colors">
              <div className="text-luna-aqua opacity-60">{act.icon}</div>
            </div>
            
            <div className="flex justify-between items-start mb-1">
              <p className="text-[10px] font-black text-white uppercase tracking-wider">{act.ticket}</p>
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{act.time}</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed font-medium">
              <span className="text-luna-aqua/60 font-bold mr-2">@{act.user}</span>
              {act.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-white/5 text-center">
        <button className="text-[9px] font-black uppercase tracking-[0.3em] text-luna-aqua hover:underline">
          Access Global Audit Log
        </button>
      </div>
    </div>
  );
};

export default React.memo(MissionTimeline);
