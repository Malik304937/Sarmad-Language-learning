import React from 'react';
import {
  Sparkles,
  Flame,
  BookOpen,
  Award,
  ArrowRight,
  Languages,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { UserAccount, LevelId } from '../types';
import { getLanguageById } from '../data/languages';
import { getLanguageProgress } from '../services/storage';
import { LEVEL_DEFINITIONS } from '../data/curriculumData';
import { TypingText } from '../components/TypingText';

interface DashboardPageProps {
  currentUser: UserAccount;
  navigate: (route: string, extra?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser, navigate }) => {
  const currentLanguage = getLanguageById(currentUser.selectedLanguageId || 'spanish');
  const progress = getLanguageProgress(currentUser);

  // Count completions
  const completedKeys = Object.keys(progress.completedLectures).filter(
    (k) => progress.completedLectures[k].passed
  );
  const basicDone = completedKeys.filter((k) => k.startsWith('basic_')).length;
  const advancedDone = completedKeys.filter((k) => k.startsWith('advanced_')).length;
  const proDone = completedKeys.filter((k) => k.startsWith('pro_')).length;
  const totalCompleted = basicDone + advancedDone + proDone;
  const totalPercentage = Math.round((totalCompleted / 18) * 100);

  // Determine next lecture to continue
  let continueLevel: LevelId = 'basic';
  let continueLectureNumber = 1;

  if (basicDone < 10) {
    continueLevel = 'basic';
    continueLectureNumber = basicDone + 1;
  } else if (advancedDone < 5) {
    continueLevel = 'advanced';
    continueLectureNumber = advancedDone + 1;
  } else if (proDone < 3) {
    continueLevel = 'pro';
    continueLectureNumber = proDone + 1;
  } else {
    // All done!
    continueLevel = 'basic';
    continueLectureNumber = 1;
  }

  const continueLevelInfo = LEVEL_DEFINITIONS[continueLevel];
  const continueOutline =
    continueLevelInfo.outlines.find((o) => o.lectureNumber === continueLectureNumber) ||
    continueLevelInfo.outlines[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Welcome Hero Banner with Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 backdrop-blur-xl bg-gradient-to-r from-indigo-900/80 via-purple-900/70 to-slate-900/80 border border-white/20 text-white shadow-2xl shadow-indigo-950/30">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold mb-4">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{currentUser.streak?.currentStreak || 1}-Day Streak! Keep the momentum going!</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            <TypingText text={`Welcome to Sarmad Language Learning, ${currentUser.username}!`} speed={35} />
          </h1>

          <p className="mt-3 text-indigo-100 text-sm sm:text-base leading-relaxed">
            You are learning{' '}
            <span className="font-bold text-white underline decoration-amber-400 underline-offset-4">
              {currentLanguage.name} {currentLanguage.flag}
            </span>
            . You've completed {totalCompleted} of 18 total lectures. Continue building your vocabulary and speaking confidence today!
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() =>
                navigate('lecture-detail', {
                  level: continueLevel,
                  lectureNumber: continueLectureNumber,
                })
              }
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-slate-900 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm sm:text-base"
            >
              <BookOpen className="w-4 h-4" />
              <span>
                Continue: Lesson {continueLectureNumber} ({continueLevel.toUpperCase()})
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('levels')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all cursor-pointer text-sm"
            >
              <Compass className="w-4 h-4" />
              <span>View All Levels</span>
            </button>
          </div>
        </div>

        {/* Floating Greeting Tag */}
        <div className="hidden lg:block absolute -right-4 -bottom-6 text-9xl font-black text-white/5 select-none pointer-events-none">
          {currentLanguage.greeting}
        </div>
      </div>

      {/* Progress Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Mastery */}
        <div className="rounded-2xl p-4 sm:p-5 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Mastery</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalPercentage}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${totalPercentage}%` }}
            />
          </div>
        </div>

        {/* Streak Counter */}
        <div className="rounded-2xl p-4 sm:p-5 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {currentUser.streak?.currentStreak || 1} <span className="text-sm font-semibold text-slate-400">Days</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Best streak: {currentUser.streak?.longestStreak || 1} days
          </p>
        </div>

        {/* Tests Passed */}
        <div className="rounded-2xl p-4 sm:p-5 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tests Passed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {currentUser.testHistory?.filter((t) => t.passed).length || 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Passing score: 60%+
          </p>
        </div>

        {/* Badges Earned */}
        <div className="rounded-2xl p-4 sm:p-5 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Badges</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {currentUser.badges?.length || 0} <span className="text-sm font-semibold text-slate-400">/ 5</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Achievements unlocked
          </p>
        </div>
      </div>

      {/* Curriculum Levels Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Curriculum Path ({currentLanguage.name})
          </h2>
          <button
            onClick={() => navigate('levels')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Basic Level Card */}
          <div
            onClick={() => navigate('lectures', { level: 'basic' })}
            className="rounded-2xl p-6 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-1 transition-all duration-300 shadow-md cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                BASIC
              </span>
              <span className="text-xs font-bold text-slate-500">
                {basicDone}/10 Lectures
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Everyday Foundation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Greetings, numbers, colors, family, dining, calendar, common verbs, and questions.
            </p>
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${(basicDone / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Advanced Level Card */}
          <div
            onClick={() => navigate('lectures', { level: 'advanced' })}
            className={`rounded-2xl p-6 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 transition-all duration-300 shadow-md cursor-pointer group ${
              basicDone < 10
                ? 'opacity-85'
                : 'hover:border-purple-400 dark:hover:border-purple-500 hover:-translate-y-1'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                ADVANCED
              </span>
              <span className="text-xs font-bold text-slate-500">
                {advancedDone}/5 Lectures
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Grammar & Dialogue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Compound sentences, past/present/future tenses, discussions, and travel shopping.
            </p>
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all"
                style={{ width: `${(advancedDone / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Pro Level Card */}
          <div
            onClick={() => navigate('lectures', { level: 'pro' })}
            className={`rounded-2xl p-6 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 transition-all duration-300 shadow-md cursor-pointer group ${
              advancedDone < 5
                ? 'opacity-85'
                : 'hover:border-teal-400 dark:hover:border-teal-500 hover:-translate-y-1'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                PRO
              </span>
              <span className="text-xs font-bold text-slate-500">
                {proDone}/3 Lectures
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              Native Mastery & Idioms
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Fluent conversation, colorful cultural idioms, proverbs, and formal negotiation.
            </p>
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full transition-all"
                style={{ width: `${(proDone / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Translator Shortcut Promo */}
      <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-purple-500/10 border border-teal-500/20 dark:border-teal-400/20 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Languages className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Instant AI Speech & Text Translator
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Speak into your microphone or type any phrase to get instant translations with phonetic guide and speech playback.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('translator')}
          className="shrink-0 px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 cursor-pointer text-sm"
        >
          Open Translator
        </button>
      </div>
    </div>
  );
};
