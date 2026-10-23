import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 border-t border-slate-200/60 dark:border-slate-800/60 py-6 text-center backdrop-blur-xl bg-white/70 dark:bg-slate-900/75 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-2">
        {/* Main Credits Box */}
        <div className="inline-flex flex-col items-center px-6 py-2.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 shadow-2xs">
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">
            Idea: <span className="text-indigo-600 dark:text-indigo-400">Sarmad Hussain</span>
          </p>
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-wide mt-0.5">
            Created by <span className="text-purple-600 dark:text-purple-400">Shahmeer</span>
          </p>
        </div>

        {/* Brand tagline */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Sarmad Language Learning • Interactive AI-Powered Polyglot Mastery
        </p>
      </div>
    </footer>
  );
};
