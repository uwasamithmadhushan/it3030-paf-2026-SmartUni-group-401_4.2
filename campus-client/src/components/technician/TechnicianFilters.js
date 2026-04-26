import { useEffect, useState } from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';

const DEFAULT_FILTERS = {
  search: '',
  status: 'ALL',
  priority: 'ALL',
};

function buildParams(filters) {
  const params = {};

  if (filters.search.trim()) {
    params.search = filters.search.trim();
  }

  if (filters.status !== 'ALL') {
    params.status = filters.status;
  }

  if (filters.priority !== 'ALL') {
    params.priority = filters.priority;
  }

  return Object.keys(params).length > 0 ? params : null;
}

export default function TechnicianFilters({ onFilterChange, resultsCount = 0 }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    onFilterChange(buildParams(filters));
  }, [filters, onFilterChange]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="luna-card !bg-luna-midnight/40 border-luna-aqua/5 !p-8">
      <div className="flex flex-col xl:flex-row gap-6 xl:items-end">
        <div className="flex-1 min-w-[280px] group">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">
            Assignment Scan
          </label>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search title, location, or code..."
              className="luna-input !pl-16 !py-4"
            />
          </div>
        </div>

        <div className="w-full xl:w-64 group">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">
            Status
          </label>
          <div className="relative">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="luna-input !pl-16 !py-4 appearance-none cursor-pointer"
            >
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <div className="w-full xl:w-64 group">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">
            Priority
          </label>
          <div className="relative">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" size={20} />
            <select
              name="priority"
              value={filters.priority}
              onChange={handleChange}
              className="luna-input !pl-16 !py-4 appearance-none cursor-pointer"
            >
              <option value="ALL">All priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 xl:pb-0.5">
          <button
            type="button"
            onClick={handleReset}
            className="w-14 h-14 luna-glass rounded-2xl flex items-center justify-center text-luna-aqua hover:luna-glow transition-all"
            aria-label="Reset filters"
          >
            <RotateCcw size={18} />
          </button>
          <div className="px-6 py-4 bg-luna-aqua/5 border border-luna-aqua/10 rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-luna-aqua animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
              {resultsCount} Results
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}