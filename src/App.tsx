/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserAccount, LevelId, LectureContent, TestQuestion } from './types';
import { getCurrentUser, setCurrentSession, saveUser } from './services/storage';
import { getLanguageById } from './data/languages';
import { prefetchNextLecture } from './services/geminiService';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BackgroundEffects } from './components/BackgroundEffects';
import { AuthPage } from './pages/AuthPage';
import { LanguageSelectPage } from './pages/LanguageSelectPage';
import { DashboardPage } from './pages/DashboardPage';
import { LevelSelectPage } from './pages/LevelSelectPage';
import { LectureListPage } from './pages/LectureListPage';
import { LectureDetailPage } from './pages/LectureDetailPage';
import { TestPage } from './pages/TestPage';
import { TranslatorPage } from './pages/TranslatorPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  // Theme state with localStorage persistence
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('lingualearn_theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Current authenticated user session
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return getCurrentUser();
  });

  // Router state
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const user = getCurrentUser();
    if (!user) return 'auth';
    if (!user.selectedLanguageId) return 'languages';
    return 'dashboard';
  });

  // Navigation payload parameters
  const [routeParams, setRouteParams] = useState<{
    level?: LevelId;
    lectureNumber?: number;
    lectureTitle?: string;
    lecture?: LectureContent;
    isChangingLanguage?: boolean;
  }>({});

  // Sync dark class on <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lingualearn_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lingualearn_theme', 'light');
    }
  }, [isDark]);

  // Navigate helper
  const navigate = (route: string, params?: typeof routeParams) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRouteParams(params || {});
    setCurrentRoute(route);
  };

  // Preload Basic level first lecture and quiz in the background
  const preloadBasicFirstLecture = (langId?: string) => {
    const targetId = langId || currentUser?.selectedLanguageId;
    if (!targetId) return;
    const lang = getLanguageById(targetId);
    prefetchNextLecture({
      languageName: lang.name,
      level: 'basic',
      lectureNumber: 1,
      lectureTitle: 'Greetings & Introductions',
    });
  };

  // Preload on app startup if already logged in with a language
  useEffect(() => {
    if (currentUser?.selectedLanguageId) {
      preloadBasicFirstLecture(currentUser.selectedLanguageId);
    }
  }, [currentUser?.selectedLanguageId]);

  // Auth success callback
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    if (!user.selectedLanguageId) {
      setCurrentRoute('languages');
    } else {
      preloadBasicFirstLecture(user.selectedLanguageId);
      setCurrentRoute('dashboard');
    }
  };

  // Language choice callback
  const handleLanguageChosen = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    if (updatedUser.selectedLanguageId) {
      preloadBasicFirstLecture(updatedUser.selectedLanguageId);
    }
    setCurrentRoute('levels');
  };

  // Test completed & saved callback
  const handleTestSaved = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
  };

  // Logout callback
  const handleLogout = () => {
    setCurrentSession(null);
    setCurrentUser(null);
    setCurrentRoute('auth');
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div className={`min-h-screen relative flex flex-col transition-colors duration-500 text-slate-900 dark:text-white ${isDark ? 'dark' : ''}`}>
      {/* Background Animated Gradient & Floating Multilingual Glyphs */}
      <BackgroundEffects isDark={isDark} />

      {/* Persistent Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentRoute={currentRoute}
        navigate={navigate}
        onLogout={handleLogout}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {/* Main Page Content Area */}
      <main className="flex-1 relative z-10">
        {/* 1. AUTHENTICATION (NO EMAIL) */}
        {(!currentUser || currentRoute === 'auth') && (
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        )}

        {/* 2. LANGUAGE SELECTION */}
        {currentUser && currentRoute === 'languages' && (
          <LanguageSelectPage
            currentUser={currentUser}
            onLanguageChosen={handleLanguageChosen}
            isChangingLanguage={!!routeParams.isChangingLanguage}
          />
        )}

        {/* 3. HOME DASHBOARD */}
        {currentUser && currentRoute === 'dashboard' && (
          <DashboardPage currentUser={currentUser} navigate={navigate} />
        )}

        {/* 4. LEVEL SELECTION (BASIC, ADVANCED, PRO) */}
        {currentUser && currentRoute === 'levels' && (
          <LevelSelectPage currentUser={currentUser} navigate={navigate} />
        )}

        {/* 5. LECTURES LIST SYLLABUS */}
        {currentUser && currentRoute === 'lectures' && (
          <LectureListPage
            currentUser={currentUser}
            level={routeParams.level || 'basic'}
            navigate={navigate}
          />
        )}

        {/* 6. LECTURE DETAIL PAGE WITH VOCAB TABLE, TTS, SENTENCES & TIP */}
        {currentUser && currentRoute === 'lecture-detail' && (
          <LectureDetailPage
            currentUser={currentUser}
            level={routeParams.level || 'basic'}
            lectureNumber={routeParams.lectureNumber || 1}
            navigate={navigate}
          />
        )}

        {/* 7. LECTURE TEST & QUIZ RUNNER */}
        {currentUser && currentRoute === 'test' && (
          <TestPage
            currentUser={currentUser}
            level={routeParams.level || 'basic'}
            lectureNumber={routeParams.lectureNumber || 1}
            lectureTitle={routeParams.lectureTitle || 'Lecture Assessment'}
            lecture={routeParams.lecture!}
            initialQuiz={(routeParams as any).initialQuiz}
            onTestSaved={handleTestSaved}
            navigate={navigate}
          />
        )}

        {/* 8. TRANSLATOR PAGE (SPEECH & TEXT) */}
        {currentUser && currentRoute === 'translator' && (
          <TranslatorPage currentUser={currentUser} />
        )}

        {/* 9. USER PROFILE & BADGES */}
        {currentUser && currentRoute === 'profile' && (
          <ProfilePage currentUser={currentUser} navigate={navigate} />
        )}
      </main>

      {/* Footer Credits on every page */}
      <Footer />
    </div>
  );
}
