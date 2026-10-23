import React, { useState } from 'react';
import {
  Globe,
  BookOpen,
  Languages,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Flame,
  Sparkles,
  Users,
} from 'lucide-react';
import { UserAccount } from '../types';
import { getLanguageById } from '../data/languages';

interface NavbarProps {
  currentUser: UserAccount | null;
  currentRoute: string;
  navigate: (route: string) => void;
  onLogout: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRoute,
  navigate,
  onLogout,
  isDark,
  toggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedLanguage = currentUser?.selectedLanguageId
    ? getLanguageById(currentUser.selectedLanguageId)
    : null;

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Globe },
    { id: 'levels', label: 'Learn', icon: BookOpen },
    { id: 'translator', label: 'Translator', icon: Languages },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = (routeId: string) => {
    navigate(routeId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/85 border-b border-slate-200/60 dark:border-slate-800/80 transition-colors shadow-xs">
      {/* Top collaboration ticker marquee on mobile */}
      <div className="lg:hidden w-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/10 border-b border-slate-200/50 dark:border-slate-800/50 py-1 px-2 text-center overflow-hidden">
        <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate">
          ✨ Collaboration by <span className="font-bold text-indigo-600 dark:text-indigo-400">Sarmad</span> And <span className="font-bold text-purple-600 dark:text-purple-400">Shahmeer Malik</span> And <span className="font-bold text-teal-600 dark:text-teal-400">Tayyab Tahir</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <button
          onClick={() => navigate(currentUser ? 'dashboard' : 'auth')}
          className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-hidden shrink-0"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <Languages className="w-5 h-5 transition-transform group-hover:rotate-12" />
            <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 dark:from-indigo-400 dark:via-purple-300 dark:to-teal-300 bg-clip-text text-transparent block leading-tight">
              Sarmad Language Learning
            </span>
            <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
              Interactive Polyglot Platform
            </span>
          </div>
        </button>

        {/* Desktop Collaboration Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 text-[11px] font-medium text-slate-600 dark:text-slate-300 shadow-2xs shrink-0">
          <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>
            Collaboration by <strong className="text-indigo-600 dark:text-indigo-400 font-bold">Sarmad</strong> And <strong className="text-purple-600 dark:text-purple-400 font-bold">Shahmeer Malik</strong> And <strong className="text-teal-600 dark:text-teal-400 font-bold">Tayyab Tahir</strong>
          </span>
        </div>

        {/* Desktop Navigation */}
        {currentUser && (
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentRoute === item.id ||
                (item.id === 'levels' &&
                  (currentRoute === 'lectures' ||
                    currentRoute === 'lecture-detail' ||
                    currentRoute === 'test'));

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Action Controls & Profile Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Streak indicator if logged in */}
          {currentUser && (
            <div
              title={`${currentUser.streak?.currentStreak || 1} day study streak!`}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-bounce" />
              <span>{currentUser.streak?.currentStreak || 1}d</span>
            </div>
          )}

          {/* Active Language badge */}
          {currentUser && selectedLanguage && (
            <button
              onClick={() => navigate('languages')}
              title="Change target language"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all text-xs font-semibold cursor-pointer"
            >
              <span className="text-base leading-none">{selectedLanguage.flag}</span>
              <span className="hidden xl:inline">{selectedLanguage.name}</span>
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Desktop Logout Button */}
          {currentUser && (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          {currentUser && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {currentUser && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/70 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentRoute === item.id ||
              (item.id === 'levels' &&
                (currentRoute === 'lectures' ||
                  currentRoute === 'lecture-detail' ||
                  currentRoute === 'test'));

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => handleNavClick('languages')}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 py-2 cursor-pointer"
            >
              <span>{selectedLanguage?.flag}</span>
              <span>Change Language ({selectedLanguage?.name})</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
