import { useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { Home } from './pages/Home';
import { ChildMode } from './pages/ChildMode';
import { ParentMode } from './pages/ParentMode';
import { Heart } from 'lucide-react';
import type { Story } from './types';

function App() {
  const [mode, setMode] = useState<'home' | 'child' | 'parent'>('home');
  const [selectedStoryForReading, setSelectedStoryForReading] = useState<Story | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-calm-blue-light/50 font-sans selection:bg-calm-blue selection:text-calm-blue-dark relative overflow-hidden">
      {/* Subtle Background Scandinavian Vector Shapes */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        {/* Top Left Drifting Cloud */}
        <div className="absolute top-16 left-[5%] opacity-40 filter blur-[1px] scandi-drift">
          <svg viewBox="0 0 120 80" className="w-32 h-20 fill-white">
            <path d="M20 50 C20 40, 30 35, 40 35 C45 20, 70 20, 75 30 C85 25, 100 30, 100 45 C110 45, 115 55, 105 60 C100 65, 20 65, 20 50 Z" />
          </svg>
        </div>

        {/* Top Right Sleeping Star */}
        <div className="absolute top-28 right-[12%] text-calm-cream/45 scandi-drift-reverse scandi-twinkle">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </div>

        {/* Mid Left Stylized Cloud */}
        <div className="absolute top-1/2 left-[3%] opacity-30 filter blur-[0.5px] scandi-drift">
          <svg viewBox="0 0 100 60" className="w-24 h-16 fill-[#FAF6F0]">
            <path d="M15 40 C15 32, 23 28, 30 28 C34 16, 54 16, 58 24 C66 20, 78 24, 78 36 C86 36, 90 44, 82 48 C78 52, 15 52, 15 40 Z" />
          </svg>
        </div>

        {/* Mid Right Sleeping Moon */}
        <div className="absolute top-1/3 right-[5%] text-calm-cream/35 scandi-drift scandi-spin-slow">
          <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current">
            <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.7 3.3-8.6 7.7-9.7.6-.1 1.1.4 1 1-.8 3.5.3 7.3 3.1 9.9 2.7 2.6 6.5 3.3 9.9 2.3.6-.2 1.1.4.9 1-1.3 4.3-5.2 7.5-9.6 7.5z" />
          </svg>
        </div>

        {/* Bottom Left Soft Rounded Shape */}
        <div className="absolute bottom-40 left-[8%] w-24 h-14 bg-calm-green/20 rounded-full opacity-40 filter blur-xs scandi-drift-reverse"></div>

        {/* Bottom Right Drifting Cloud */}
        <div className="absolute bottom-24 right-[10%] opacity-45 filter blur-[0.8px] scandi-drift-reverse">
          <svg viewBox="0 0 120 80" className="w-40 h-24 fill-white">
            <path d="M20 50 C20 40, 30 35, 40 35 C45 20, 70 20, 75 30 C85 25, 100 30, 100 45 C110 45, 115 55, 105 60 C100 65, 20 65, 20 50 Z" />
          </svg>
        </div>

        {/* Bottom Center Tiny Twinkling Sparkle */}
        <div className="absolute bottom-48 left-[35%] text-calm-cream/40 scandi-twinkle">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>


      {/* Navigation Bar */}
      <Navbar currentMode={mode} setMode={setMode} />

      {/* Main Page Content */}
      <main className="flex-grow pb-12">
        {mode === 'home' && <Home setMode={setMode} />}
        {mode === 'child' && (
          <ChildMode 
            initialStory={selectedStoryForReading} 
            onCloseStory={selectedStoryForReading ? () => {
              setSelectedStoryForReading(null);
              setMode('parent');
            } : undefined}
          />
        )}
        {mode === 'parent' && (
          <ParentMode 
            onReadStory={(story) => {
              setSelectedStoryForReading(story);
              setMode('child');
            }}
          />
        )}
      </main>

      {/* Soothing Footer with Medical/Therapeutic Disclaimer */}
      <footer className="bg-white border-t border-calm-blue-light/60 py-6 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-calm-blue fill-current" />
            <span>Autism Companion AI &copy; 2026. Made with care.</span>
          </div>
          <div className="max-w-md text-left sm:text-right text-[10px] leading-normal">
            Advisory: This app is a supportive educational tool, not clinical medical software. Consult professional advice for therapy choices.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
