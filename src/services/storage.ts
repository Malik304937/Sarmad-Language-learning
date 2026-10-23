import {
  UserAccount,
  LanguageProgress,
  LevelId,
  TestResultRecord,
  TranslationItem,
} from '../types';

const STORAGE_USERS_KEY = 'lingualearn_users_v1';
const STORAGE_CURRENT_SESSION_KEY = 'lingualearn_session_v1';
const STORAGE_LECTURE_CACHE_KEY = 'lingualearn_lecture_cache_v1';
const STORAGE_TRANSLATIONS_KEY = 'lingualearn_translations_v1';

// Secret question options
export const SECRET_QUESTIONS = [
  "What is your first school's name?",
  "What is your favorite food?",
  "What is your best friend's name?",
  "What was the name of your first pet?",
  "In what city were you born?",
  "What is your favorite movie?",
];

// Secure client-side SHA-256 hashing using standard Web Crypto API
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Get all stored users from localStorage
export function getAllUsers(): Record<string, UserAccount> {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error reading users from storage:', e);
    return {};
  }
}

// Save all users
export function saveAllUsers(users: Record<string, UserAccount>): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to storage:', e);
  }
}

// Get current active logged-in user
export function getCurrentUser(): UserAccount | null {
  try {
    const currentUsername = localStorage.getItem(STORAGE_CURRENT_SESSION_KEY);
    if (!currentUsername) return null;
    const users = getAllUsers();
    return users[currentUsername.toLowerCase()] || null;
  } catch (e) {
    console.error('Error reading current session:', e);
    return null;
  }
}

// Set active session
export function setCurrentSession(username: string | null): void {
  if (username) {
    localStorage.setItem(STORAGE_CURRENT_SESSION_KEY, username.toLowerCase());
  } else {
    localStorage.removeItem(STORAGE_CURRENT_SESSION_KEY);
  }
}

// Update specific user record
export function saveUser(user: UserAccount): void {
  const users = getAllUsers();
  users[user.username.toLowerCase()] = user;
  saveAllUsers(users);
}

// Format today's date in YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Update streak when user completes learning action
export function calculateUpdatedStreak(user: UserAccount): UserAccount {
  const today = getTodayDateString();
  const streak = user.streak || { currentStreak: 0, longestStreak: 0, lastActivityDate: '' };

  if (streak.lastActivityDate === today) {
    // Already studied today
    return user;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newCurrent = 1;
  if (streak.lastActivityDate === yesterdayStr) {
    newCurrent = streak.currentStreak + 1;
  }

  const newLongest = Math.max(streak.longestStreak, newCurrent);

  const updatedUser: UserAccount = {
    ...user,
    streak: {
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastActivityDate: today,
    },
  };

  saveUser(updatedUser);
  return updatedUser;
}

// Register new user
export async function registerUser(params: {
  username: string;
  password: string;
  secretQuestion: string;
  secretAnswer: string;
}): Promise<{ success: boolean; error?: string; user?: UserAccount }> {
  const username = params.username.trim();
  const password = params.password.trim();
  const secretQuestion = params.secretQuestion.trim();
  const secretAnswer = params.secretAnswer.trim();

  if (username.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { success: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }
  if (!secretQuestion) {
    return { success: false, error: 'Please choose a security question.' };
  }
  if (!secretAnswer) {
    return { success: false, error: 'Please provide an answer to the security question.' };
  }

  const users = getAllUsers();
  const lowerKey = username.toLowerCase();
  if (users[lowerKey]) {
    return { success: false, error: 'Username already taken. Please choose another.' };
  }

  const passwordHash = await hashString(password);
  const secretAnswerHash = await hashString(secretAnswer.toLowerCase());

  const newUser: UserAccount = {
    username,
    passwordHash,
    secretQuestion,
    secretAnswerHash,
    selectedLanguageId: undefined,
    languageProgress: {},
    testHistory: [],
    badges: [],
    streak: {
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: getTodayDateString(),
    },
    createdAt: new Date().toISOString(),
  };

  users[lowerKey] = newUser;
  saveAllUsers(users);
  setCurrentSession(username);

  return { success: true, user: newUser };
}

// Authenticate existing user
export async function loginUser(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string; user?: UserAccount }> {
  const username = usernameInput.trim();
  const password = passwordInput.trim();

  if (!username || !password) {
    return { success: false, error: 'Please enter both username and password.' };
  }

  const users = getAllUsers();
  const user = users[username.toLowerCase()];
  if (!user) {
    return { success: false, error: 'Invalid username or password.' };
  }

  const inputHash = await hashString(password);
  if (inputHash !== user.passwordHash) {
    return { success: false, error: 'Invalid username or password.' };
  }

  // Update session
  setCurrentSession(user.username);
  const streakUpdatedUser = calculateUpdatedStreak(user);

  return { success: true, user: streakUpdatedUser };
}

// Reset password via secret question flow
export async function resetPasswordWithSecurityQuestion(params: {
  username: string;
  secretAnswer: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  const username = params.username.trim();
  const secretAnswer = params.secretAnswer.trim();
  const newPassword = params.newPassword.trim();

  if (!username) {
    return { success: false, error: 'Please enter your username.' };
  }
  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  const users = getAllUsers();
  const user = users[username.toLowerCase()];
  if (!user) {
    return { success: false, error: 'No account found with this username.' };
  }

  const answerHash = await hashString(secretAnswer.toLowerCase());
  if (answerHash !== user.secretAnswerHash) {
    return { success: false, error: 'Incorrect answer to security question.' };
  }

  const newPasswordHash = await hashString(newPassword);
  user.passwordHash = newPasswordHash;
  saveUser(user);

  return { success: true };
}

// Get security question for username (for forgot password prompt)
export function getSecurityQuestionForUser(username: string): string | null {
  const users = getAllUsers();
  const user = users[username.trim().toLowerCase()];
  return user ? user.secretQuestion : null;
}

// Set selected language for current user
export function setSelectedLanguage(user: UserAccount, languageId: string): UserAccount {
  const updatedUser: UserAccount = {
    ...user,
    selectedLanguageId: languageId,
  };

  if (!updatedUser.languageProgress[languageId]) {
    updatedUser.languageProgress[languageId] = {
      languageId,
      currentLevel: 'basic',
      completedLectures: {},
    };
  }

  saveUser(updatedUser);
  return updatedUser;
}

// Get progress for a language
export function getLanguageProgress(
  user: UserAccount,
  languageId?: string
): LanguageProgress {
  const langId = languageId || user.selectedLanguageId || 'spanish';
  return (
    user.languageProgress[langId] || {
      languageId: langId,
      currentLevel: 'basic',
      completedLectures: {},
    }
  );
}

// Save test result and unlock progress
export function recordTestCompletion(
  user: UserAccount,
  record: TestResultRecord
): { updatedUser: UserAccount; newBadges: string[] } {
  const langId = record.languageId;
  const progress = getLanguageProgress(user, langId);
  const lectureKey = `${record.level}_${record.lectureNumber}`;

  const existingItem = progress.completedLectures[lectureKey];
  const attempts = (existingItem?.attempts || 0) + 1;
  const bestScore = Math.max(existingItem?.bestScore || 0, record.score);

  const updatedProgress: LanguageProgress = {
    ...progress,
    completedLectures: {
      ...progress.completedLectures,
      [lectureKey]: {
        passed: (existingItem?.passed || false) || record.passed,
        bestScore,
        totalQuestions: record.totalQuestions,
        attempts,
        completedAt: new Date().toISOString(),
      },
    },
    lastActiveLecture: {
      level: record.level,
      lectureNumber: record.lectureNumber,
    },
  };

  // Check level unlocks
  // Basic has 10 lectures, Advanced has 5 lectures
  const completedKeys = Object.keys(updatedProgress.completedLectures).filter(
    (k) => updatedProgress.completedLectures[k].passed
  );
  const basicCount = completedKeys.filter((k) => k.startsWith('basic_')).length;
  const advancedCount = completedKeys.filter((k) => k.startsWith('advanced_')).length;

  if (advancedCount >= 5) {
    updatedProgress.currentLevel = 'pro';
  } else if (basicCount >= 10) {
    updatedProgress.currentLevel = 'advanced';
  } else {
    updatedProgress.currentLevel = 'basic';
  }

  // Badges check
  const newBadges: string[] = [];
  const currentBadges = new Set(user.badges || []);

  if (!currentBadges.has('First Lesson')) {
    newBadges.push('First Lesson');
    currentBadges.add('First Lesson');
  }

  if (record.passed && !currentBadges.has('First Test Passed')) {
    newBadges.push('First Test Passed');
    currentBadges.add('First Test Passed');
  }

  if (basicCount >= 10 && !currentBadges.has('Basic Completed')) {
    newBadges.push('Basic Completed');
    currentBadges.add('Basic Completed');
  }

  if (advancedCount >= 5 && !currentBadges.has('Advanced Completed')) {
    newBadges.push('Advanced Completed');
    currentBadges.add('Advanced Completed');
  }

  const proCount = completedKeys.filter((k) => k.startsWith('pro_')).length;
  if (proCount >= 3 && !currentBadges.has('Pro Completed')) {
    newBadges.push('Pro Completed');
    currentBadges.add('Pro Completed');
  }

  // Streak update
  const withStreak = calculateUpdatedStreak(user);

  const updatedUser: UserAccount = {
    ...withStreak,
    languageProgress: {
      ...withStreak.languageProgress,
      [langId]: updatedProgress,
    },
    testHistory: [record, ...(withStreak.testHistory || [])].slice(0, 50),
    badges: Array.from(currentBadges),
  };

  saveUser(updatedUser);
  return { updatedUser, newBadges };
}

// Client-side lecture cache manager to prevent refetching
export function getCachedLecture(key: string): any | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_LECTURE_CACHE_KEY}_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setCachedLecture(key: string, data: any): void {
  try {
    localStorage.setItem(`${STORAGE_LECTURE_CACHE_KEY}_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to cache lecture in localStorage', e);
  }
}

// Translation history and favorites management
export function getStoredTranslations(username: string): TranslationItem[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_TRANSLATIONS_KEY}_${username.toLowerCase()}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredTranslations(username: string, items: TranslationItem[]): void {
  try {
    localStorage.setItem(
      `${STORAGE_TRANSLATIONS_KEY}_${username.toLowerCase()}`,
      JSON.stringify(items.slice(0, 50))
    );
  } catch (e) {
    console.error('Failed to store translations', e);
  }
}
