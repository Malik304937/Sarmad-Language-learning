import React from 'react';
import {
  User,
  Languages,
  Award,
  Flame,
  CheckCircle2,
  Trophy,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Star,
  Compass,
  Calendar,
  Lock,
} from 'lucide-react';
import { UserAccount, Badge } from '../types';
import { getLanguageById } from '../data/languages';
import { getLanguageProgress } from '../services/storage';

interface ProfilePageProps {
  currentUser: UserAccount;
  navigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, navigate }) => {
  const currentLanguage = getLanguageById(currentUser.selectedLanguageId || 'spanish');
  const progress = getLanguageProgress(currentUser);

  // Completed counts
  const completedKeys = Object.keys(progress.completedLectures).filter(
    (k) => progress.completedLectures[k].passed
  );
  const basicCount = completedKeys.filter((k) => k.startsWith('basic_')).length;
  const advancedCount = completedKeys.filter((k) => k.startsWith('advanced_')).length;
  const proCount = completedKeys.filter((k) => k.startsWith('pro_')).length;
  const totalCompleted = basicCount + advancedCount + proCount;
  const totalPercent = Math.round((totalCompleted / 18) * 100);

  const passedTests = currentUser.testHistory?.filter((t) => t.passed) || [];
  const bestScoreOverall =
    currentUser.testHistory?.length > 0
      ? Math.max(...currentUser.testHistory.map((t) => t.score))
      : 0;

  // The 5 official badges from requirements
  const ALL_BADGES: Array<{
    id: string;
    name: string;
    description: string;
    icon: any;
    unlocked: boolean;
  }> = [
    {
      id: 'First Lesson',
      name: 'First Lesson',
      description: 'Completed and passed your very first lecture quiz.',
      icon: Sparkles,
      unlocked: currentUser.badges?.includes('First Lesson') || totalCompleted >= 1,
    },
    {
      id: 'First Test Passed',
      name: 'First Test Passed',
      description: 'Scored 60% or higher on an end-of-lecture assessment.',
      icon: Trophy,
      unlocked: currentUser.badges?.includes('First Test Passed') || passedTests.length >= 1,
    },
    {
      id: 'Basic Completed',
      name: 'Basic Completed',
      description: 'Passed all 10 foundation lectures in the chosen language.',
      icon: Award,
      unlocked: currentUser.badges?.includes('Basic Completed') || basicCount >= 10,
    },
    {
      id: 'Advanced Completed',
      name: 'Advanced Completed',
      description: 'Mastered all 5 advanced dialogue and grammar lectures.',
      icon: Star,
      unlocked: currentUser.badges?.includes('Advanced Completed') || advancedCount >= 5,
    },
    {
      id: 'Pro Completed',
      name: 'Pro Completed',
      description: 'Conquered all 3 Pro lectures with native nuances and idioms.',
      icon: Flame,
      unlocked: currentUser.badges?.includes('Pro Completed') || proCount >= 3,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-lg shadow-indigo-600/30">
            {currentUser.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                @{currentUser.username}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Learner
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined Sarmad Language Learning</span>
            </p>
          </div>
        </div>

        {/* Change Language Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <span className="text-2xl">{currentLanguage.flag}</span>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Active Language
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {currentLanguage.name}
              </span>
            </div>
            <button
              onClick={() => navigate('languages')}
              className="ml-2 px-3 py-1.5 rounded-xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Stats Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Progress */}
        <div className="rounded-2xl p-5 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Syllabus</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalCompleted} / 18
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${totalPercent}%` }}
            />
          </div>
        </div>

        {/* Daily Streak */}
        <div className="rounded-2xl p-5 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {currentUser.streak?.currentStreak || 1} <span className="text-xs text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Longest streak: {currentUser.streak?.longestStreak || 1} days
          </p>
        </div>

        {/* Tests Passed */}
        <div className="rounded-2xl p-5 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tests Passed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {passedTests.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Total attempts: {currentUser.testHistory?.length || 0}
          </p>
        </div>

        {/* Best Score */}
        <div className="rounded-2xl p-5 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Top Quiz Score</span>
            <Trophy className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {bestScoreOverall} / 8
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Accuracy target: 60%+
          </p>
        </div>
      </div>

      {/* Completed Lectures Per Level */}
      <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Completed Lectures Per Level ({currentLanguage.name})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                BASIC LEVEL
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {basicCount} / 10
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${(basicCount / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                ADVANCED LEVEL
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {advancedCount} / 5
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full"
                style={{ width: `${(advancedCount / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                PRO LEVEL
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {proCount} / 3
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full"
                style={{ width: `${(proCount / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Achievement Badges
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Milestones earned through dedication, quizzes, and consistent daily study.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  badge.unlocked
                    ? 'bg-gradient-to-tr from-amber-500/10 via-purple-500/5 to-indigo-500/10 border-amber-500/30'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    badge.unlocked
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  {badge.unlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {badge.name}
                    </h3>
                    {badge.unlocked && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        ✓ Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Test History */}
      {currentUser.testHistory && currentUser.testHistory.length > 0 && (
        <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Assessment Scores
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Lecture</th>
                  <th className="py-2.5 px-3">Level</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {currentUser.testHistory.slice(0, 8).map((record) => (
                  <tr key={record.testId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      Lesson {record.lectureNumber}: {record.lectureTitle}
                    </td>
                    <td className="py-2.5 px-3 uppercase font-bold text-indigo-600 dark:text-indigo-400">
                      {record.level}
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      {record.score} / {record.totalQuestions} ({record.percentage}%)
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          record.passed
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {record.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
