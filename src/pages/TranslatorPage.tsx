import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRightLeft,
  Search,
  Volume2,
  Copy,
  Check,
  Star,
  Trash2,
  X,
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  Clock,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { UserAccount, TranslationItem } from '../types';
import { SUPPORTED_LANGUAGES, getLanguageById } from '../data/languages';
import { translateText } from '../services/geminiService';
import { speakText, createSpeechRecognizer } from '../services/speechService';
import {
  getStoredTranslations,
  saveStoredTranslations,
} from '../services/storage';

interface TranslatorPageProps {
  currentUser: UserAccount;
}

const AUTO_DETECT_LANG = {
  id: 'auto',
  name: 'Auto-detect',
  nativeName: 'Detect language',
  flag: '🌐',
  voiceCode: 'en-US',
  greeting: 'Hello',
  description: 'Automatically detects the source language',
};

export const TranslatorPage: React.FC<TranslatorPageProps> = ({ currentUser }) => {
  // Source language (defaults to 'english')
  const [sourceLangId, setSourceLangId] = useState<string>('english');

  // Target language (defaults to user's chosen account language, or 'spanish')
  const [targetLangId, setTargetLangId] = useState<string>(() => {
    return currentUser.selectedLanguageId && currentUser.selectedLanguageId !== 'english'
      ? currentUser.selectedLanguageId
      : 'spanish';
  });

  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [detectedSource, setDetectedSource] = useState('');

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown open states
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');

  // History & Favorites
  const [history, setHistory] = useState<TranslationItem[]>([]);
  const [viewTab, setViewTab] = useState<'history' | 'favorites'>('history');

  const recognizerRef = useRef<any>(null);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const targetDropdownRef = useRef<HTMLDivElement>(null);

  const sourceLang =
    sourceLangId === 'auto'
      ? AUTO_DETECT_LANG
      : getLanguageById(sourceLangId);
  const targetLang = getLanguageById(targetLangId);

  // Load history on mount
  useEffect(() => {
    const saved = getStoredTranslations(currentUser.username);
    setHistory(saved);
  }, [currentUser.username]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sourceDropdownRef.current &&
        !sourceDropdownRef.current.contains(e.target as Node)
      ) {
        setSourceDropdownOpen(false);
      }
      if (
        targetDropdownRef.current &&
        !targetDropdownRef.current.contains(e.target as Node)
      ) {
        setTargetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Automatic translation with 500ms debounce
  useEffect(() => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      setTranslatedText('');
      setPronunciation('');
      setDetectedSource('');
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const sourceName = sourceLangId === 'auto' ? undefined : sourceLang.name;
        const res = await translateText({
          text: trimmed,
          targetLanguage: targetLang.name,
          sourceLanguage: sourceName,
        });

        setTranslatedText(res.translatedText);
        setPronunciation(res.pronunciation || '');
        setDetectedSource(res.detectedSource || '');
        setError(null);

        // Record in history
        const newItem: TranslationItem = {
          id: `trans_${Date.now()}`,
          text: trimmed,
          translatedText: res.translatedText,
          pronunciation: res.pronunciation || '',
          sourceLang: res.detectedSource || sourceLang.name,
          targetLang: targetLang.name,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFavorite: false,
        };

        setHistory((prev) => {
          const filtered = prev.filter((h) => h.text !== trimmed || h.targetLang !== targetLang.name);
          const updated = [newItem, ...filtered].slice(0, 10);
          saveStoredTranslations(currentUser.username, updated);
          return updated;
        });
      } catch (err: any) {
        console.error('Translation error:', err);
        setError('Translation temporarily unavailable. Please retry.');
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputText, sourceLangId, targetLangId]);

  // Language Swap Button
  const handleSwap = () => {
    // If source is auto, swap target into source, and source becomes previous target or english
    const newSourceId = targetLangId;
    const newTargetId = sourceLangId === 'auto' ? 'english' : sourceLangId;

    setSourceLangId(newSourceId);
    setTargetLangId(newTargetId);

    // Swap text as well!
    if (translatedText) {
      const prevTrans = translatedText;
      setInputText(prevTrans);
      setTranslatedText(inputText);
    }
  };

  // Microphone toggle for speech input
  const toggleListening = () => {
    if (isListening) {
      if (recognizerRef.current) recognizerRef.current.stop();
      setIsListening(false);
      return;
    }

    setError(null);
    const voiceCode = sourceLang.voiceCode || 'en-US';
    const recognizer = createSpeechRecognizer(
      voiceCode,
      (transcript) => {
        setInputText(transcript);
      },
      (errMsg) => {
        setError(errMsg);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (!recognizer) {
      setError('Voice recognition is not supported in this browser. Please type.');
      return;
    }

    recognizerRef.current = recognizer;
    setIsListening(true);
    recognizer.start();
  };

  // TTS audio playback
  const handleSpeak = (text: string, voiceCode: string) => {
    if (!text.trim()) return;
    speakText(text, voiceCode);
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle Favorite
  const toggleFavorite = (textToMatch: string) => {
    const updated = history.map((item) => {
      if (item.translatedText === textToMatch || item.text === textToMatch) {
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    });
    setHistory(updated);
    saveStoredTranslations(currentUser.username, updated);
  };

  const isCurrentFavorite = history.some(
    (h) => h.translatedText === translatedText && h.isFavorite
  );

  // Clear button
  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setPronunciation('');
    setError(null);
  };

  // Font styling helper for Urdu and Arabic RTL output
  const getLanguageTextStyle = (langId: string) => {
    if (langId === 'urdu') {
      return 'font-urdu text-right text-2xl sm:text-3xl leading-relaxed';
    }
    if (langId === 'arabic') {
      return 'font-arabic text-right text-2xl sm:text-3xl leading-relaxed';
    }
    if (langId === 'persian') {
      return 'text-right text-2xl sm:text-3xl';
    }
    return 'text-left text-xl sm:text-2xl';
  };

  const isRtl = (langId: string) =>
    langId === 'urdu' || langId === 'arabic' || langId === 'persian';

  // Quick selection language pills
  const quickSourcePills = [
    { id: 'auto', label: 'Auto-detect' },
    { id: 'english', label: 'English' },
    { id: 'spanish', label: 'Spanish' },
    { id: 'urdu', label: 'Urdu' },
  ];

  const quickTargetPills = [
    { id: 'spanish', label: 'Spanish' },
    { id: 'french', label: 'French' },
    { id: 'arabic', label: 'Arabic' },
    { id: 'urdu', label: 'Urdu' },
  ];

  const filteredSourceLanguages = [
    AUTO_DETECT_LANG,
    ...SUPPORTED_LANGUAGES,
  ].filter((lang) => {
    const q = sourceSearch.toLowerCase();
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q)
    );
  });

  const filteredTargetLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const q = targetSearch.toLowerCase();
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Globe className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Sarmad AI Translator</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Two-panel Google Translate style studio with voice input, native speech, and Urdu/Arabic Nastaliq script support.
          </p>
        </div>

        {detectedSource && sourceLangId === 'auto' && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Detected: {detectedSource}
          </span>
        )}
      </div>

      {/* Main Google Translate Card */}
      <div className="rounded-3xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Top Control Bar with Language Selection & Swap */}
        <div className="border-b border-slate-200/70 dark:border-slate-800/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40">
          {/* SOURCE LANGUAGE SELECTOR */}
          <div className="relative flex-1 min-w-[200px]" ref={sourceDropdownRef}>
            <div className="flex items-center gap-1">
              {/* Quick Pills */}
              <div className="hidden sm:flex items-center gap-1">
                {quickSourcePills.map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setSourceLangId(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      sourceLangId === pill.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Dropdown Button */}
              <button
                onClick={() => {
                  setSourceDropdownOpen(!sourceDropdownOpen);
                  setTargetDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:border-indigo-500 transition-all cursor-pointer"
              >
                <span>{sourceLang.flag}</span>
                <span className="truncate max-w-[130px]">{sourceLang.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Source Dropdown Menu */}
            {sourceDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                    placeholder="Search source language..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 border-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {filteredSourceLanguages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setSourceLangId(lang.id);
                        setSourceDropdownOpen(false);
                        setSourceSearch('');
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        sourceLangId === lang.id
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      <span className="text-[11px] opacity-75">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SWAP BUTTON (⇄) */}
          <div className="shrink-0 flex items-center justify-center">
            <button
              onClick={handleSwap}
              title="Swap languages and text"
              className="p-2.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer hover:rotate-180 duration-300 shadow-xs"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* TARGET LANGUAGE SELECTOR */}
          <div className="relative flex-1 min-w-[200px] flex justify-end" ref={targetDropdownRef}>
            <div className="flex items-center gap-1 justify-end">
              {/* Quick Pills */}
              <div className="hidden sm:flex items-center gap-1">
                {quickTargetPills.map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setTargetLangId(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      targetLangId === pill.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Dropdown Button */}
              <button
                onClick={() => {
                  setTargetDropdownOpen(!targetDropdownOpen);
                  setSourceDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:border-indigo-500 transition-all cursor-pointer"
              >
                <span>{targetLang.flag}</span>
                <span className="truncate max-w-[130px]">{targetLang.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Target Dropdown Menu */}
            {targetDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    placeholder="Search target language..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 border-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {filteredTargetLanguages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setTargetLangId(lang.id);
                        setTargetDropdownOpen(false);
                        setTargetSearch('');
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        targetLangId === lang.id
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      <span className="text-[11px] opacity-75">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Two-Panel Workspace (Side by side on desktop, stacked on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/70 dark:divide-slate-800/80">
          {/* ========================================================= */}
          {/* LEFT PANEL: SOURCE INPUT                                  */}
          {/* ========================================================= */}
          <div className="p-5 sm:p-6 flex flex-col justify-between min-h-[300px] sm:min-h-[360px] bg-white/40 dark:bg-slate-900/40">
            <div className="relative flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to translate..."
                maxLength={5000}
                dir={isRtl(sourceLangId) ? 'rtl' : 'ltr'}
                className={`w-full h-full min-h-[220px] bg-transparent resize-none border-none focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400 font-medium ${
                  isRtl(sourceLangId) ? (sourceLangId === 'urdu' ? 'font-urdu text-xl' : 'font-arabic text-xl') : 'text-lg sm:text-xl'
                }`}
              />

              {/* Listening pulse badge */}
              {isListening && (
                <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 text-xs font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>Listening ({sourceLang.name})...</span>
                </div>
              )}
            </div>

            {/* Left Action Footer */}
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-1.5">
                {/* Microphone Button */}
                <button
                  onClick={toggleListening}
                  title={isListening ? 'Stop listening' : `Speak in ${sourceLang.name}`}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white animate-mic-pulse'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Listen input button */}
                {inputText && (
                  <button
                    onClick={() => handleSpeak(inputText, sourceLang.voiceCode)}
                    title="Listen to input text"
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}

                {/* Clear (X) button */}
                {inputText && (
                  <button
                    onClick={handleClear}
                    title="Clear text"
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Character Counter */}
              <span className="text-xs font-mono font-medium text-slate-400">
                {inputText.length} / 5,000
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT PANEL: TARGET TRANSLATION OUTPUT                    */}
          {/* ========================================================= */}
          <div className="p-5 sm:p-6 flex flex-col justify-between min-h-[300px] sm:min-h-[360px] bg-slate-50/50 dark:bg-slate-800/20">
            <div className="relative flex-1 space-y-3">
              {/* Small Loading indicator */}
              {loading && (
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse mb-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Translating with Gemini Flash...</span>
                </div>
              )}

              {/* Translated Text or Placeholder */}
              {translatedText ? (
                <div
                  dir={isRtl(targetLangId) ? 'rtl' : 'ltr'}
                  className={`font-bold text-slate-900 dark:text-white select-text ${getLanguageTextStyle(
                    targetLangId
                  )}`}
                >
                  {translatedText}
                </div>
              ) : (
                <span className="text-slate-400 text-lg sm:text-xl font-medium select-none">
                  {loading ? 'Translating...' : 'Translation'}
                </span>
              )}

              {/* Pronunciation guide in English letters below translation */}
              {pronunciation && !loading && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Pronunciation:
                  </span>
                  <p className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl inline-block">
                    [{pronunciation}]
                  </p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <p className="text-xs text-rose-500 font-semibold pt-1">
                  {error}
                </p>
              )}
            </div>

            {/* Right Action Footer */}
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-1.5">
                {/* Listen Translation Button */}
                <button
                  disabled={!translatedText}
                  onClick={() => handleSpeak(translatedText, targetLang.voiceCode)}
                  title={`Listen in ${targetLang.name}`}
                  className="p-2.5 rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                {/* Copy Button */}
                <button
                  disabled={!translatedText}
                  onClick={handleCopy}
                  title="Copy translation"
                  className="p-2.5 rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>

                {/* Save to Favorites Button */}
                <button
                  disabled={!translatedText}
                  onClick={() => toggleFavorite(translatedText)}
                  title={isCurrentFavorite ? 'Saved in favorites' : 'Save to favorites'}
                  className="p-2.5 rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      isCurrentFavorite ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>
              </div>

              {copied && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  Copied to clipboard!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History and Favorites Section */}
      <div className="rounded-3xl p-6 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 shadow-lg">
        {/* Tab Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
            <button
              onClick={() => setViewTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewTab === 'history'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Recent History ({history.length})
            </button>
            <button
              onClick={() => setViewTab('favorites')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewTab === 'favorites'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Favorites ({history.filter((h) => h.isFavorite).length})
            </button>
          </div>

          {history.length > 0 && viewTab === 'history' && (
            <button
              onClick={() => {
                setHistory([]);
                saveStoredTranslations(currentUser.username, []);
              }}
              className="text-xs text-rose-500 hover:underline cursor-pointer"
            >
              Clear History
            </button>
          )}
        </div>

        {/* Translation Items List */}
        <div className="space-y-3">
          {(viewTab === 'history' ? history : history.filter((h) => h.isFavorite)).length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              {viewTab === 'history'
                ? 'No recent translations yet. Enter text or speak into the microphone above.'
                : 'No favorite phrases saved yet. Click the star icon to pin favorites!'}
            </p>
          ) : (
            (viewTab === 'history' ? history : history.filter((h) => h.isFavorite)).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start justify-between gap-3 group hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
              >
                <div
                  className="space-y-1 min-w-0 cursor-pointer flex-1"
                  onClick={() => {
                    setInputText(item.text);
                    setTranslatedText(item.translatedText);
                    setPronunciation(item.pronunciation);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.sourceLang} → {item.targetLang}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    "{item.text}"
                  </p>
                  <p
                    className={`text-base font-bold text-slate-900 dark:text-white ${
                      item.targetLang.toLowerCase() === 'urdu'
                        ? 'font-urdu'
                        : item.targetLang.toLowerCase() === 'arabic'
                        ? 'font-arabic'
                        : ''
                    }`}
                    dir={
                      item.targetLang.toLowerCase() === 'urdu' ||
                      item.targetLang.toLowerCase() === 'arabic' ||
                      item.targetLang.toLowerCase() === 'persian'
                        ? 'rtl'
                        : 'ltr'
                    }
                  >
                    {item.translatedText}
                  </p>
                  {item.pronunciation && (
                    <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                      [{item.pronunciation}]
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleFavorite(item.translatedText)}
                    title="Toggle favorite"
                    className="p-2 rounded-lg text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        item.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => {
                      const matched = SUPPORTED_LANGUAGES.find(
                        (l) => l.name.toLowerCase() === item.targetLang.toLowerCase()
                      );
                      handleSpeak(item.translatedText, matched?.voiceCode || 'en-US');
                    }}
                    title="Listen"
                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      const filtered = history.filter((h) => h.id !== item.id);
                      setHistory(filtered);
                      saveStoredTranslations(currentUser.username, filtered);
                    }}
                    title="Delete"
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
