'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Locale, translations } from '@/lib/i18n/translations';

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

function getNestedValue(obj: Record<string, any>, path: string): string {
  const value = path.split('.').reduce((acc: any, part) => acc?.[part], obj);
  return typeof value === 'string' ? value : path;
}

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    const stored = localStorage.getItem('locale') as Locale | null;
    if (stored === 'fr' || stored === 'en') {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    localStorage.setItem('locale', nextLocale);
  };

  const t = (key: string) => {
    return getNestedValue(translations[locale], key);
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      'useLanguageContext must be used within a LanguageProvider',
    );
  }

  return context;
}