import React from 'react';
import { motion } from 'framer-motion';

const SummaryCards = ({ stats, type }) => {
  // Config based on tab type
  const config = type === 'jobs' ? [
    { title: "Assigned Today", value: stats?.assignedToday || 0, color: "aqua" },
    { title: "In Progress", value: stats?.inProgressTickets || 0, color: "cyan" },
    { title: "Urgent Delta", value: stats?.urgentTickets || 0, color: "critical" },
    { title: "Resolved Today", value: stats?.resolvedToday || 0, color: "success" }
  ] : [
    { title: "Unassigned", value: stats?.unassignedTickets || 0, color: "steel" },
    { title: "Open Incidents", value: stats?.openTickets || 0, color: "aqua" },
    { title: "High Priority", value: stats?.urgentTickets || 0, color: "critical" },
    { title: "Closed Today", value: stats?.resolvedToday || 0, color: "navy" }
  ];

  const colorMap = {
    navy: 'bg-luna-navy/20 text-luna-aqua border-luna-navy/20',
    steel: 'bg-luna-steel/20 text-luna-cyan border-luna-steel/20',
    cyan: 'bg-luna-cyan/10 text-luna-cyan border-luna-cyan/20',
    aqua: 'bg-luna-aqua/10 text-luna-aqua border-luna-aqua/20 luna-glow',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-lg shadow-red-500/10'
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {config.map((card, i) => (
        <motion.div 
          key={card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="luna-card !p-8 group flex flex-col justify-between min-h-[160px]"
        >
          <div>
             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-2">{card.title}</p>
             <p className="text-4xl font-black text-white tracking-tighter leading-none">{card.value}</p>
          </div>
          <div className={`h-1.5 w-full rounded-full mt-6 opacity-20 ${colorMap[card.color].split(' ')[0]}`} />
        </motion.div>
      ))}
    </div>
  );
};

export default React.memo(SummaryCards);
