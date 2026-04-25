import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import { Layers, Zap, RotateCcw, Activity, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_OPTIONS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const CATEGORY_OPTIONS = ['ALL', 'ELECTRICAL', 'NETWORK', 'EQUIPMENT', 'FURNITURE', 'CLEANING', 'OTHER'];

const TechnicianFilters = ({ onFilterChange, resultsCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('technician_filters');
    return saved ? JSON.parse(saved) : {
      search: '',
      status: 'ALL',
      priority: 'ALL',
      category: 'ALL',
      sort: 'NEWEST',
      quickFilterId: null
    };
  });

  useEffect(() => {
    localStorage.setItem('technician_filters', JSON.stringify(filters));
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterUpdate = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      quickFilterId: null 
    }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      status: 'ALL',
      priority: 'ALL',
      category: 'ALL',
      sort: 'NEWEST',
      quickFilterId: null
    });
  };

  return (
    <div className="luna-card !p-0 overflow-hidden border-luna-aqua/10">
      {/* Compact Main Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-luna-midnight/40">
        <div className="flex-1 w-full md:w-auto">
          <SearchBar 
            value={filters.search} 
            onChange={(val) => handleFilterUpdate('search', val)}
            onClear={() => handleFilterUpdate('search', '')}
            compact
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto custom-scrollbar no-scrollbar py-1">
          <CompactSelect 
            icon={<Layers size={14} />} 
            label="Status" 
            value={filters.status} 
            options={STATUS_OPTIONS}
            onChange={(val) => handleFilterUpdate('status', val)}
          />
          <CompactSelect 
            icon={<Zap size={14} />} 
            label="Priority" 
            value={filters.priority} 
            options={PRIORITY_OPTIONS}
            onChange={(val) => handleFilterUpdate('priority', val)}
          />
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest ${isExpanded ? 'bg-luna-aqua text-luna-midnight border-luna-aqua' : 'bg-white/5 border-white/10 text-text-muted hover:text-white'}`}
          >
            <Filter size={14} /> More {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <div className="h-10 w-[1px] bg-white/5 mx-2 shrink-0" />
          
          <div className="px-4 py-2 bg-luna-aqua/5 border border-luna-aqua/10 rounded-xl shrink-0">
             <span className="text-[9px] font-black text-luna-aqua uppercase tracking-[0.2em]">{resultsCount} Hits</span>
          </div>

          <button 
            onClick={handleReset}
            className="w-10 h-10 luna-glass rounded-xl flex items-center justify-center text-text-muted hover:text-red-400 transition-all shrink-0"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Expanded Logic */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-luna-midnight/20"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] block mb-3">Operational Sector</label>
                <div className="relative">
                  <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={16} />
                  <select 
                    value={filters.category}
                    onChange={(e) => handleFilterUpdate('category', e.target.value)}
                    className="luna-input !pl-12 !py-2.5 !text-xs appearance-none cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt} value={opt} className="bg-luna-midnight">{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filter Badges could go here too */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CompactSelect = ({ icon, label, value, options, onChange }) => (
  <div className="relative group shrink-0">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors pointer-events-none">
      {icon}
    </div>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-white appearance-none cursor-pointer hover:border-luna-aqua/30 focus:outline-none focus:ring-1 focus:ring-luna-aqua/30 transition-all"
    >
      <option value="" disabled className="bg-luna-midnight">{label}</option>
      {options.map(opt => (
        <option key={opt} value={opt} className="bg-luna-midnight">{opt === 'ALL' ? `All ${label}s` : opt}</option>
      ))}
    </select>
    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
  </div>
);

export default React.memo(TechnicianFilters);
