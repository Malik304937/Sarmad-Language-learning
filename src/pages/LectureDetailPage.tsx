import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  Sparkles,
  BookOpen,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  ArrowLeftCircle,
  HelpCircle,
  Check,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { UserAccount, LevelId, LectureContent, TestQuestion } from '../types';
import { LEVEL_DEFINITIONS } from '../data/curriculumData';
import { getLanguageById } from '../data/languages';
import {
  fetchLectureAndQuiz,
  prefetchNextLecture,
} from '../services/geminiService';
import { speakText } from '../services/speechService';

interface LectureDetailPageProps {
  currentUser: UserAccount;
  level: LevelId;
  lectureNumber: number;
  navigate: (route: string, extra?: any) => void;
}

export const LectureDetailPage: React.FC<LectureDetailPageProps> = ({
  currentUser,
  level,
  lectureNumber,
  navigate,
}) => {
  const currentLanguage = getLanguageById(currentUser.selectedLanguageId || 'spanish');
  const levelInfo = LEVEL_DEFINITIONS[level];
  const outline =
    levelInfo.outlines.find((o) => o.lectureNumber === lectureNumber) ||
    levelInfo.outlines[0];

  const [lecture, setLecture] = useState<LectureContent | null>(null);
  const [quiz, setQuiz] = useState<TestQuestion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  // Load lecture AND quiz simultaneously in ONE call
  const loadContent = (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    fetchLectureAndQuiz({
      languageName: currentLanguage.name,
      level,
      lectureNumber,
      lectureTitle: outline.title,
      forceRefresh,
    })
      .then((bundle) => {
        setLecture(bundle.lecture);
        setQuiz(bundle.quiz);
        setLoading(false);

        // PREFETCH NEXT LECTURE in background while user reads this one
        if (lectureNumber < levelInfo.lectureCount) {
          const nextOutline = levelInfo.outlines.find(
            (o) => o.lectureNumber === lectureNumber + 1
          );
          prefetchNextLecture({
            languageName: currentLanguage.name,
            level,
            lectureNumber: lectureNumber + 1,
            lectureTitle: nextOutline?.title,
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load lecture and quiz:', err);
        setError('Loading took longer than expected. Please try again.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadContent(false);
  }, [currentLanguage.name, level, lectureNumber]);

  const handleSpeak = (text: string) => {
    setPlayingWord(text);
    speakText(text, currentLanguage.voiceCode).finally(() => {
      setPlayingWord(null);
    });
  };

  const hasPrevious = lectureNumber > 1;
  const hasNext = lectureNumber < levelInfo.lectureCount;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('lectures', { level })}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Syllabus</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
            {currentLanguage.flag} {currentLanguage.name}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 uppercase">
            {level} • {lectureNumber}/{levelInfo.lectureCount}
          </span>
        </div>
      </div>

      {/* Error state with Retry button */}
      {error && !loading && (
        <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white">{error}</h3>
          <button
            onClick={() => loadContent(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer text-sm shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Loading</span>
          </button>
        </div>
      )}

      {/* Fast Skeleton Loader (No blank spinners) */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          {/* Header Card Skeleton */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="h-4 bg-indigo-200/50 dark:bg-indigo-900/40 rounded-md w-32" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3" />
          </div>

          {/* Vocabulary Table Skeleton */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-48 mb-4" />
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-xl flex items-center justify-between px-4"
              >
                <div className="w-6 h-6 bg-indigo-200 dark:bg-indigo-900/50 rounded-full" />
                <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
                <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
                <div className="w-28 h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
              </div>
            ))}
          </div>

          {/* Example Sentences Skeleton */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-52 mb-4" />
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-2xl"
              />
            ))}
          </div>
        </div>
      ) : lecture ? (
        <>
          {/* Lecture Header Card */}
          <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Lesson {lectureNumber} of {levelInfo.lectureCount}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {lecture.title || outline.title}
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {lecture.intro}
            </p>
          </div>

          {/* 1. Vocabulary Table (Compact 8 Items) */}
          <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Core Vocabulary & Pronunciation ({lecture.vocabulary?.length || 8})
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Tap <Volume2 className="w-3.5 h-3.5 inline mx-0.5 text-indigo-500" /> to listen
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-200/70 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Listen</th>
                    <th className="py-2.5 px-3">{currentLanguage.name}</th>
                    <th className="py-2.5 px-3">Pronunciation</th>
                    <th className="py-2.5 px-3">English Meaning</th>
                    <th className="py-2.5 px-3 text-right">Urdu (اردو)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {lecture.vocabulary.slice(0, 8).map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => handleSpeak(item.word)}
                          title="Listen with native voice"
                          className={`p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all cursor-pointer ${
                            playingWord === item.word ? 'scale-110 text-indigo-800' : ''
                          }`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white text-base">
                        {item.word}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                        [{item.pronunciation}]
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {item.englishMeaning}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-800 dark:text-slate-200 font-serif" dir="rtl">
                        {item.urduMeaning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Example Sentences (Compact 5 Items) */}
          <div className="rounded-3xl p-6 sm:p-8 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-indigo-500/5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Check className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Practical Real-World Sentences ({lecture.sentences?.length || 5})
              </h2>
            </div>

            <div className="space-y-3">
              {lecture.sentences.slice(0, 5).map((sentence, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 flex items-start justify-between gap-3 group hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-base text-slate-900 dark:text-white">
                      {sentence.target}
                    </p>
                    <p className="font-mono text-xs text-purple-600 dark:text-purple-400">
                      [{sentence.pronunciation}]
                    </p>
                    <div className="pt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                      <span>{sentence.englishMeaning}</span>
                      <span className="text-slate-400 dark:text-slate-600">•</span>
                      <span className="font-serif text-slate-700 dark:text-slate-200" dir="rtl">
                        {sentence.urduMeaning}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSpeak(sentence.target)}
                    title="Listen to full sentence"
                    className="p-2 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-100/70 dark:hover:bg-purple-950/60 transition-all shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Cultural & Grammar Tip Card */}
          {lecture.tip && (
            <div className="rounded-3xl p-5 sm:p-6 backdrop-blur-md bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-indigo-500/10 border border-amber-500/25 flex items-start gap-4">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                  Pro Language Tip
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {lecture.tip}
                </p>
              </div>
            </div>
          )}

          {/* Navigation & Take Test Action Bar */}
          <div className="rounded-3xl p-5 sm:p-6 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              {hasPrevious && (
                <button
                  onClick={() =>
                    navigate('lecture-detail', {
                      level,
                      lectureNumber: lectureNumber - 1,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeftCircle className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}

              {hasNext && (
                <button
                  onClick={() =>
                    navigate('lecture-detail', {
                      level,
                      lectureNumber: lectureNumber + 1,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Take Test Main Button (Quiz is already ready!) */}
            <button
              onClick={() =>
                navigate('test', {
                  level,
                  lectureNumber,
                  lectureTitle: lecture.title,
                  lecture,
                  initialQuiz: quiz,
                })
              }
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm sm:text-base"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Take Lecture {lectureNumber} Test</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};
