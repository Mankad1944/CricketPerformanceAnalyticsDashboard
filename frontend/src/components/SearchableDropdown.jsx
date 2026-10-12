import React, { useState, useRef, useEffect } from 'react';

const SearchableDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Initialize search term if value exists
  useEffect(() => {
    if (value) {
      setSearchTerm(value);
    } else {
      setSearchTerm('');
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset search term to current selected value on blur if they typed something but didn't select
        if (value) setSearchTerm(value);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filteredOptions = options.filter(option =>
    (option.full_name || option.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-[250px]" ref={dropdownRef}>
      <input
        type="text"
        className="w-full bg-[#0b1120] border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500 transition-colors cursor-text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onClick={() => setIsOpen(true)}
      />
      
      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-[#0b1120] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden flex flex-col">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className="px-4 py-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                onClick={() => {
                  onChange(option.name);
                  setSearchTerm(option.name);
                  setIsOpen(false);
                }}
              >
                {option.full_name || option.name} <span className="text-[10px] text-slate-500">({option.current_team || 'N/A'})</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-xs font-bold text-slate-500 italic text-center">
              No players found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
