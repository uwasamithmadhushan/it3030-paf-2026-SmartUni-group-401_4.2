import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Clock, ShieldCheck } from 'lucide-react';

const ProductivityWidget = ({ stats }) => {
  const items = [
    { label: "Completed Week", value: stats?.resolvedThisWeek || 0, icon: <ShieldCheck size={20} />, color: "text-emerald-400" },
    { label: "Pending Jobs", value: stats?.openTickets || 0, icon: <Clock size={20} />, color: "text-luna-cyan" },
    { label: "SLA Success", value: "98.4%", icon: <Target size={20} />, color: "text-luna-aqua" },
    { label: "Fastest Sync", value: "14m", icon: <Zap size={20} />, color: "text-amber-400" },
  ];

  return (
    <div className="luna-card flex flex-col md:flex-row items-center justify-around gap-12 !p-12">
      {items.map((item, i) => (
        <div key={item.label} className="flex flex-col items-center text-center group">
          <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${item.color} mb-6 group-hover:luna-glow transition-all duration-500`}>
            {item.icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-2">{item.label}</p>
            <p className="text-4xl font-black text-white tracking-tighter leading-none">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(ProductivityWidget);
