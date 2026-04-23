import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import SortDropdown from './SortDropdown';
import FilterChips from './FilterChips';
import { Layers, Zap, RotateCcw, Activity } from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const CATEGORY_OPTIONS = ['ALL', 'ELECTRICAL', 'NETWORK', 'EQUIPMENT', 'FURNITURE', 'CLEANING', 'OTHER'];

const TechnicianFilters = ({ onFilterChange, resultsCount }) => {
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
  }, [filters]);

  const handleFilterUpdate = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      quickFilterId: null // Reset quick filter if manual filter is changed
    }));
  };

  const handleQuickFilter = (id, params) => {
    if (filters.quickFilterId === id) {
      handleReset();
    } else {
      setFilters(prev => ({
        ...prev,
        ...params,
        quickFilterId: id
      }));
    }
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
    <div className="space-y-8">
      <div className="luna-card !bg-luna-midnight/60 border-luna-aqua/5 !p-10">
        <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-end">
          {/* Search */}
          <SearchBar 
            value={filters.search} 
            onChange={(val) => handleFilterUpdate('search', val)}
            onClear={() => handleFilterUpdate('search', '')}
          />

          {/* Status */}
          <div className="w-full sm:w-56 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">Status Matrix</label>
            <div className="relative">
              <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
              <select 
                value={filters.status}
                onChange={(e) => handleFilterUpdate('status', e.target.value)}
                className="luna-input !pl-16 !py-4 appearance-none cursor-pointer"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt} value={opt} className="bg-luna-midnight">{opt === 'ALL' ? 'All Statuses' : opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div className="w-full sm:w-56 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">Criticality Level</label>
            <div className="relative">
              <Zap className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
              <select 
                value={filters.priority}
                onChange={(e) => handleFilterUpdate('priority', e.target.value)}
                className="luna-input !pl-16 !py-4 appearance-none cursor-pointer"
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt} value={opt} className="bg-luna-midnight">{opt === 'ALL' ? 'All Priorities' : opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="w-full sm:w-56 group">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">Operational Sector</label>
            <div className="relative">
              <Activity className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
              <select 
                value={filters.category}
                onChange={(e) => handleFilterUpdate('category', e.target.value)}
                className="luna-input !pl-16 !py-4 appearance-none cursor-pointer"
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt} value={opt} className="bg-luna-midnight">{opt === 'ALL' ? 'All Categories' : opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort */}
          <SortDropdown 
            value={filters.sort} 
            onChange={(val) => handleFilterUpdate('sort', val)} 
          />

          {/* Reset */}
          <button 
            onClick={handleReset}
            className="w-12 h-12 luna-glass rounded-2xl flex items-center justify-center text-text-muted hover:text-red-400 hover:border-red-500/20 transition-all shrink-0"
            title="Reset Filters"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Results Info & Active Filters */}
        <div className="mt-8 pt-8 border-t border-luna-aqua/5 flex flex-wrap items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="px-5 py-2 bg-luna-aqua/10 border border-luna-aqua/20 rounded-2xl">
                 <span className="text-[11px] font-black text-luna-aqua uppercase tracking-[0.2em]">{resultsCount} Results Synchronized</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                 {filters.status !== 'ALL' && <ActiveFilterBadge label={filters.status} onClear={() => handleFilterUpdate('status', 'ALL')} />}
                 {filters.priority !== 'ALL' && <ActiveFilterBadge label={filters.priority} onClear={() => handleFilterUpdate('priority', 'ALL')} />}
                 {filters.category !== 'ALL' && <ActiveFilterBadge label={filters.category} onClear={() => handleFilterUpdate('category', 'ALL')} />}
              </div>
           </div>
        </div>

        {/* Quick Filters */}
        <FilterChips 
          activeFilters={filters.quickFilterId} 
          onQuickFilter={handleQuickFilter} 
        />
      </div>
    </div>
  );
};

const ActiveFilterBadge = ({ label, onClear }) => (
  <div className="px-4 py-1.5 bg-luna-midnight border border-luna-aqua/10 rounded-xl flex items-center gap-3">
     <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{label}</span>
     <button onClick={onClear} className="text-text-muted hover:text-white transition-colors">
        <RotateCcw size={10} />
     </button>
  </div>
);

export default TechnicianFilters;
