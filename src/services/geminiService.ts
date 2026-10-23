import { LectureContent, TestQuestion, LevelId } from '../types';
import { getFallbackLectureContent, getFallbackTestQuestions } from '../data/curriculumData';
import { getCachedLecture, setCachedLecture } from './storage';

const TRANSLATION_CACHE_KEY = 'lingualearn_trans_cache_v1';

// Get local cached translation
function getLocalCachedTranslation(key: string): any | null {
  try {
    const raw = localStorage.getItem(`${TRANSLATION_CACHE_KEY}_${key.toLowerCase()}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Set local cached translation
function setLocalCachedTranslation(key: string, data: any): void {
  try {
    localStorage.setItem(`${TRANSLATION_CACHE_KEY}_${key.toLowerCase()}`, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

export interface LectureBundle {
  lecture: LectureContent;
  quiz: TestQuestion[];
}

// Fetch lecture and quiz TOGETHER in a single request with 20s timeout, auto-retry, and persistent caching
export async function fetchLectureAndQuiz(params: {
  languageName: string;
  level: LevelId;
  lectureNumber: number;
  lectureTitle?: string;
  forceRefresh?: boolean;
}): Promise<LectureBundle> {
  const { languageName, level, lectureNumber, lectureTitle, forceRefresh } = params;
  const baseKey = `${languageName.toLowerCase()}_${level.toLowerCase()}_${lectureNumber}`;
  const lectureCacheKey = `${baseKey}_lecture`;
  const quizCacheKey = `${baseKey}_quiz`;

  // 1. Instant cache check (0ms)
  if (!forceRefresh) {
    const cachedLecture = getCachedLecture(lectureCacheKey);
    const cachedQuiz = getCachedLecture(quizCacheKey);
    if (
      cachedLecture &&
      cachedLecture.vocabulary?.length >= 5 &&
      Array.isArray(cachedQuiz) &&
      cachedQuiz.length >= 5
    ) {
      return {
        lecture: cachedLecture as LectureContent,
        quiz: cachedQuiz as TestQuestion[],
      };
    }
  }

  // 2. Fetch single combined endpoint with 20s timeout and 1 auto-retry
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch('/api/generate-lecture-and-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: languageName,
          level,
          lectureNumber,
          lectureTitle,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.lecture && data.lecture.vocabulary && Array.isArray(data.quiz) && data.quiz.length >= 5) {
          setCachedLecture(lectureCacheKey, data.lecture);
          setCachedLecture(quizCacheKey, data.quiz);
          return {
            lecture: data.lecture,
            quiz: data.quiz,
          };
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn(`Attempt ${attempts} failed for lecture & quiz:`, err.message);
      if (attempts >= maxAttempts) break;
      // Wait 500ms before retry
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // 3. Fallback to rich built-in curriculum
  console.info('Using reliable curriculum fallback for lesson & quiz');
  const fallbackLecture = getFallbackLectureContent(languageName, level, lectureNumber);
  const fallbackQuiz = getFallbackTestQuestions(languageName, fallbackLecture);

  setCachedLecture(lectureCacheKey, fallbackLecture);
  setCachedLecture(quizCacheKey, fallbackQuiz);

  return {
    lecture: fallbackLecture,
    quiz: fallbackQuiz,
  };
}

// Background prefetch for next lecture and quiz
export function prefetchNextLecture(params: {
  languageName: string;
  level: LevelId;
  lectureNumber: number;
  lectureTitle?: string;
}): void {
  const { languageName, level, lectureNumber, lectureTitle } = params;
  const baseKey = `${languageName.toLowerCase()}_${level.toLowerCase()}_${lectureNumber}`;
  const cachedLecture = getCachedLecture(`${baseKey}_lecture`);
  const cachedQuiz = getCachedLecture(`${baseKey}_quiz`);

  // If already cached, nothing to prefetch
  if (cachedLecture && cachedQuiz) return;

  // Run in idle/background time
  if (typeof window !== 'undefined') {
    const run = () => {
      fetchLectureAndQuiz({
        languageName,
        level,
        lectureNumber,
        lectureTitle,
      }).catch((e) => console.warn('Prefetch skipped or failed:', e));
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(run, { timeout: 3000 });
    } else {
      setTimeout(run, 1500);
    }
  }
}

// Backward compatible single wrappers that read from the combined cache
export async function fetchLectureContent(params: {
  languageName: string;
  level: LevelId;
  lectureNumber: number;
  lectureTitle?: string;
}): Promise<LectureContent> {
  const bundle = await fetchLectureAndQuiz(params);
  return bundle.lecture;
}

export async function fetchTestQuestions(params: {
  languageName: string;
  level: LevelId;
  lectureNumber: number;
  lectureTitle: string;
  lecture: LectureContent;
}): Promise<TestQuestion[]> {
  const bundle = await fetchLectureAndQuiz({
    languageName: params.languageName,
    level: params.level,
    lectureNumber: params.lectureNumber,
    lectureTitle: params.lectureTitle,
  });
  return bundle.quiz;
}

// Ultra-fast Translate with local caching
export async function translateText(params: {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}): Promise<{
  translatedText: string;
  pronunciation: string;
  detectedSource: string;
  notes?: string;
}> {
  const { text, targetLanguage, sourceLanguage } = params;
  const trimmed = text.trim();
  const cacheKey = `${trimmed}_${sourceLanguage || 'auto'}_to_${targetLanguage}`;

  // 1. Check client-side persistent cache
  const localCached = getLocalCachedTranslation(cacheKey);
  if (localCached) {
    return localCached;
  }

  // 2. Fetch with 8-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: trimmed,
        targetLanguage,
        sourceLanguage: sourceLanguage || 'auto-detect',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      setLocalCachedTranslation(cacheKey, data);
      return data;
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('Translate fetch error/timeout:', err);
  }

  // 3. Fallback
  const fallback = {
    translatedText: `[${targetLanguage}] ${trimmed}`,
    pronunciation: `Phonetic reading in ${targetLanguage}`,
    detectedSource: 'Auto-detected',
  };
  setLocalCachedTranslation(cacheKey, fallback);
  return fallback;
}
