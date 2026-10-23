import React, { useMemo } from 'react';

// Multilingual glyphs drifting upward (maximum 8 lightweight items for peak performance)
const GLYPHS = ['A', 'あ', 'ع', 'Ж', '你好', 'Hello', 'Hola', 'Bonjour'];

export const BackgroundEffects: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  // Exactly 8 items maximum to avoid CPU/GPU overhead on mobile devices
  const floatingItems = useMemo(() => {
    return Array.from({ length: 8 }).map((_, idx) => {
      const glyph = GLYPHS[idx % GLYPHS.length];
      const left = idx * 12 + 6; // evenly spaced 6% to 90%
      const duration = 22 + (idx % 4) * 6; // 22s to 40s slow smooth drift
      const delay = (idx * 2.3) % 12; // staggered start
      const size = 18 + (idx % 3) * 6; // 18px to 30px
      const opacity = 0.2;

      return { id: idx, glyph, left, duration, delay, size, opacity };
    });
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Animated gradient layer - uses CSS transform and opacity only */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDark
            ? 'bg-gradient-to-br from-slate-950 via-indigo-950/90 to-slate-900'
            : 'bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-emerald-50/60'
        }`}
      />

      {/* Ambient glow blobs - disabled on small screens to prevent mobile lag */}
      <div
        className={`hidden sm:block absolute -top-32 -left-32 w-80 h-80 rounded-full blur-2xl opacity-25 will-change-transform ${
          isDark ? 'bg-indigo-600/30' : 'bg-indigo-300/40'
        }`}
      />
      <div
        className={`hidden sm:block absolute top-1/3 -right-24 w-72 h-72 rounded-full blur-2xl opacity-20 will-change-transform ${
          isDark ? 'bg-purple-600/30' : 'bg-purple-300/40'
        }`}
      />

      {/* Maximum 8 floating multilingual glyphs with transform-only animations */}
      {floatingItems.map((item) => (
        <span
          key={item.id}
          className="floating-glyph font-bold select-none text-indigo-400/30 dark:text-indigo-300/25 will-change-transform"
          style={{
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            opacity: item.opacity,
          }}
        >
          {item.glyph}
        </span>
      ))}
    </div>
  );
};
