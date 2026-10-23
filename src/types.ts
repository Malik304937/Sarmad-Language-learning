export type LevelId = 'basic' | 'advanced' | 'pro';

export interface Language {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  voiceCode: string;
  greeting: string;
  description: string;
}

export interface LectureOutline {
  lectureNumber: number;
  title: string;
  topic: string;
  description: string;
}

export interface LevelInfo {
  id: LevelId;
  title: string;
  tagline: string;
  lectureCount: number;
  description: string;
  outlines: LectureOutline[];
}

export interface VocabularyItem {
  word: string;
  pronunciation: string;
  englishMeaning: string;
  urduMeaning: string;
}

export interface SentenceItem {
  target: string;
  pronunciation: string;
  englishMeaning: string;
  urduMeaning: string;
}

export interface LectureContent {
  title: string;
  intro: string;
  vocabulary: VocabularyItem[];
  sentences: SentenceItem[];
  tip: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface TestQuestion {
  id: string;
  type: 'mcq' | 'fill_blank' | 'matching';
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  hint?: string;
  pairs?: MatchingPair[];
}

export interface TestResultRecord {
  testId: string;
  languageId: string;
  level: LevelId;
  lectureNumber: number;
  lectureTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  timestamp: string;
  userAnswers: Record<string, any>;
}

export interface LectureProgressItem {
  passed: boolean;
  bestScore: number;
  totalQuestions: number;
  attempts: number;
  completedAt: string;
}

export interface LanguageProgress {
  languageId: string;
  currentLevel: LevelId;
  completedLectures: Record<string, LectureProgressItem>; // key: `${level}_${lectureNumber}`
  lastActiveLecture?: {
    level: LevelId;
    lectureNumber: number;
  };
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
}

export interface UserAccount {
  username: string;
  passwordHash: string;
  secretQuestion: string;
  secretAnswerHash: string;
  selectedLanguageId?: string;
  languageProgress: Record<string, LanguageProgress>; // key: languageId
  testHistory: TestResultRecord[];
  badges: string[];
  streak: StreakInfo;
  createdAt: string;
}

export interface TranslationItem {
  id: string;
  text: string;
  translatedText: string;
  pronunciation: string;
  sourceLang: string;
  targetLang: string;
  timestamp: string;
  isFavorite: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}
