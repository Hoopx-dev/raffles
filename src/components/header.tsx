'use client';

import Image from 'next/image';
import { useUIStore } from '@/lib/store/useUIStore';
import { useTranslation } from '@/i18n/useTranslation';

export function Header() {
  const { locale, setLocale } = useUIStore();
  const { t } = useTranslation();

  return (
    <header className="relative">
      {/* Content */}
      <div className="relative z-10 px-4 pt-2 pb-6">
        {/* Language toggle */}
        <div className="flex justify-end -mb-2">
          <button
            onClick={() => setLocale(locale === 'en' ? 'cn' : 'en')}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer"
          >
            {locale === 'en' ? '中文' : 'EN'}
          </button>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center">
          <Image
            src="/images/heading.png"
            alt="NBA Christmas 2025"
            width={336}
            height={168}
            priority
            className="object-contain animate-float"
          />

          {/* Subtitle */}
          <h1 className="text-white/90 text-lg font-medium mt-2">
            {t.header.subtitle}
          </h1>
        </div>
      </div>
    </header>
  );
}
