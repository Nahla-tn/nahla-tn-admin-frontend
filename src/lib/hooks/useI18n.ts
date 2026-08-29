'use client';

import { useLanguageContext } from '@/components/providers/LanguageProvider';

export function useI18n() {
  return useLanguageContext();
}