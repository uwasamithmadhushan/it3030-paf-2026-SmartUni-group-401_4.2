import React from 'react';
import { motion } from 'framer-motion';

const FilterChips = ({ activeFilters, onQuickFilter }) => {
  const quickFilters = [
    { id: 'urgent', label: 'My Urgent Jobs', params: { priority: 'URGENT' } },
    { id: 'in_progress', label: 'In Progress', params: { status: 'IN_PROGRESS' } },
    { id: 'waiting', label: 'Waiting to Start', params: { status: 'OPEN' } },
    { id: 'resolved_today', label: 'Resolved Today', params: { status: 'RESOLVED' } }, // Note: Logic handled by backend filter or just status
    { id: 'due_today', label: 'Due Today', params: { sort: 'RECENTLY_UPDATED' } },
  ];

  return (
    <div className="flex flex-wrap gap-4 mt-8">
      {quickFilters.map((filter) => {
        const isActive = activeFilters === filter.id;
        return (
          <motion.button
            key={filter.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onQuickFilter(filter.id, filter.params)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
              isActive 
                ? 'bg-luna-aqua text-luna-midnight border-luna-aqua shadow-lg shadow-luna-aqua/20' 
                : 'bg-luna-midnight/40 text-text-muted border-luna-aqua/10 hover:border-luna-aqua/30'
            }`}
          >
            {filter.label}
          </motion.button>
        );
      })}
    </div>
  );
};

export default FilterChips;
