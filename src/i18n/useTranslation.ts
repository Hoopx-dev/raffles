'use client';

import en from './locales/en.json';

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
  const t = en as Translations;

  // Function to get translation by dot notation path
  const translate = (path: string): string => {
    return getNestedValue(t as unknown as Record<string, unknown>, path);
  };

  return { t, locale: 'en' as const, translate };
}

// Direct access for non-hook contexts
export function getTranslation() {
  return en;
}
