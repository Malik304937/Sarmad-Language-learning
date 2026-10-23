import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Award,
  Sparkles,
  Trophy,
  Volume2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import {
  UserAccount,
  LevelId,
  LectureContent,
  TestQuestion,
  TestResultRecord,
} from '../types';
import { getLanguageById } from '../data/languages';
import { fetchTestQuestions } from '../services/geminiService';
import { recordTestCompletion } from '../services/storage';
import { speakText } from '../services/speechService';

interface TestPageProps {
  currentUser: UserAccount;
  level: LevelId;
  lectureNumber: number;
  lectureTitle: string;
  lecture: LectureContent;
  initialQuiz?: TestQuestion[];
  onTestSaved: (updatedUser: UserAccount) => void;
  navigate: (route: string, extra?: any) => void;
}

export const TestPage: React.FC<TestPageProps> = ({
  currentUser,
  level,
  lectureNumber,
  lectureTitle,
  lecture,
  initialQuiz,
  onTestSaved,
  navigate,
}) => {
  const currentLanguage = getLanguageById(currentUser.selectedLanguageId || 'spanish');

  const [questions, setQuestions] = useState<TestQuestion[]>(() => {
    return initialQuiz && Array.isArray(initialQuiz) && initialQuiz.length >= 5
      ? initialQuiz
      : [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return !(initialQuiz && Array.isArray(initialQuiz) && initialQuiz.length >= 5);
  });
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User responses
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [matchingSelections, setMatchingSelections] = useState<Record<string, string>>({});
  const [matchingSelectedLeft, setMatchingSelectedLeft] = useState<string | null>(null);

  // Instant feedback state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnswerWrong, setIsAnswerWrong] = useState(false);

  // Optional Timer
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);

  // Final Results
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const loadQuestions = () => {
    if (initialQuiz && initialQuiz.length >= 5) {
      setQuestions(initialQuiz);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchTestQuestions({
      languageName: currentLanguage.name,
      level,
      lectureNumber,
      lectureTitle,
      lecture,
    })
      .then((qs) => {
        setQuestions(qs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load test questions:', err);
        setError('Quiz preparation timed out. Click below to retry.');
        setLoading(false);
      });
  };

  // Load questions if not provided
  useEffect(() => {
    if (questions.length === 0) {
      loadQuestions();
    }
  }, [currentLanguage.name, level, lectureNumber, lectureTitle, lecture]);

  // Countdown timer per question
  useEffect(() => {
    if (!timerEnabled || isSubmitted || isFinished || loading) return;

    if (timeLeft <= 0) {
      // Auto-submit timeout
      handleConfirmAnswer(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, timerEnabled, isSubmitted, isFinished, loading]);

  const currentQ = questions[currentIndex];

  // Reset answer states when advancing question
  const advanceQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setMatchingSelections({});
      setMatchingSelectedLeft(null);
      setIsSubmitted(false);
      setIsAnswerWrong(false);
      setTimeLeft(30);
    } else {
      finishTest();
    }
  };

  // Evaluate matching question
  const checkMatchingCorrectness = (q: TestQuestion, selections: Record<string, string>): boolean => {
    if (!q.pairs) return false;
    for (const pair of q.pairs) {
      if (selections[pair.left] !== pair.right) {
        return false;
      }
    }
    return true;
  };

  // User submits choice
  const handleConfirmAnswer = (isTimeout = false) => {
    if (!currentQ || isSubmitted) return;

    let isCorrect = false;
    let recordedAnswer: any = selectedAnswer;

    if (currentQ.type === 'matching') {
      recordedAnswer = matchingSelections;
      isCorrect = checkMatchingCorrectness(currentQ, matchingSelections);
    } else {
      isCorrect = selectedAnswer === currentQ.correctAnswer;
    }

    if (!isCorrect) {
      setIsAnswerWrong(true);
    }

    setIsSubmitted(true);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        userAnswer: isTimeout ? '(Time expired)' : recordedAnswer,
        isCorrect,
        correctAnswer: currentQ.type === 'matching' ? currentQ.pairs : currentQ.correctAnswer,
        explanation: currentQ.explanation,
      },
    }));
  };

  // Calculate final results, burst confetti on pass, save to user progress
  const finishTest = () => {
    let score = 0;
    const total = questions.length;

    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans && ans.isCorrect) {
        score++;
      }
    });

    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 60; // 60% passing requirement

    setFinalScore(score);
    setIsFinished(true);

    if (passed) {
      // Trigger festive confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#3b82f6'],
      });
    }

    // Persist score & unlock next lesson in user profile
    const testRecord: TestResultRecord = {
      testId: `${level}_${lectureNumber}_${Date.now()}`,
      languageId: currentLanguage.id,
      level,
      lectureNumber,
      lectureTitle,
      score,
      totalQuestions: total,
      percentage,
      passed,
      timestamp: new Date().toISOString(),
      userAnswers,
    };

    const { updatedUser } = recordTestCompletion(currentUser, testRecord);
    onTestSaved(updatedUser);
  };

  const restartTest = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setSelectedAnswer(null);
    setMatchingSelections({});
    setMatchingSelectedLeft(null);
    setIsSubmitted(false);
    setIsAnswerWrong(false);
    setIsFinished(false);
    setTimeLeft(30);
  };

  const handleSpeak = (text: string) => {
    speakText(text, currentLanguage.voiceCode);
  };

  if (error && !loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{error}</h2>
          <button
            onClick={loadQuestions}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer text-sm shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Preparing Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-36" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
        <div className="rounded-3xl p-6 sm:p-8 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="h-4 bg-indigo-200/50 dark:bg-indigo-900/40 rounded-md w-28" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-4/5" />
          <div className="space-y-3 pt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // FINAL RESULTS VIEW
  // ==========================================
  if (isFinished) {
    const total = questions.length;
    const percentage = Math.round((finalScore / total) * 100);
    const passed = percentage >= 60;

    let motivationalMsg = '';
    if (percentage === 100) {
      motivationalMsg = 'Flawless Victory! You have native-level retention of this lecture!';
    } else if (percentage >= 80) {
      motivationalMsg = 'Excellent performance! You have grasped the concepts brilliantly!';
    } else if (passed) {
      motivationalMsg = 'Congratulations! You passed the test and unlocked the next lesson!';
    } else {
      motivationalMsg = 'Good effort! Review the vocabulary and try again to achieve 60%+ to unlock the next lesson.';
    }

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-3xl p-6 sm:p-10 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xl text-center space-y-6">
          <div
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${
              passed
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-rose-500/25'
            }`}
          >
            {passed ? <Trophy className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
          </div>

          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                passed
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {passed ? 'Passed (Next Lesson Unlocked)' : 'Keep Practicing (Need 60%)'}
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {passed ? 'Quiz Passed!' : 'Almost There!'}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {motivationalMsg}
            </p>
          </div>

          {/* Score breakdown metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {finalScore} / {total}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Percentage</span>
              <span
                className={`text-2xl font-extrabold ${
                  passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {percentage}%
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 inline-block">
                {passed ? 'PASSED' : 'RETRY'}
              </span>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="text-left space-y-3 pt-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Questions Review:</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {questions.map((q, idx) => {
                const ans = userAnswers[q.id];
                const wasCorrect = ans?.isCorrect;

                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-xl border text-xs ${
                      wasCorrect
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                        : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {idx + 1}. {q.question}
                      </div>
                      {wasCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                    </div>
                    {!wasCorrect && (
                      <div className="mt-1 text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Correct:{' '}
                        </span>
                        {q.type === 'matching' ? 'Review matched vocabulary' : String(q.correctAnswer)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={restartTest}
              className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Test</span>
            </button>

            {passed ? (
              <button
                onClick={() => navigate('lectures', { level })}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Continue Syllabus</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() =>
                  navigate('lecture-detail', { level, lectureNumber })
                }
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Review Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ACTIVE QUESTION RUNNER VIEW
  // ==========================================
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Top Bar with Question Counter & Timer */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
            {level.toUpperCase()} • LESSON {lectureNumber} QUIZ
          </span>
          <h2 className="text-sm font-bold text-slate-600 dark:text-slate-400">
            Question {currentIndex + 1} of {questions.length}
          </h2>
        </div>

        {/* Optional Timer */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimerEnabled(!timerEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
              timerEnabled
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{timerEnabled ? `${timeLeft}s` : 'Timer Off'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card (with shake animation on wrong answer) */}
      <div
        className={`rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 shadow-xl transition-all ${
          isAnswerWrong ? 'animate-wrong-shake border-rose-400 dark:border-rose-600' : ''
        }`}
      >
        {/* Question Type Pill */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            {currentQ.type === 'mcq'
              ? 'Multiple Choice (MCQ)'
              : currentQ.type === 'fill_blank'
              ? 'Fill in the Blank'
              : 'Word Matching'}
          </span>

          {currentQ.hint && !isSubmitted && (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hint: {currentQ.hint}</span>
            </span>
          )}
        </div>

        {/* Question Text */}
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
          {currentQ.question}
        </h3>

        {/* 1. MCQ and Fill-in-the-blank Options */}
        {(currentQ.type === 'mcq' || currentQ.type === 'fill_blank') && currentQ.options && (
          <div className="mt-6 space-y-3">
            {currentQ.options.map((option, idx) => {
              const isChosen = selectedAnswer === option;
              const isCorrect = option === currentQ.correctAnswer;

              let btnStyle =
                'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500';

              if (isSubmitted) {
                if (isCorrect) {
                  btnStyle =
                    'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                } else if (isChosen && !isCorrect) {
                  btnStyle =
                    'bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-200 font-bold';
                } else {
                  btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
                }
              } else if (isChosen) {
                btnStyle =
                  'bg-indigo-600/10 border-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs';
              }

              return (
                <button
                  key={idx}
                  disabled={isSubmitted}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm sm:text-base font-medium transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 text-xs font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {isSubmitted && isChosen && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. Word Matching Question Interface */}
        {currentQ.type === 'matching' && currentQ.pairs && (
          <div className="mt-6 space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click a word on the left, then click its corresponding match on the right:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Left terms */}
              <div className="space-y-2">
                {currentQ.pairs.map((pair, pIdx) => {
                  const isSelectedLeft = matchingSelectedLeft === pair.left;
                  const matchedRight = matchingSelections[pair.left];

                  return (
                    <button
                      key={pIdx}
                      disabled={isSubmitted}
                      onClick={() => setMatchingSelectedLeft(pair.left)}
                      className={`w-full p-3 rounded-xl border text-xs sm:text-sm font-bold text-left transition-all cursor-pointer ${
                        isSelectedLeft
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                          : matchedRight
                          ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-800 dark:text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white'
                      }`}
                    >
                      <span>{pair.left}</span>
                      {matchedRight && (
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                          → {matchedRight}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right meanings */}
              <div className="space-y-2">
                {currentQ.pairs.map((pair, pIdx) => {
                  const isAssigned = Object.values(matchingSelections).includes(pair.right);

                  return (
                    <button
                      key={pIdx}
                      disabled={isSubmitted || !matchingSelectedLeft}
                      onClick={() => {
                        if (matchingSelectedLeft) {
                          setMatchingSelections((prev) => ({
                            ...prev,
                            [matchingSelectedLeft]: pair.right,
                          }));
                          setMatchingSelectedLeft(null);
                        }
                      }}
                      className={`w-full p-3 rounded-xl border text-xs sm:text-sm font-medium text-left transition-all cursor-pointer ${
                        isAssigned
                          ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {pair.right}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Instant Feedback Explanation Banner */}
        {isSubmitted && (
          <div
            className={`mt-6 p-4 rounded-2xl border text-xs sm:text-sm animate-in fade-in ${
              isAnswerWrong
                ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
                : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              {isAnswerWrong ? (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Incorrect! The right answer is: {currentQ.correctAnswer}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Correct! Spot on!</span>
                </>
              )}
            </div>
            {currentQ.explanation && (
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {currentQ.explanation}
              </p>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {currentIndex + 1} of {questions.length} answered
          </div>

          {!isSubmitted ? (
            <button
              onClick={() => handleConfirmAnswer(false)}
              disabled={
                currentQ.type === 'matching'
                  ? Object.keys(matchingSelections).length < (currentQ.pairs?.length || 4)
                  : !selectedAnswer
              }
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 disabled:opacity-40 transition-all cursor-pointer text-sm"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={advanceQuestion}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer text-sm"
            >
              <span>{currentIndex + 1 === questions.length ? 'See Results' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
