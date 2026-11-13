'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function ThemeToggle() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    setDark(next);
    try { localStorage.setItem('autocare-theme', next ? 'dark' : 'light'); } catch {}
  }

  if (pathname === '/') return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      <span>{dark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
