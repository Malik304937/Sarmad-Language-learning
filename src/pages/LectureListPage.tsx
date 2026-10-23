import React from 'react';
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { UserAccount, LevelId } from '../types';
import { LEVEL_DEFINITIONS } from '../data/curriculumData';
import { getLanguageById } from '../data/languages';
import { getLanguageProgress } from '../services/storage';

interface LectureListPageProps {
  currentUser: UserAccount;
  level: LevelId;
  navigate: (route: string, extra?: any) => void;
}

export const LectureListPage: React.FC<LectureListPageProps> = ({
  currentUser,
  level,
  navigate,
}) => {
  const currentLanguage = getLanguageById(currentUser.selectedLanguageId || 'spanish');
  const levelInfo = LEVEL_DEFINITIONS[level];
  const progress = getLanguageProgress(currentUser);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('levels')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Levels</span>
        </button>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
          {currentLanguage.flag} {currentLanguage.name} • {levelInfo.title}
        </span>
      </div>

      {/* Hero Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {levelInfo.title} Syllabus
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {levelInfo.description}
        </p>
      </div>

      {/* Lectures List */}
      <div className="space-y-3.5">
        {levelInfo.outlines.map((outline, index) => {
          const lectureKey = `${level}_${outline.lectureNumber}`;
          const completion = progress.completedLectures[lectureKey];
          const isCompleted = completion?.passed || false;

          // A lecture is unlocked if it's #1, or if previous lecture is completed
          let isUnlocked = false;
          if (index === 0) {
            isUnlocked = true;
          } else {
            const prevKey = `${level}_${levelInfo.outlines[index - 1].lectureNumber}`;
            isUnlocked = progress.completedLectures[prevKey]?.passed || false;
          }

          return (
            <div
              key={outline.lectureNumber}
              onClick={() => {
                if (isUnlocked) {
                  navigate('lecture-detail', {
                    level,
                    lectureNumber: outline.lectureNumber,
                  });
                }
              }}
              className={`rounded-2xl p-4 sm:p-5 backdrop-blur-md transition-all duration-200 border flex items-center justify-between gap-4 ${
                isUnlocked
                  ? 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer group'
                  : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                {/* Number Circle or Checkmark */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                      : isUnlocked
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 group-hover:scale-105'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isUnlocked ? (
                    outline.lectureNumber
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Lesson {outline.lectureNumber}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Score: {completion.bestScore}/{completion.totalQuestions || 8} (
                        {Math.round((completion.bestScore / (completion.totalQuestions || 8)) * 100)}%)
                      </span>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {outline.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {outline.description}
                  </p>
                </div>
              </div>

              {/* Action Button or Lock Indicator */}
              <div className="shrink-0 flex items-center gap-2">
                {isUnlocked ? (
                  <button
                    type="button"
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="hidden sm:inline">
                      {isCompleted ? 'Review' : 'Start'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs font-medium text-slate-400 hidden sm:inline">
                    Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
