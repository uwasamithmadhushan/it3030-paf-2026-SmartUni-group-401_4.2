import React from 'react';
import { ListFilter } from 'lucide-react';

const SortDropdown = ({ value, onChange }) => {
  return (
    <div className="w-full sm:w-64 group">
      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">
        Temporal Sort
      </label>
      <div className="relative">
        <ListFilter 
          className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" 
          size={20} 
        />
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="luna-input !pl-16 !py-4 appearance-none cursor-pointer"
        >
          <option value="NEWEST" className="bg-luna-midnight">Newest First</option>
          <option value="OLDEST" className="bg-luna-midnight">Oldest First</option>
          <option value="PRIORITY_HIGH_TO_LOW" className="bg-luna-midnight">Priority: High to Low</option>
          <option value="RECENTLY_UPDATED" className="bg-luna-midnight">Recently Updated</option>
        </select>
      </div>
    </div>
  );
};

export default SortDropdown;
