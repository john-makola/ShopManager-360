
import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, THEMES } from '../contexts/ThemeContext';

export const ThemePicker: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors shadow-sm"
        title="Change Theme"
      >
        <Palette size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-slate-50 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800">Appearance</h3>
            <p className="text-xs text-slate-500">Choose your preferred theme.</p>
          </div>
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-2 grid gap-1">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => { setTheme(theme.id); setIsOpen(false); }}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors group ${currentTheme.id === theme.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-5 h-5 rounded-full border border-slate-200 shadow-sm" 
                    style={{ backgroundColor: `hsl(${theme.primaryHue}, ${theme.primarySat}, 50%)` }} 
                  />
                  <span className="font-medium">{theme.name}</span>
                </div>
                {currentTheme.id === theme.id && <Check size={16} className="text-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
