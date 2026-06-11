import React from 'react';
import { Home } from 'lucide-react';

interface NavbarProps {
  currentMode: 'home' | 'child' | 'parent';
  setMode: (mode: 'home' | 'child' | 'parent') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentMode, setMode }) => {
  return (
    <nav className="bg-white border-b-4 border-slate-100/80 py-3.5 px-6 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Icon & Name */}
        <div 
          className="flex items-center gap-3 cursor-pointer transition hover:opacity-90 active:scale-98 select-none"
          onClick={() => setMode('home')}
        >
          <div className="w-11 h-11 rounded-full overflow-hidden bg-calm-cream border-2 border-calm-cream/50 flex items-center justify-center shadow-xs">
            <img 
              src="/lumi_welcome.png" 
              alt="Lumi mascot" 
              className="w-full h-full object-cover scale-110" 
            />
          </div>
          <span className="font-sans font-bold text-lg text-calm-blue-dark tracking-tight">
            Autism Companion AI
          </span>
        </div>

        {/* Mode Toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMode('home')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-bold transition select-none ${
              currentMode === 'home'
                ? 'bg-slate-100 text-slate-700'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>
          
          <button
            onClick={() => setMode('child')}
            className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition shadow-xs border-2 select-none border-b-4 active:scale-95 ${
              currentMode === 'child'
                ? 'bg-calm-blue border-calm-blue-dark text-calm-blue-dark'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            ☀️ Child Mode
          </button>
          
          <button
            onClick={() => setMode('parent')}
            className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition shadow-xs border-2 select-none border-b-4 active:scale-95 ${
              currentMode === 'parent'
                ? 'bg-calm-cream border-calm-cream-dark text-calm-cream-dark'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            🧸 Parent Mode
          </button>
        </div>
      </div>
    </nav>
  );
};
