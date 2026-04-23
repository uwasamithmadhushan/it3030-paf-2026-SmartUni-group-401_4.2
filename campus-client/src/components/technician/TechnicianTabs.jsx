import React from 'react';
import { motion } from 'framer-motion';

const TechnicianTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'jobs', label: 'My Jobs', icon: '💼' },
    { id: 'queue', label: 'Incident Queue', icon: '🚨' }
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-luna-midnight/60 border border-luna-aqua/10 rounded-2xl w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-3 ${
            activeTab === tab.id ? 'text-white' : 'text-text-muted hover:text-white/60'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-luna-steel/40 border border-luna-aqua/20 rounded-xl"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-3">
            <span>{tab.icon}</span>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default React.memo(TechnicianTabs);
