import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, onClear }) => {
  return (
    <div className="flex-1 min-w-[300px] group">
      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">
        Mission Search Engine
      </label>
      <div className="relative">
        <Search 
          className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors" 
          size={20} 
        />
        <input 
          type="text" 
          placeholder="Code, Title, Location, Category..." 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="luna-input !pl-16 !pr-14 !py-4"
        />
        {value && (
          <button 
            onClick={onClear}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
