import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface HomeProps {
  setMode: (mode: 'child' | 'parent') => void;
}

export const Home: React.FC<HomeProps> = ({ setMode }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-6 sm:py-10 text-center relative z-10">
      
      {/* Magical Hero Header Section */}
      <header className="mb-12 text-center select-none relative pt-6 px-4">
        {/* Soft glowing background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-32 bg-calm-blue/20 rounded-full filter blur-3xl pointer-events-none -z-10"></div>
        
        {/* Floating Twinkling Sparkles (SVGs) */}
        <div className="absolute -top-2 left-[15%] text-calm-blue/75 scandi-drift scandi-twinkle pointer-events-none">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M12 2l2.4 4.9L20 7.6l-4 3.9 1 5.5-5-2.9-5 2.9 1-5.5-4-3.9 5.6-.7L12 2z" />
          </svg>
        </div>
        <div className="absolute top-6 right-[15%] text-calm-cream/80 scandi-drift-reverse scandi-twinkle pointer-events-none">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
            <path d="M12 2l2.4 4.9L20 7.6l-4 3.9 1 5.5-5-2.9-5 2.9 1-5.5-4-3.9 5.6-.7L12 2z" />
          </svg>
        </div>
        <div className="absolute top-16 left-[22%] text-calm-lavender-dark/40 scandi-twinkle pointer-events-none hidden sm:block">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M12 2l2.4 4.9L20 7.6l-4 3.9 1 5.5-5-2.9-5 2.9 1-5.5-4-3.9 5.6-.7L12 2z" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight mb-4 select-none leading-tight">
          <span className="bg-gradient-to-r from-calm-blue-dark via-calm-lavender-dark to-calm-cream-dark bg-clip-text text-transparent">
            Welcome to Autism Companion AI
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto font-medium leading-relaxed">
          Let's explore everyday situations together using soft steps, friendly stories, and slow, predictable words.
        </p>
      </header>

      {/* Central Mascot Welcome Area */}
      <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] border-4 border-slate-100 p-6 sm:p-8 shadow-sm mb-12 flex flex-col md:flex-row items-center gap-6 text-left relative overflow-hidden bg-scandi-gradient border-b-8">
        {/* Lumi mascot frame */}
        <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full shrink-0 overflow-hidden bg-calm-gradient border-4 border-white shadow-md lumi-float select-none flex items-center justify-center">
          <img 
            src="/lumi_welcome.png" 
            alt="Lumi welcome" 
            className="w-full h-full object-cover scale-110"
          />
        </div>

        {/* Speech Bubble */}
        <div className="relative flex-1 bg-white border-2 border-calm-blue/50 p-5 rounded-3xl shadow-xs">
          {/* Arrow */}
          <div className="hidden md:block absolute left-0 top-1/2 -translate-x-[9px] -translate-y-2.5 w-4 h-4 bg-white border-l-2 border-b-2 border-calm-blue/50 rotate-45"></div>
          
          <h2 className="font-sans font-bold text-lg text-calm-blue-dark mb-1 flex items-center gap-1 select-none">
            <span>Hello friend! 🧸</span>
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            I am <strong className="font-bold text-calm-blue-dark">Lumi</strong>, your companion bear. I help explain everyday situations using calm, friendly, and simple words. Let's read stories and explore our feelings together!
          </p>
        </div>
      </div>

      {/* Role Selection Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Child Mode Card */}
        <div 
          onClick={() => setMode('child')}
          className="bg-white rounded-[2.2rem] border-4 border-calm-blue-light p-6 sm:p-8 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-calm-blue flex flex-col items-center group bg-calm-gradient border-b-8"
        >
          <span className="text-6xl mb-4 group-hover:scale-110 transition duration-300 select-none">☀️</span>
          <h2 className="text-2xl font-bold text-calm-blue-dark mb-2">
            I am a Child
          </h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed max-w-xs text-center">
            Tell Lumi how you feel today and read fun, page-by-page stories to learn about new situations.
          </p>
          <button className="w-full bg-calm-blue text-calm-blue-dark font-bold text-base sm:text-lg py-3.5 border-2 border-calm-blue-dark border-b-5 rounded-2xl shadow-xs hover:bg-white transition active:scale-95">
            Start Child Mode
          </button>
        </div>

        {/* Parent Mode Card */}
        <div 
          onClick={() => setMode('parent')}
          className="bg-white rounded-[2.2rem] border-4 border-calm-cream-light p-6 sm:p-8 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-calm-cream flex flex-col items-center group bg-peach-gradient border-b-8"
        >
          <span className="text-6xl mb-4 group-hover:scale-110 transition duration-300 select-none">🧸</span>
          <h2 className="text-2xl font-bold text-calm-cream-dark mb-2">
            I am a Parent
          </h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed max-w-xs text-center">
            Log templates, customize and generate social stories, and view your child's feeling history logs.
          </p>
          <button className="w-full bg-calm-cream text-calm-cream-dark font-bold text-base sm:text-lg py-3.5 border-2 border-calm-cream-dark border-b-5 rounded-2xl shadow-xs hover:bg-white transition active:scale-95">
            Start Parent Mode
          </button>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-100 flex items-start gap-4 max-w-2xl mx-auto text-left shadow-xs">
        <ShieldAlert className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-slate-700 text-sm mb-1">Supportive Educational Tool</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Autism Companion AI is designed strictly for educational and supportive purposes. It is not therapeutic or clinical intervention software, and is not intended to substitute professional healthcare or medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};
