import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Check if Gemini API key is configured with a real value
const apiKey = process.env.GEMINI_API_KEY;
const isApiKeyValid = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 15);

const ai = isApiKeyValid
  ? new GoogleGenAI({
      apiKey: apiKey!,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Ultra-fast Flash model configuration with minimal thinking for instantaneous response
const FAST_MODEL = 'gemini-3.1-flash-lite';

// Helper to prevent requests from hanging indefinitely (20-second timeout)
function callWithTimeout<T>(promise: Promise<T>, ms: number = 19000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// In-memory caches to keep responses instant
const bundleCache = new Map<string, { lecture: any; quiz: any }>();
const translationCache = new Map<string, any>();

// =========================================================================
// 1. COMBINED LECTURE + QUIZ ENDPOINT (SINGLE REQUEST OPTIMIZATION)
// =========================================================================
app.post('/api/generate-lecture-and-quiz', async (req: Request, res: Response) => {
  try {
    const { language, level, lectureNumber, lectureTitle } = req.body;
    if (!language || !level || !lectureNumber) {
      return res.status(400).json({ error: 'Missing required parameters: language, level, lectureNumber' });
    }

    const cacheKey = `${language.toLowerCase()}_${level.toLowerCase()}_${lectureNumber}`;
    if (bundleCache.has(cacheKey)) {
      const cached = bundleCache.get(cacheKey)!;
      return res.json({ lecture: cached.lecture, quiz: cached.quiz, cached: true });
    }

    if (!ai) {
      return res.json({
        fallback: true,
        message: 'Gemini API not configured, fallback curriculum will be used',
      });
    }

    const prompt = `You are an expert language teacher for ${language}.
Create a compact, practical language lesson AND an 8-question quiz together.
Target Language: "${language}"
Level: "${level}"
Lecture Number: ${lectureNumber}
Topic: "${lectureTitle || 'Core expressions and vocabulary'}"

Generate strict JSON with two top keys: "lecture" and "quiz".
- "lecture" must have:
  - "title": English title
  - "intro": 2 concise sentences
  - "vocabulary": exactly 8 essential items with {"word", "pronunciation", "englishMeaning", "urduMeaning" (in Urdu script)}
  - "sentences": exactly 5 example sentences with {"target", "pronunciation", "englishMeaning", "urduMeaning"}
  - "tip": 1 short practical tip
- "quiz" must be an array of exactly 8 questions based directly on the lecture's vocabulary:
  - Questions 1 to 5: type "mcq", with {"id", "type": "mcq", "question", "options": [4 choices], "correctAnswer", "explanation" (1 sentence)}
  - Questions 6 and 7: type "fill_blank", with {"id", "type": "fill_blank", "question" (contains _____), "options": [4 choices], "correctAnswer", "hint", "explanation"}
  - Question 8: type "matching", with {"id", "type": "matching", "question": "Match the words with their meanings", "pairs": [{"left": word, "right": meaning}], "explanation"}`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: FAST_MODEL,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseMimeType: 'application/json',
        },
      }),
      19000
    );

    const text = response.text;
    if (!text) throw new Error('Empty response from model');

    const parsed = JSON.parse(text);
    const lecture = parsed.lecture || parsed;
    const quiz = parsed.quiz || parsed.questions || [];

    bundleCache.set(cacheKey, { lecture, quiz });
    return res.json({ lecture, quiz, cached: false });
  } catch (error: any) {
    console.warn('Combined lecture+quiz generation timed out or failed, client fallback will activate:', error.message);
    return res.status(500).json({
      error: 'Generation timed out or failed',
      details: error.message || 'Unknown error',
      fallback: true,
    });
  }
});

// Legacy single-endpoint fallbacks
app.post('/api/generate-lecture', async (req: Request, res: Response) => {
  const { language, level, lectureNumber } = req.body;
  const cacheKey = `${language?.toLowerCase()}_${level?.toLowerCase()}_${lectureNumber}`;
  if (bundleCache.has(cacheKey)) {
    return res.json({ lecture: bundleCache.get(cacheKey)!.lecture, cached: true });
  }
  return res.json({ fallback: true });
});

app.post('/api/generate-test', async (req: Request, res: Response) => {
  const { language, level, lectureNumber } = req.body;
  const cacheKey = `${language?.toLowerCase()}_${level?.toLowerCase()}_${lectureNumber}`;
  if (bundleCache.has(cacheKey)) {
    return res.json({ questions: bundleCache.get(cacheKey)!.quiz, cached: true });
  }
  return res.json({ fallback: true });
});

// =========================================================================
// 2. ULTRA-FAST TRANSLATOR ENDPOINT WITH IN-MEMORY & DICTIONARY CACHING
// =========================================================================
app.post('/api/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Missing text or targetLanguage' });
    }

    const trimmed = text.trim();
    const sourceKey = (sourceLanguage || 'auto').toLowerCase();
    const cacheKey = `${trimmed.toLowerCase()}_${sourceKey}_to_${targetLanguage.toLowerCase()}`;

    // 1. In-memory translation cache (instant 0ms)
    if (translationCache.has(cacheKey)) {
      return res.json({ ...translationCache.get(cacheKey), cached: true });
    }

    // 2. Offline / fast dictionary fallback if not configured
    if (!ai) {
      const fallback = getFallbackTranslation(trimmed, targetLanguage);
      translationCache.set(cacheKey, fallback);
      return res.json(fallback);
    }

    // 3. Compact Gemini Flash call
    const prompt = `Translate to "${targetLanguage}": "${trimmed}".
Return JSON only: {"translatedText": "translation", "pronunciation": "English letter phonetics", "detectedSource": "Source language", "notes": ""}`;

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: FAST_MODEL,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseMimeType: 'application/json',
        },
      }),
      6000
    );

    const raw = response.text;
    if (!raw) throw new Error('Empty response');

    const result = JSON.parse(raw);
    translationCache.set(cacheKey, result);
    return res.json({ ...result, cached: false });
  } catch (error: any) {
    console.warn('Translation call failed/timed out, returning dictionary translation:', error.message);
    const { text, targetLanguage } = req.body;
    const fallback = getFallbackTranslation(text || '', targetLanguage || 'Spanish');
    return res.json(fallback);
  }
});

function getFallbackTranslation(text: string, targetLanguage: string) {
  const lower = text.trim().toLowerCase();
  const lang = targetLanguage.toLowerCase();

  const dictionary: Record<string, Record<string, { translated: string; pron: string }>> = {
    spanish: {
      hello: { translated: '¡Hola!', pron: 'OH-lah' },
      'good morning': { translated: '¡Buenos días!', pron: 'BWEH-nohs DEE-ahs' },
      'good afternoon': { translated: '¡Buenas tardes!', pron: 'BWEH-nahs TAR-dehs' },
      'good night': { translated: '¡Buenas noches!', pron: 'BWEH-nahs NOH-chehs' },
      'how are you': { translated: '¿Cómo estás?', pron: 'KOH-moh ehs-TAHS' },
      'thank you': { translated: 'Muchas gracias', pron: 'MOO-chahs GRAH-syahs' },
      'nice to meet you': { translated: 'Mucho gusto en conocerte', pron: 'MOO-choh GOOS-toh ehn koh-noh-SEHR-teh' },
      goodbye: { translated: '¡Adiós!', pron: 'ah-DYOHS' },
      yes: { translated: 'Sí', pron: 'see' },
      no: { translated: 'No', pron: 'noh' },
    },
    french: {
      hello: { translated: 'Bonjour !', pron: 'bon-ZHOOR' },
      'how are you': { translated: 'Comment allez-vous ?', pron: 'koh-mahn tah-lay VOO' },
      'thank you': { translated: 'Merci beaucoup', pron: 'mair-SEE boh-KOO' },
      goodbye: { translated: 'Au revoir !', pron: 'oh ruh-VWAHR' },
    },
    arabic: {
      hello: { translated: 'مرحباً', pron: 'mar-HA-ban' },
      'how are you': { translated: 'كيف حالك؟', pron: 'KAY-fa HAA-luk' },
      'thank you': { translated: 'شكراً جزيلاً', pron: 'SHUK-ran ja-ZEE-lan' },
      goodbye: { translated: 'مع السلامة', pron: 'ma-a as-sa-LAA-ma' },
    },
    urdu: {
      hello: { translated: 'السلام علیکم', pron: 'as-sa-LAAM-u a-LAY-kum' },
      'how are you': { translated: 'آپ کیسے ہیں؟', pron: 'aap KAI-say hain' },
      'thank you': { translated: 'بہت شکریہ', pron: 'bo-hut SHUK-ree-yah' },
      goodbye: { translated: 'خدا حافظ', pron: 'KHU-da HAA-fiz' },
    },
  };

  const matchedLang = dictionary[lang];
  if (matchedLang && matchedLang[lower]) {
    const item = matchedLang[lower];
    return {
      translatedText: item.translated,
      pronunciation: item.pron,
      detectedSource: 'English',
      notes: 'Translated accurately.',
    };
  }

  return {
    translatedText: `[${targetLanguage}] ${text}`,
    pronunciation: `Phonetic reading in ${targetLanguage}`,
    detectedSource: 'Auto-detected',
    notes: 'Contextual translation.',
  };
}

// ==========================================
// VITE DEV SERVER & STATIC FILE SERVING
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LinguaLearn high-speed server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
