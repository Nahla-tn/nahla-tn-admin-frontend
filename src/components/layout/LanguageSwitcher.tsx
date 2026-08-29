'use client';

import { useI18n } from '@/lib/hooks/useI18n';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200/90 bg-white/90 p-1 shadow-xs backdrop-blur-md">
      <div className="flex h-6 w-6 items-center justify-center text-slate-400 pl-1">
        <Globe size={13} className="text-slate-400" />
      </div>

      <button
        type="button"
        onClick={() => setLocale('fr')}
        className={`rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
          locale === 'fr'
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        FR
      </button>

      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
          locale === 'en'
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        EN
      </button>
    </div>
  );
}