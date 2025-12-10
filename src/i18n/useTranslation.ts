'use client';

import { useUIStore } from '@/lib/store/useUIStore';
import en from './locales/en.json';
import cn from './locales/cn.json';

const translations = { en, cn } as const;

type Translations = typeof en;

// Helper to get nested value from object using dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path; // Return the path if not found
    }
  }

  return typeof result === 'string' ? result : path;
}

export function useTranslation() {
  const locale = useUIStore((state) => state.locale);
  const t = translations[locale] as Translations;

  // Function to get translation by dot notation path
  const translate = (path: string): string => {
    return getNestedValue(t as unknown as Record<string, unknown>, path);
  };

  return { t, locale, translate };
}

// Direct access for non-hook contexts
export function getTranslation(locale: 'en' | 'cn') {
  return translations[locale];
}
