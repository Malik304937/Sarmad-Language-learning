import React, { useState } from 'react';
import { Search, Sparkles, Check, ArrowRight } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { setSelectedLanguage } from '../services/storage';
import { UserAccount, Language } from '../types';

interface LanguageSelectPageProps {
  currentUser: UserAccount;
  onLanguageChosen: (updatedUser: UserAccount) => void;
  isChangingLanguage?: boolean;
}

export const LanguageSelectPage: React.FC<LanguageSelectPageProps> = ({
  currentUser,
  onLanguageChosen,
  isChangingLanguage = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLangId, setSelectedLangId] = useState<string>(
    currentUser.selectedLanguageId || 'spanish'
  );

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const q = searchQuery.toLowerCase();
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.greeting.toLowerCase().includes(q)
    );
  });

  const handleConfirm = () => {
    const updated = setSelectedLanguage(currentUser, selectedLangId);
    onLanguageChosen(updated);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1: Choose Your Destination</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {isChangingLanguage ? 'Switch Target Language' : 'Which language do you want to master?'}
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Select from 15 global languages. Your progress, lecture syllabus, and test scores are tracked separately for each language!
        </p>

        {/* Search Bar */}
        <div className="mt-6 relative max-w-md mx-auto">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search language or native script (e.g. Español, 中文, اردو)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Grid of Languages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredLanguages.map((lang: Language) => {
          const isSelected = selectedLangId === lang.id;
          const userLangProgress = currentUser.languageProgress[lang.id];
          const passedCount = userLangProgress
            ? Object.values(userLangProgress.completedLectures).filter((item) => item.passed).length
            : 0;

          return (
            <div
              key={lang.id}
              onClick={() => setSelectedLangId(lang.id)}
              className={`group relative rounded-2xl p-4 sm:p-5 text-left cursor-pointer transition-all duration-300 backdrop-blur-md ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-500/15 to-purple-500/20 dark:from-indigo-600/30 dark:to-purple-900/30 border-2 border-indigo-500 dark:border-indigo-400 shadow-xl shadow-indigo-500/15 scale-[1.02]'
                  : 'bg-white/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-1 hover:shadow-lg'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div className="text-4xl mb-3 transform transition-transform group-hover:scale-110">
                {lang.flag}
              </div>

              <h2 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {lang.name}
              </h2>

              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {lang.nativeName}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[11px]">
                <span className="italic text-indigo-600 dark:text-indigo-400 font-medium">
                  "{lang.greeting}"
                </span>
                {passedCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {passedCount}/18 done
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredLanguages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            No languages matched "{searchQuery}". Try searching for another language!
          </p>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="mt-10 sm:mt-12 text-center">
        <button
          onClick={handleConfirm}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-base"
        >
          <span>Continue with Selected Language</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
