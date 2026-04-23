import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value: externalValue, onChange, onClear, compact = false }) => {
  const [internalValue, setInternalValue] = useState(externalValue);

  // Sync internal state with external prop (for Reset)
  useEffect(() => {
    setInternalValue(externalValue);
  }, [externalValue]);

  // Debounce the change event
  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== externalValue) {
        onChange(internalValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [internalValue, onChange, externalValue]);

  return (
    <div className={`flex-1 min-w-[200px] group ${compact ? '' : 'min-w-[300px]'}`}>
      {!compact && (
        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] block mb-4 group-focus-within:text-luna-aqua transition-colors">
          Mission Search Engine
        </label>
      )}
      <div className="relative">
        <Search 
          className={`absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-luna-aqua transition-colors ${compact ? 'left-4' : ''}`} 
          size={compact ? 16 : 20} 
        />
        <input 
          type="text" 
          placeholder="Code, Title, Location..." 
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          className={`luna-input group-focus-within:luna-glow transition-all ${compact ? '!pl-12 !py-2.5 !text-xs !rounded-xl' : '!pl-16 !pr-14 !py-4'}`}
        />
        {internalValue && (
          <button 
            onClick={() => {
              setInternalValue('');
              onClear();
            }}
            className={`absolute right-6 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors ${compact ? 'right-4' : ''}`}
          >
            <X size={compact ? 14 : 18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(SearchBar);
