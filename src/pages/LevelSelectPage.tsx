import React from 'react';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { UserAccount, LevelId } from '../types';
import { LEVEL_DEFINITIONS } from '../data/curriculumData';
import { getLanguageById } from '../data/languages';
import { getLanguageProgress } from '../services/storage';

interface LevelSelectPageProps {
  currentUser: UserAccount;
  navigate: (route: string, extra?: any) => void;
}

export const LevelSelectPage: React.FC<LevelSelectPageProps> = ({ currentUser, navigate }) => {
  const currentLanguage = getLanguageById(currentUser.selectedLanguageId || 'spanish');
  const progress = getLanguageProgress(currentUser);

  // Check completions
  const completedKeys = Object.keys(progress.completedLectures).filter(
    (k) => progress.completedLectures[k].passed
  );
  const basicCount = completedKeys.filter((k) => k.startsWith('basic_')).length;
  const advancedCount = completedKeys.filter((k) => k.startsWith('advanced_')).length;
  const proCount = completedKeys.filter((k) => k.startsWith('pro_')).length;

  const isBasicComplete = basicCount >= 10;
  const isAdvancedUnlocked = isBasicComplete;
  const isAdvancedComplete = advancedCount >= 5;
  const isProUnlocked = isAdvancedComplete;
  const isProComplete = proCount >= 3;

  const levels: Array<{
    id: LevelId;
    info: typeof LEVEL_DEFINITIONS['basic'];
    icon: any;
    accentColor: string;
    borderGlow: string;
    completedCount: number;
    totalLectures: number;
    isUnlocked: boolean;
    isComplete: boolean;
    unlockRequirement?: string;
  }> = [
    {
      id: 'basic',
      info: LEVEL_DEFINITIONS['basic'],
      icon: BookOpen,
      accentColor: 'from-blue-600 to-indigo-600',
      borderGlow: 'hover:border-indigo-400 dark:hover:border-indigo-500 shadow-indigo-500/10',
      completedCount: basicCount,
      totalLectures: 10,
      isUnlocked: true,
      isComplete: isBasicComplete,
    },
    {
      id: 'advanced',
      info: LEVEL_DEFINITIONS['advanced'],
      icon: GraduationCap,
      accentColor: 'from-purple-600 to-pink-600',
      borderGlow: 'hover:border-purple-400 dark:hover:border-purple-500 shadow-purple-500/10',
      completedCount: advancedCount,
      totalLectures: 5,
      isUnlocked: isAdvancedUnlocked,
      isComplete: isAdvancedComplete,
      unlockRequirement: 'Complete all 10 Basic lectures to unlock',
    },
    {
      id: 'pro',
      info: LEVEL_DEFINITIONS['pro'],
      icon: Crown,
      accentColor: 'from-amber-500 to-emerald-600',
      borderGlow: 'hover:border-amber-400 dark:hover:border-amber-500 shadow-amber-500/10',
      completedCount: proCount,
      totalLectures: 3,
      isUnlocked: isProUnlocked,
      isComplete: isProComplete,
      unlockRequirement: 'Complete all 5 Advanced lectures to unlock',
    },
  ];

  const handleLevelClick = (levelId: LevelId, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    navigate('lectures', { level: levelId });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curriculum Mastery Tree</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Choose Your Proficiency Level
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Target Language:{' '}
          <span className="font-bold text-slate-900 dark:text-white">
            {currentLanguage.name} {currentLanguage.flag}
          </span>
          . Progress through Basic, unlock Advanced, and finish Pro for native mastery.
        </p>
      </div>

      {/* Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {levels.map((lvl) => {
          const Icon = lvl.icon;
          const percentage = Math.round((lvl.completedCount / lvl.totalLectures) * 100);

          return (
            <div
              key={lvl.id}
              onClick={() => handleLevelClick(lvl.id, lvl.isUnlocked)}
              className={`relative rounded-3xl p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between ${
                lvl.isUnlocked
                  ? `bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl ${lvl.borderGlow} hover:-translate-y-2 hover:rotate-[-0.5deg] cursor-pointer`
                  : 'bg-slate-100/60 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 opacity-75 cursor-not-allowed'
              }`}
            >
              {/* Top Level Badge & Lock Status */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${lvl.accentColor} text-white flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {lvl.isComplete ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : lvl.isUnlocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                      <Unlock className="w-3.5 h-3.5" />
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold">
                      <Lock className="w-3.5 h-3.5" />
                      Locked
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-black tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
                  {lvl.id} LEVEL
                </span>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {lvl.info.title.replace(' LEVEL', '')}
                </h2>

                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  {lvl.info.tagline}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {lvl.info.description}
                </p>

                {/* Progress bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">
                      Progress: {lvl.completedCount}/{lvl.totalLectures}
                    </span>
                    <span className="text-slate-700 dark:text-slate-200">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${lvl.accentColor} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Lectures outline highlights */}
                <div className="mt-5 space-y-1.5 border-t border-slate-200/60 dark:border-slate-800/60 pt-4">
                  {lvl.info.outlines.slice(0, 3).map((out) => (
                    <div
                      key={out.lectureNumber}
                      className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2 truncate"
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {out.lectureNumber}
                      </span>
                      <span className="truncate">{out.title}</span>
                    </div>
                  ))}
                  {lvl.info.outlines.length > 3 && (
                    <p className="text-[10px] italic text-slate-400 dark:text-slate-500 pt-1">
                      + {lvl.info.outlines.length - 3} more structured lectures...
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                {lvl.isUnlocked ? (
                  <button
                    type="button"
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r ${lvl.accentColor} hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-sm`}
                  >
                    <span>
                      {lvl.completedCount === 0
                        ? 'Start Level'
                        : lvl.isComplete
                        ? 'Review Lectures'
                        : 'Continue Level'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs text-center justify-center">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{lvl.unlockRequirement}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
