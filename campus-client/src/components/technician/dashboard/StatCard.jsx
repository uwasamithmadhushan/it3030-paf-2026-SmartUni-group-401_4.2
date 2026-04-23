import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, trend }) => {
  const colorMap = {
    aqua: 'from-luna-aqua/20 to-luna-cyan/5 border-luna-aqua/20 text-luna-aqua',
    critical: 'from-red-500/20 to-red-900/5 border-red-500/20 text-red-400',
    warning: 'from-amber-500/20 to-amber-900/5 border-amber-500/20 text-amber-400',
    info: 'from-blue-500/20 to-blue-900/5 border-blue-500/20 text-blue-400',
    success: 'from-emerald-500/20 to-emerald-900/5 border-emerald-500/20 text-emerald-400'
  };

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className={`luna-card !p-8 bg-gradient-to-br ${colorMap[color] || colorMap.info} relative overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        {React.cloneElement(icon, { size: 80 })}
      </div>
      
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:luna-glow transition-all">
            {icon}
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">{title}</p>
          <p className="text-5xl font-black tracking-tighter leading-none text-white">{value}</p>
        </div>
        
        {trend && (
          <div className="mt-8 flex items-center gap-2">
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg bg-white/5 border border-white/10 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">vs last cycle</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(StatCard);
